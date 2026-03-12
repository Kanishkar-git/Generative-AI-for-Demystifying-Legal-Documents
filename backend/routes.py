"""
FastAPI routes for the LegalClear AI backend.
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import logging

from document_processor import process_document
from document_store import document_store
from gemini_service import gemini_service
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/api", tags=["Legal AI"])


# ── Request/Response Models ────────────────────────────────────────────────────

class ClauseExplainRequest(BaseModel):
    doc_id: str
    clause: str

class QuestionRequest(BaseModel):
    doc_id: str
    question: str

class RiskAnalysisRequest(BaseModel):
    doc_id: str


# ── Health & Status ────────────────────────────────────────────────────────────

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "LegalClear AI",
        "gemini_configured": gemini_service.is_api_key_set(),
        "documents_loaded": len(document_store.list_documents()),
    }


@router.get("/status")
async def api_status():
    return {
        "api_key_set": gemini_service.is_api_key_set(),
        "model": settings.gemini_model,
        "max_file_mb": settings.max_file_size_mb,
    }


# ── Document Upload & Management ───────────────────────────────────────────────

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a legal document (PDF, DOCX, TXT)."""
    # Validate file type
    allowed = {".pdf", ".docx", ".doc", ".txt"}
    suffix = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if suffix not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Allowed: PDF, DOCX, TXT"
        )

    # Read and size-check
    content = await file.read()
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.max_file_size_mb}MB limit"
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        processed = process_document(content, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    doc_id = document_store.store(
        filename=file.filename,
        full_text=processed["full_text"],
        chunks=processed["chunks"],
        metadata={
            "original_name": file.filename,
            "char_count": processed["char_count"],
            "word_count": processed["word_count"],
            "chunk_count": processed["chunk_count"],
        },
    )

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "word_count": processed["word_count"],
        "char_count": processed["char_count"],
        "chunk_count": processed["chunk_count"],
        "message": "Document uploaded and processed successfully",
    }


@router.get("/documents")
async def list_documents():
    """List all uploaded documents."""
    return {"documents": document_store.list_documents()}


@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document from the store."""
    if not document_store.delete(doc_id):
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}


# ── AI Analysis Endpoints ──────────────────────────────────────────────────────

@router.post("/summarize/{doc_id}")
async def summarize_document(doc_id: str):
    """Generate a comprehensive plain-English summary of the document."""
    full_text = document_store.get_full_text(doc_id)
    if not full_text:
        raise HTTPException(status_code=404, detail="Document not found")

    if not gemini_service.is_api_key_set():
        raise HTTPException(
            status_code=503,
            detail="Google API key not configured. Please set GOOGLE_API_KEY in backend/.env"
        )

    try:
        summary = gemini_service.summarize_document(full_text)
        return {
            "doc_id": doc_id,
            "summary": summary,
            "type": "full_summary",
        }
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/explain-clause")
async def explain_clause(req: ClauseExplainRequest):
    """Explain a specific highlighted clause in plain English."""
    doc = document_store.get(req.doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not gemini_service.is_api_key_set():
        raise HTTPException(status_code=503, detail="API key not configured")

    if len(req.clause.strip()) < 10:
        raise HTTPException(status_code=400, detail="Clause text too short")

    # Get context chunks around the clause
    context_chunks = document_store.search(req.doc_id, req.clause, top_k=3)
    context = "\n\n".join(context_chunks)

    try:
        explanation = gemini_service.explain_clause(req.clause, context)
        return {
            "doc_id": req.doc_id,
            "clause": req.clause,
            "explanation": explanation,
        }
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/ask")
async def ask_question(req: QuestionRequest):
    """Answer a user question about the document using RAG."""
    doc = document_store.get(req.doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not gemini_service.is_api_key_set():
        raise HTTPException(status_code=503, detail="API key not configured")

    if len(req.question.strip()) < 3:
        raise HTTPException(status_code=400, detail="Question too short")

    relevant_chunks = document_store.search(req.doc_id, req.question, top_k=5)

    try:
        answer = gemini_service.answer_question(req.question, relevant_chunks)
        return {
            "doc_id": req.doc_id,
            "question": req.question,
            "answer": answer,
            "sources_used": len(relevant_chunks),
        }
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/analyze-risks/{doc_id}")
async def analyze_risks(doc_id: str):
    """Perform dedicated risk analysis on the document."""
    full_text = document_store.get_full_text(doc_id)
    if not full_text:
        raise HTTPException(status_code=404, detail="Document not found")

    if not gemini_service.is_api_key_set():
        raise HTTPException(status_code=503, detail="API key not configured")

    try:
        analysis = gemini_service.analyze_risks(full_text)
        return {
            "doc_id": doc_id,
            "risk_analysis": analysis,
            "type": "risk_analysis",
        }
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
