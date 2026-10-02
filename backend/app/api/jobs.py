"""
POST /api/jobs/analyze
POST /api/jobs/match
POST /api/jobs/microtasks
"""
import uuid
import logging
from fastapi import APIRouter, HTTPException
from app.services.job_analyzer import extract_skills_from_jd
from app.services.matching_engine import (
    compute_match_score,
    identify_skill_gaps,
    generate_micro_tasks,
)
from app.database.client import supabase
from app.models.schemas import (
    JobAnalyzeRequest,
    JobAnalyzeResponse,
    JobMatchRequest,
    JobMatchResponse,
    MicroTaskRequest,
    MicroTaskResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.post("/analyze", response_model=JobAnalyzeResponse)
def analyze_job(payload: JobAnalyzeRequest):
    """
    Extract required + nice-to-have skills from a job description using Groq.
    """
    try:
        result = extract_skills_from_jd(payload.job_description, payload.job_title)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=f"AI error: {exc}")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return JobAnalyzeResponse(
        job_title=result["job_title"],
        required_skills=result["required_skills"],
        nice_to_have_skills=result["nice_to_have_skills"],
        total_required=len(result["required_skills"]),
    )


@router.post("/match", response_model=JobMatchResponse)
def match_job(payload: JobMatchRequest):
    """
    Match a user's evidenced skills against a job description.
    Hierarchical persistence:
      profiles -> jobs -> job_requirements -> match_results -> skill_gaps
    """
    profile_id = payload.user_id.strip()

    # ── Extract or reuse JD skills ────────────
    if payload.required_skills is not None:
        jd_result = {
            "job_title": payload.job_title,
            "required_skills": payload.required_skills,
            "nice_to_have_skills": payload.nice_to_have_skills or [],
        }
    else:
        try:
            jd_result = extract_skills_from_jd(payload.job_description, payload.job_title)
        except (RuntimeError, ValueError) as exc:
            raise HTTPException(status_code=502, detail=f"JD analysis error: {exc}")

    # ── Ensure profile exists ─────────────────
    try:
        supabase.table("profiles").upsert({"id": profile_id}).execute()
    except Exception as exc:
        logger.warning("Profile check/upsert failed: %s", exc)

    # ── Load latest analysis for profile ──────
    analysis_id = None
    try:
        analysis_res = (
            supabase.table("analyses")
            .select("id")
            .eq("profile_id", profile_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if analysis_res.data:
            analysis_id = analysis_res.data[0]["id"]
    except Exception as exc:
        logger.error("Supabase error loading analysis: %s", exc)

    if not analysis_id:
        raise HTTPException(
            status_code=404,
            detail="No analysis found for this user. Upload a resume first.",
        )

    # ── Load skills from analysis_skills ──────
    try:
        skills_res = (
            supabase.table("analysis_skills")
            .select("*")
            .eq("analysis_id", analysis_id)
            .execute()
        )
    except Exception as exc:
        logger.error("Supabase error loading analysis_skills: %s", exc)
        raise HTTPException(status_code=500, detail="Database error.")

    user_skills = skills_res.data or []
    if not user_skills:
        raise HTTPException(
            status_code=404,
            detail="No skills found for this analysis. Upload a resume and run GitHub analysis first.",
        )

    # ── Compute match score deterministically ─
    match_score, matched_skills, missing_skills = compute_match_score(
        job_required_skills=[s.dict() for s in jd_result["required_skills"]],
        job_nice_to_have=[s.dict() for s in jd_result["nice_to_have_skills"]],
        user_skills=user_skills,
    )

    summary = _build_match_summary(match_score, matched_skills, missing_skills)

    # ── 1. Insert jobs record under profiles ──
    job_id = str(uuid.uuid4())
    try:
        supabase.table("jobs").insert({
            "id": job_id,
            "profile_id": profile_id,
            "title": jd_result["job_title"] or payload.job_title or "Software Engineer",
            "description": payload.job_description[:10000],
        }).execute()
    except Exception as exc:
        logger.error("Failed to insert job: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save job record.")

    # ── 2. Batch insert job_requirements under jobs ─
    all_requirements = []
    for req in jd_result["required_skills"]:
        all_requirements.append({
            "id": str(uuid.uuid4()),
            "job_id": job_id,
            "skill_name": req.name,
            "level": req.level,
            "required": True,
        })
    for nice in jd_result["nice_to_have_skills"]:
        all_requirements.append({
            "id": str(uuid.uuid4()),
            "job_id": job_id,
            "skill_name": nice.name,
            "level": nice.level,
            "required": False,
        })

    if all_requirements:
        try:
            supabase.table("job_requirements").insert(all_requirements).execute()
        except Exception as exc:
            logger.warning("Failed to batch insert job_requirements: %s", exc)

    # ── 3. Insert match_results ───────────────
    match_result_id = str(uuid.uuid4())
    try:
        supabase.table("match_results").insert({
            "id": match_result_id,
            "job_id": job_id,
            "analysis_id": analysis_id,
            "match_score": match_score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "analysis": {"summary": summary},
        }).execute()
    except Exception as exc:
        logger.error("match_results insert failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save match results.")

    # ── 4. Batch insert skill_gaps under match_results
    gaps = identify_skill_gaps(missing_skills, matched_skills, match_score)
    gap_records = [
        {
            "id": str(uuid.uuid4()),
            "match_result_id": match_result_id,
            "skill_name": gap["skill_name"],
            "priority": gap["priority"],
            "gap_type": gap["gap_type"],
        }
        for gap in gaps
    ]
    if gap_records:
        try:
            supabase.table("skill_gaps").insert(gap_records).execute()
        except Exception as exc:
            logger.warning("skill_gaps batch insert failed: %s", exc)

    return JobMatchResponse(
        job_match_id=match_result_id,
        user_id=profile_id,
        job_title=jd_result["job_title"],
        match_score=match_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        summary=summary,
    )


@router.post("/microtasks", response_model=MicroTaskResponse)
def generate_microtasks(payload: MicroTaskRequest):
    """
    Generate micro-tasks for skill gaps identified in a job match.
    Persists into micro_tasks under skill_gaps.
    """
    # Load skill gaps for this match_result
    try:
        gaps_res = (
            supabase.table("skill_gaps")
            .select("*")
            .eq("match_result_id", payload.job_match_id)
            .order("priority")
            .execute()
        )
    except Exception as exc:
        logger.error("Supabase error loading skill_gaps: %s", exc)
        raise HTTPException(status_code=500, detail="Database error.")

    gaps = gaps_res.data or []
    if not gaps:
        raise HTTPException(
            status_code=404,
            detail="No skill gaps found for this job match. Run /api/jobs/match first.",
        )

    # Generate micro-tasks via Groq
    try:
        micro_tasks = generate_micro_tasks(gaps)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=f"AI error: {exc}")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # Batch persist micro_tasks under skill_gaps
    task_records = []
    for task in micro_tasks:
        gap_record = next(
            (g for g in gaps if g["skill_name"].lower() == task.skill_name.lower()), None
        )
        skill_gap_id = gap_record["id"] if gap_record else (gaps[0]["id"] if gaps else None)

        if skill_gap_id:
            task_records.append({
                "id": str(uuid.uuid4()),
                "skill_gap_id": skill_gap_id,
                "title": task.title,
                "description": task.description,
                "skill_name": task.skill_name,
                "task_type": task.task_type.value,
                "difficulty": task.difficulty.value,
                "estimated_hours": task.estimated_hours,
                "resources": [r.dict() for r in task.resources],
            })

    if task_records:
        try:
            supabase.table("micro_tasks").insert(task_records).execute()
        except Exception as exc:
            logger.warning("micro_tasks batch insert failed: %s", exc)

    return MicroTaskResponse(
        user_id=payload.user_id,
        job_match_id=payload.job_match_id,
        skill_gaps=[g["skill_name"] for g in gaps],
        micro_tasks=micro_tasks,
        total_tasks=len(micro_tasks),
    )


def _build_match_summary(
    match_score: float,
    matched_skills: list,
    missing_skills: list,
) -> str:
    strong = sum(1 for m in matched_skills if m.get("match_strength") == "strong")
    if match_score >= 80:
        verdict = "Excellent match"
    elif match_score >= 60:
        verdict = "Good match"
    elif match_score >= 40:
        verdict = "Moderate match"
    else:
        verdict = "Low match"

    parts = [
        f"{verdict} ({match_score:.1f}% overall).",
        f"{strong} skill(s) proven via GitHub.",
    ]
    if missing_skills:
        parts.append(f"Missing: {', '.join(missing_skills[:5])}" +
                     (f" (+{len(missing_skills)-5} more)" if len(missing_skills) > 5 else "."))
    return " ".join(parts)
