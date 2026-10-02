"""
GET /api/skills/{username}
"""
import logging
from fastapi import APIRouter, HTTPException
from app.services.job_analyzer import generate_evidence_explanation
from app.database.client import supabase
from app.models.schemas import UserSkillsResponse, SkillEvidence, EvidenceDetail, EvidenceLevel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/skills", tags=["Skills"])


@router.get("/{username}", response_model=UserSkillsResponse)
def get_user_skills(username: str):
    """
    For a given GitHub username:
    1. Load profile and latest analysis from Supabase
    2. Load analysis_skills
    3. Score each skill using the deterministic Evidence Engine
    4. Persist updated scores + detailed evidence records to Supabase
    5. Return full scored skill list
    """
    username = username.strip()

    # ── Load profile from Supabase ────────────
    try:
        profile_res = (
            supabase.table("profiles")
            .select("id")
            .eq("github_username", username)
            .execute()
        )
    except Exception as exc:
        logger.error("Supabase profile lookup error: %s", exc)
        raise HTTPException(status_code=500, detail="Database error.")

    if not profile_res.data:
        raise HTTPException(
            status_code=404,
            detail=f"No profile found with GitHub username '{username}'. "
                   "Please upload a resume and run /api/github/analyze first.",
        )

    profile_id = profile_res.data[0]["id"]

    # ── Get latest analysis ───────────────────
    try:
        analysis_res = (
            supabase.table("analyses")
            .select("id")
            .eq("profile_id", profile_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        logger.error("Supabase analysis lookup error: %s", exc)
        raise HTTPException(status_code=500, detail="Database error loading analysis.")

    if not analysis_res.data:
        raise HTTPException(
            status_code=404,
            detail="No analysis found for this user. Upload a resume first.",
        )

    analysis_id = analysis_res.data[0]["id"]

    # ── Load skills from analysis_skills ──────
    try:
        skills_res = (
            supabase.table("analysis_skills")
            .select("*")
            .eq("analysis_id", analysis_id)
            .execute()
        )
    except Exception as exc:
        logger.error("Supabase analysis_skills lookup error: %s", exc)
        raise HTTPException(status_code=500, detail="Database error loading skills.")

    claimed_skills = skills_res.data or []
    if not claimed_skills:
        raise HTTPException(
            status_code=404,
            detail="No skills found. Upload a resume first.",
        )

    # ── Load evidence for all skills in one query ───
    skill_ids = [s["id"] for s in claimed_skills if s.get("id")]
    evidence_by_skill_id = {}
    if skill_ids:
        try:
            ev_res = (
                supabase.table("evidence")
                .select("*")
                .in_("analysis_skill_id", skill_ids)
                .execute()
            )
            for ev in (ev_res.data or []):
                s_id = ev["analysis_skill_id"]
                evidence_by_skill_id.setdefault(s_id, []).append(ev)
        except Exception as exc:
            logger.warning("Evidence lookup error: %s", exc)

    # ── Build response from DB records ────────
    skill_evidences = []
    proven_count = partial_count = claimed_only_count = 0

    for s in claimed_skills:
        raw_level = s.get("evidence_level") or "claimed-only"
        try:
            level = EvidenceLevel(raw_level)
        except ValueError:
            level = EvidenceLevel.claimed_only

        if level == EvidenceLevel.proven:
            proven_count += 1
        elif level == EvidenceLevel.partial:
            partial_count += 1
        else:
            claimed_only_count += 1

        ev_records = evidence_by_skill_id.get(s["id"], [])
        evidence_details = [
            EvidenceDetail(
                evidence_type=e.get("evidence_type", "other"),
                score_contribution=e.get("score_contribution", 0),
                detail=e.get("detail", ""),
                repo_name=(e.get("metadata") or {}).get("repo_name"),
            )
            for e in ev_records
        ]

        try:
            explanation = generate_evidence_explanation(
                s["name"], level.value, [e.dict() for e in evidence_details]
            )
        except Exception:
            explanation = f"{s['name']} is rated {level.value}."

        skill_evidences.append(
            SkillEvidence(
                skill_name=s["name"],
                category=s.get("category") or "other",
                evidence_score=s.get("evidence_score", 0),
                evidence_level=level,
                evidence_details=evidence_details,
                explanation=explanation,
            )
        )

    # Sort: proven → partial → claimed-only, then by score desc
    skill_evidences.sort(
        key=lambda x: (-LEVEL_ORDER[x.evidence_level], -x.evidence_score)
    )

    return UserSkillsResponse(
        user_id=profile_id,
        username=username,
        skills=skill_evidences,
        proven_count=proven_count,
        partial_count=partial_count,
        claimed_only_count=claimed_only_count,
    )


LEVEL_ORDER = {
    EvidenceLevel.proven: 2,
    EvidenceLevel.partial: 1,
    EvidenceLevel.claimed_only: 0,
}
