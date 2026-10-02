"""
POST /api/resume/upload
"""
import uuid
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.resume_parser import extract_text_from_pdf, clean_text
from app.services.skill_extractor import extract_skills_from_text
from app.database.client import supabase
from app.models.schemas import ResumeUploadResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/resume", tags=["Resume"])

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", response_model=ResumeUploadResponse)
def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Form(None),
):
    """
    Upload a PDF resume.
    - Parses text via PyMuPDF
    - Extracts skills via Groq
    - Persists profile, analysis, resume, and analysis_skills to Supabase
    Returns extracted skill list and IDs.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = file.file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Max size is 10 MB.")

    # ── Extract text ──────────────────────────
    try:
        raw_text = extract_text_from_pdf(file_bytes)
        raw_text = clean_text(raw_text)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # ── Extract skills via Groq ────────────────
    try:
        extracted_skills = extract_skills_from_text(raw_text)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=f"AI extraction error: {exc}")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # ── Persist to Supabase ────────────────────
    # 1. Upsert profile (user_id acts as profile_id)
    profile_id = user_id or str(uuid.uuid4())

    try:
        supabase.table("profiles").upsert({"id": profile_id}).execute()
    except Exception as exc:
        logger.warning("Profile upsert failed (may already exist): %s", exc)

    # 2. Create an analysis record under profile
    analysis_id = str(uuid.uuid4())
    try:
        supabase.table("analyses").insert({
            "id": analysis_id,
            "profile_id": profile_id,
            "status": "completed",
        }).execute()
    except Exception as exc:
        logger.error("Analysis insert failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to create analysis.")

    # 3. Insert resume under analysis
    resume_id = str(uuid.uuid4())
    try:
        supabase.table("resumes").insert({
            "id": resume_id,
            "analysis_id": analysis_id,
            "filename": file.filename,
            "raw_text": raw_text[:50000],  # cap stored text
        }).execute()
    except Exception as exc:
        logger.error("Resume insert failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to store resume.")

    # 4. Batch upsert skills under analysis_skills
    skill_names = [skill.name for skill in extracted_skills]
    if extracted_skills:
        skills_payload = [
            {
                "id": str(uuid.uuid4()),
                "analysis_id": analysis_id,
                "name": skill.name,
                "category": skill.category.value,
                "claimed": True,
                "evidence_score": 0,
                "evidence_level": "claimed-only",
            }
            for skill in extracted_skills
        ]
        try:
            supabase.table("analysis_skills").upsert(
                skills_payload,
                on_conflict="analysis_id,name",
            ).execute()
        except Exception as exc:
            logger.warning("Analysis skills batch upsert failed: %s", exc)

    return ResumeUploadResponse(
        resume_id=resume_id,
        user_id=profile_id,
        filename=file.filename,
        skills_extracted=skill_names,
        total_skills=len(skill_names),
        raw_text_preview=raw_text[:300] + "..." if len(raw_text) > 300 else raw_text,
    )
