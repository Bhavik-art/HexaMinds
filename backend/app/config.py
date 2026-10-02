from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Groq
    groq_api_key: str
    groq_model: str = "qwen/qwen3.8-27b"

    # Supabase
    supabase_url: str
    supabase_key: str

    # GitHub
    github_token: str = ""

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    frontend_url: str = ""

    # Evidence Engine Thresholds
    evidence_proven_threshold: int = 80
    evidence_partial_threshold: int = 40

    # GitHub Analysis
    max_repos_to_analyze: int = 15
    github_cache_ttl_minutes: int = 60


    @property
    def cors_origins_list(self) -> List[str]:
        origins = [*self.cors_origins.split(","), self.frontend_url]
        return list(dict.fromkeys(
            origin.strip().rstrip("/")
            for origin in origins
            if origin.strip()
        ))

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
