from pydantic_settings import BaseSettings
from pydantic import field_validator
import os
from pathlib import Path

# Resolve .env path absolutely — no matter where uvicorn is launched from
_ENV_FILE = Path(__file__).parent / ".env"

class Settings(BaseSettings):
    google_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    pinecone_api_key: str = ""
    pinecone_index: str = "legal-clear"
    pinecone_environment: str = ""  # For older pinecone versions if needed
    max_file_size_mb: int = 10
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    model_config = {
        "env_file": str(_ENV_FILE),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

# Directories
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# No lru_cache — always read fresh from .env on import
def get_settings() -> Settings:
    return Settings()
