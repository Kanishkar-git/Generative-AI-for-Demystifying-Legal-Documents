"""
LegalClear AI — FastAPI application entry point.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn

from config import get_settings
from routes import router

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── Settings ───────────────────────────────────────────────────────────────────
settings = get_settings()

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="LegalClear AI",
    description="Demystifying legal documents using Google Gemini AI",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────────────────────────
app.include_router(router)


@app.get("/")
async def root():
    return {
        "message": "LegalClear AI Backend is running",
        "docs": "/api/docs",
        "health": "/api/health",
    }


# ── Startup ────────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 LegalClear AI starting up...")
    from gemini_service import gemini_service
    if gemini_service.is_api_key_set():
        logger.info("✅ Google Gemini API key is configured")
    else:
        logger.warning("⚠️  GOOGLE_API_KEY not set — AI features will be disabled")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
