"""
SkillProof Backend — FastAPI application entry point.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.config import settings
from app.api import resume, github, skills, jobs

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SkillProof API",
    description=(
        "Backend for SkillProof: validates developer skills via "
        "resume parsing, GitHub evidence scoring, and AI-powered job matching."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── GZip compression ──────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Routers ───────────────────────────────────
app.include_router(resume.router)
app.include_router(github.router)
app.include_router(skills.router)
app.include_router(jobs.router)


# ── Health check ──────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    """Liveness probe — checks API is up and config is loaded."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "supabase_url": settings.supabase_url.split(".")[0] + ".supabase.co",
        "groq_configured": bool(settings.groq_api_key),
        "github_authenticated": bool(settings.github_token),
        "evidence_thresholds": {
            "proven": settings.evidence_proven_threshold,
            "partial": settings.evidence_partial_threshold,
        },
    }


# ── Root ──────────────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    return {"message": "SkillProof API is running. Visit /docs for API reference."}
