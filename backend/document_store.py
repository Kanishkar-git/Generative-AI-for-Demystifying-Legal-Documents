import logging
import uuid
import os
import json
from pathlib import Path
from typing import Optional
from pinecone import Pinecone, ServerlessSpec
from config import get_settings
from gemini_service import gemini_service

logger = logging.getLogger(__name__)

# Persistence directory (moved outside backend to prevent uvicorn reload on file write)
DATA_DIR = Path(__file__).parent.parent / "data" / "docs"
DATA_DIR.mkdir(parents=True, exist_ok=True)


class DocumentStore:
    """Stores processed documents and enables similarity search using Pinecone and Gemini Embeddings.
    Includes local disk persistence for metadata to survive server reloads.
    """

    def __init__(self):
        settings = get_settings()
        self.api_key = settings.pinecone_api_key
        self.index_name = settings.pinecone_index
        self._pc = None
        self._index = None
        
        # Load existing docs from disk
        self._docs_cache: dict[str, dict] = {}
        self._load_from_disk()

    def _load_from_disk(self):
        """Load document metadata from local storage."""
        try:
            for file_path in DATA_DIR.glob("*.json"):
                with open(file_path, "r", encoding="utf-8") as f:
                    doc = json.load(f)
                    self._docs_cache[doc["doc_id"]] = doc
            logger.info(f"Loaded {len(self._docs_cache)} documents from disk")
        except Exception as e:
            logger.error(f"Failed to load documents from disk: {e}")

    def _save_to_disk(self, doc_id: str, doc_data: dict):
        """Save document metadata to local storage."""
        try:
            file_path = DATA_DIR / f"{doc_id}.json"
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(doc_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to save document {doc_id} to disk: {e}")

    def _get_index(self):
        if self._index is None:
            if not self.api_key or self.api_key == "your_pinecone_api_key_here":
                logger.warning("Pinecone API key is missing or using placeholder. Semantic search will be disabled.")
                return None
            
            try:
                self._pc = Pinecone(api_key=self.api_key)
                
                # Check if index exists, create if not
                existing_indexes = [idx.name for idx in self._pc.list_indexes()]
                if self.index_name not in existing_indexes:
                    logger.info(f"Creating Pinecone index: {self.index_name}")
                    self._pc.create_index(
                        name=self.index_name,
                        dimension=768, # Gemini text-embedding-004 dimension
                        metric="cosine",
                        spec=ServerlessSpec(cloud="aws", region="us-east-1")
                    )
                
                self._index = self._pc.Index(self.index_name)
            except Exception as e:
                logger.error(f"Failed to initialize Pinecone: {e}")
                return None
        return self._index

    def store(
        self,
        filename: str,
        full_text: str,
        chunks: list[str],
        metadata: dict = None,
    ) -> str:
        doc_id = str(uuid.uuid4())
        
        # 1. Always update local cache and save to disk first
        doc_data = {
            "doc_id": doc_id,
            "filename": filename,
            "full_text": full_text,
            "chunks": chunks,
            "metadata": metadata or {},
        }
        self._docs_cache[doc_id] = doc_data
        self._save_to_disk(doc_id, doc_data)
        logger.info(f"Saved document {doc_id} to local disk cache")

        index = self._get_index()
        if not index:
            logger.warning(f"Pinecone index not available. Document {doc_id} stored locally only.")
            return doc_id

        try:
            # 2. Generate embeddings for all chunks
            logger.info(f"Generating embeddings for {len(chunks)} chunks...")
            embeddings = gemini_service.embed_chunks(chunks)
            
            # 3. Prepare vectors for Pinecone
            vectors = []
            for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
                vector_id = f"{doc_id}_{i}"
                vectors.append({
                    "id": vector_id,
                    "values": emb,
                    "metadata": {
                        "doc_id": doc_id,
                        "filename": filename,
                        "text": chunk,
                        **(metadata or {})
                    }
                })
            
            # 4. Upsert to Pinecone (in batches of 100)
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                index.upsert(vectors=vectors[i:i + batch_size])
            
            logger.info(f"Successfully indexed document {doc_id} in Pinecone")
        except Exception as e:
            logger.error(f"Error indexing document {doc_id} in Pinecone: {e}")
            
        return doc_id

    def get(self, doc_id: str) -> Optional[dict]:
        return self._docs_cache.get(doc_id)

    def get_full_text(self, doc_id: str) -> Optional[str]:
        doc = self._docs_cache.get(doc_id)
        return doc["full_text"] if doc else None

    def search(self, doc_id: str, query: str, top_k: int = 5) -> list[str]:
        """Return top_k most relevant chunks using semantic search in Pinecone."""
        index = self._get_index()
        if not index:
            logger.warning("Pinecone index not available. Falling back to empty results.")
            return []

        try:
            # 1. Embed the query
            query_vector = gemini_service.embed_query(query)
            
            # 2. Search Pinecone
            # Filter by doc_id to search within only one document
            results = index.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True,
                filter={"doc_id": {"$eq": doc_id}}
            )
            
            # 3. Extract text from metadata
            chunks = [match.metadata["text"] for match in results.matches if "text" in match.metadata]
            return chunks
        except Exception as e:
            logger.error(f"Search failed: {e}")
            # Fallback to cache if available
            doc = self._docs_cache.get(doc_id)
            if doc:
                return doc["chunks"][:top_k]
            return []

    def list_documents(self) -> list[dict]:
        return [
            {
                "doc_id": d["doc_id"],
                "filename": d["filename"],
                "chunk_count": len(d["chunks"]),
                "metadata": d["metadata"],
            }
            for d in self._docs_cache.values()
        ]

    def delete(self, doc_id: str) -> bool:
        index = self._get_index()
        if index:
            try:
                # Pinecone can delete by ID prefix or filter (depending on version/spec)
                # Using filter is generally safer for serverless
                index.delete(filter={"doc_id": {"$eq": doc_id}})
            except Exception as e:
                logger.error(f"Failed to delete from Pinecone: {e}")
        
        if doc_id in self._docs_cache:
            del self._docs_cache[doc_id]
            # Remove from disk
            try:
                file_path = DATA_DIR / f"{doc_id}.json"
                if file_path.exists():
                    file_path.unlink()
            except Exception as e:
                logger.error(f"Failed to delete document {doc_id} from disk: {e}")
            return True
        return False


# Singleton store
document_store = DocumentStore()
