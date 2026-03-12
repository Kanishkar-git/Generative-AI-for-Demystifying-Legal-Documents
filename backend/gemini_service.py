"""
Google Gemini AI service using the new google-genai SDK.
"""
from google import genai
from google.genai import types
import logging
from config import get_settings

logger = logging.getLogger(__name__)

# ── Prompts ───────────────────────────────────────────────────────────────────

SUMMARY_PROMPT = """You are LegalClear AI, an expert legal document analyst.
Your role is to demystify legal documents for everyday people who are not lawyers.

Analyze the following legal document and provide:

1. **Document Type** - What kind of document is this? (e.g., Rental Agreement, Loan Contract, Employment Contract, Terms of Service, NDA, etc.)

2. **Plain-English Summary** - A 3-5 sentence summary a 10th-grader could understand.

3. **Key Parties** - Who are the main parties involved and their roles?

4. **Critical Dates & Deadlines** - Important dates, durations, and time-sensitive clauses.

5. **Key Terms & Conditions** - The most important obligations and rights for each party.

6. **⚠️ Risk Flags** - Unusual, unfavorable, or potentially harmful clauses highlighted with severity (High/Medium/Low).

7. **Financial Summary** - All monetary amounts, fees, penalties, and payment terms.

8. **Your Rights** - What protections and rights does the document grant you?

9. **Actionable Advice** - 3-5 practical steps the user should consider before signing.

Format your response using clear markdown with headers, bullet points, and emojis where appropriate.
Be thorough but use simple, everyday language. Avoid legal jargon.

LEGAL DOCUMENT:
{document_text}
"""

CLAUSE_EXPLAIN_PROMPT = """You are LegalClear AI, a friendly legal document explainer.

A user has highlighted this specific clause from a legal document and needs it explained:

CLAUSE:
"{clause}"

CONTEXT FROM DOCUMENT:
{context}

Please provide:
1. **What this means in plain English** - Explain it simply as if talking to a friend
2. **Why this clause exists** - What purpose does it serve for each party?
3. **Impact on you** - How does this affect your rights, obligations, or money?
4. **⚠️ Red flags** - Is this clause unusual, unfair, or potentially harmful? Rate: Safe / Caution / Red Flag
5. **Negotiation tip** - Is this typically negotiable? What could you ask for instead?

Keep your explanation friendly, clear, and practical. Use simple language."""

QA_PROMPT = """You are LegalClear AI, a helpful assistant. 
Answer the question based ONLY on the provided context. 
Keep your answer SIMPLE, DIRECT, and SHORT (max 2-3 sentences).
If you don't know the answer, say "I couldn't find that in the document."

CONTEXT:
{context}

USER QUESTION: {question}

Answer:"""

RISK_ANALYSIS_PROMPT = """You are LegalClear AI, a legal risk analyst specializing in consumer protection.

Analyze this legal document for risks that a non-lawyer would miss:

DOCUMENT:
{document_text}

Provide a structured risk analysis:

## 🔴 HIGH RISK Clauses
List clauses that could result in significant financial loss, loss of rights, or serious harm.

## 🟡 MEDIUM RISK Clauses  
List clauses that are unfavorable but manageable with awareness.

## 🟢 LOW RISK / STANDARD Clauses
List clauses that are typical and generally fair.

## 💡 Overall Risk Score
Rate the document overall: LOW / MEDIUM / HIGH / VERY HIGH risk
Explain your rating in 2-3 sentences.

## 🎯 Top 5 Things to Watch Out For
Number them 1-5 in order of importance.

Use simple language. Be specific about which clause/section you're referring to."""


class GeminiService:
    """Service layer wrapping the new google-genai SDK for legal document analysis."""

    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            settings = get_settings()
            api_key = settings.google_api_key
            if not api_key or api_key == "your_google_gemini_api_key_here":
                raise ValueError(
                    "GOOGLE_API_KEY is not set. Please add it to backend/.env"
                )
            self._client = genai.Client(api_key=api_key)
        return self._client

    def _get_model(self) -> str:
        return get_settings().gemini_model

    def _call_gemini(self, prompt: str, temperature: float = 0.3) -> str:
        client = self._get_client()
        model = self._get_model()
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=8192,
                ),
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise RuntimeError(f"AI generation failed: {str(e)}")

    def summarize_document(self, document_text: str) -> str:
        max_chars = 80000
        truncated = document_text[:max_chars]
        if len(document_text) > max_chars:
            truncated += "\n\n[Document truncated for analysis]"
        prompt = SUMMARY_PROMPT.format(document_text=truncated)
        return self._call_gemini(prompt, temperature=0.2)

    def explain_clause(self, clause: str, context: str) -> str:
        prompt = CLAUSE_EXPLAIN_PROMPT.format(
            clause=clause,
            context=context[:5000],
        )
        return self._call_gemini(prompt, temperature=0.3)

    def answer_question(self, question: str, context_chunks: list[str]) -> str:
        context = "\n\n---\n\n".join(context_chunks[:6])
        prompt = QA_PROMPT.format(context=context, question=question)
        return self._call_gemini(prompt, temperature=0.4)

    def embed_chunks(self, chunks: list[str]) -> list[list[float]]:
        """Generate embeddings for a list of text chunks."""
        client = self._get_client()
        try:
            # Note: text-embedding-004 is current SOTA for Gemini embeddings
            response = client.models.embed_content(
                model="text-embedding-004",
                contents=chunks,
                config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
            )
            return [e.values for e in response.embeddings]
        except Exception as e:
            logger.error(f"Gemini Embedding error: {e}")
            raise RuntimeError(f"Embedding generation failed: {str(e)}")

    def embed_query(self, query: str) -> list[float]:
        """Generate embedding for a single query."""
        client = self._get_client()
        try:
            response = client.models.embed_content(
                model="text-embedding-004",
                contents=query,
                config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
            )
            return response.embeddings[0].values
        except Exception as e:
            logger.error(f"Gemini Query Embedding error: {e}")
            raise RuntimeError(f"Query embedding generation failed: {str(e)}")

    def analyze_risks(self, document_text: str) -> str:
        max_chars = 60000
        truncated = document_text[:max_chars]
        prompt = RISK_ANALYSIS_PROMPT.format(document_text=truncated)
        return self._call_gemini(prompt, temperature=0.2)

    def is_api_key_set(self) -> bool:
        key = get_settings().google_api_key
        return bool(key and key != "your_google_gemini_api_key_here")


# Singleton
gemini_service = GeminiService()
