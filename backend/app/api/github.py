"""
POST /api/github/analyze
"""
import uuid
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from app.services.github_service import get_user_profile, get_user_repositories
from app.services.repository_analyzer import detect_skills_from_repos
from app.services.evidence_engine import score_all_skills
from app.database.client import supabase
from app.models.schemas import GitHubAnalysisRequest, GitHubAnalysisResponse
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/github", tags=["GitHub"])


@router.post("/analyze", response_model=GitHubAnalysisResponse)
def analyze_github(payload: GitHubAnalysisRequest):
    """
    Analyze a GitHub user's public repositories.
    - Fetches profile + repos via GitHub REST API
    - Detects languages and dependencies
    - Persists github_profile and repositories under the profile's analysis in Supabase
    - Upserts newly detected skills into analysis_skills
    """
    username = payload.github_username.strip()
    profile_id = payload.user_id.strip()

    # ── Cache check: skip GitHub API if analyzed recently ─
    try:
        cached = (
            supabase.table("github_profiles")
            .select("id, last_analyzed, analysis_id")
            .eq("username", username)
            .order("last_analyzed", desc=True)
            .limit(1)
            .execute()
        )
        if cached.data:
            record = cached.data[0]
            last_analyzed = record.get("last_analyzed")
            if last_analyzed:
                # Parse ISO timestamp from Supabase
                try:
                    last_dt = datetime.fromisoformat(last_analyzed.replace("Z", "+00:00"))
                    age = datetime.now(timezone.utc) - last_dt
                    ttl = timedelta(minutes=settings.github_cache_ttl_minutes)
                    if age < ttl:
                        logger.info(
                            "GitHub cache hit for %s — last analyzed %dm ago (TTL=%dm)",
                            username, int(age.total_seconds() / 60), settings.github_cache_ttl_minutes
                        )
                        # Return stored response from DB without hitting GitHub API
                        analysis_id = record["analysis_id"]
                        skills_res = supabase.table("analysis_skills").select("name").eq("analysis_id", analysis_id).execute()
                        detected = sorted(s["name"] for s in (skills_res.data or []))
                        langs_res = supabase.table("repositories").select("languages").eq("github_profile_id", record["id"]).execute()
                        all_languages: dict = {}
                        for r in (langs_res.data or []):
                            for lang, b in (r.get("languages") or {}).items():
                                all_languages[lang] = all_languages.get(lang, 0) + b
                        repos_count = len(langs_res.data or [])
                        # Fetch public_repos count from profiles
                        profile_data = supabase.table("github_profiles").select("public_repos").eq("id", record["id"]).execute()
                        public_repos = profile_data.data[0]["public_repos"] if profile_data.data else 0
                        return GitHubAnalysisResponse(
                            github_profile_id=record["id"],
                            username=username,
                            public_repos=public_repos,
                            repositories_analyzed=repos_count,
                            detected_skills=detected,
                            languages=all_languages,
                        )
                except (ValueError, TypeError):
                    pass  # Bad timestamp — proceed with fresh fetch
    except Exception as exc:
        logger.warning("Cache check failed, proceeding with fresh fetch: %s", exc)

    # ── Fetch GitHub data ─────────────────────
    try:
        profile = get_user_profile(username)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=f"GitHub API error: {exc}")

    try:
        repositories = get_user_repositories(username, max_repos=settings.max_repos_to_analyze)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=f"GitHub API error: {exc}")

    # ── Detect skills from repos ──────────────
    detected_skills = detect_skills_from_repos(repositories)

    # Aggregate language counts across repos
    all_languages: dict = {}
    for repo in repositories:
        for lang, bytes_count in repo.get("languages", {}).items():
            all_languages[lang] = all_languages.get(lang, 0) + bytes_count

    # ── Persist to Supabase ───────────────────
    # 1. Ensure profile exists
    try:
        supabase.table("profiles").upsert({"id": profile_id, "github_username": username}).execute()
    except Exception as exc:
        logger.warning("Profile upsert failed: %s", exc)

    # 2. Get or create latest analysis for this profile
    analysis_id = None
    try:
        latest_analysis = (
            supabase.table("analyses")
            .select("id")
            .eq("profile_id", profile_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if latest_analysis.data:
            analysis_id = latest_analysis.data[0]["id"]
    except Exception as exc:
        logger.warning("Failed to fetch latest analysis: %s", exc)

    if not analysis_id:
        analysis_id = str(uuid.uuid4())
        try:
            supabase.table("analyses").insert({
                "id": analysis_id,
                "profile_id": profile_id,
                "status": "completed",
            }).execute()
        except Exception as exc:
            logger.error("Analysis insert failed: %s", exc)
            raise HTTPException(status_code=500, detail="Failed to initialize analysis.")

    # 3. Upsert github_profile under analysis_id
    github_profile_id = str(uuid.uuid4())
    try:
        existing = (
            supabase.table("github_profiles")
            .select("id")
            .eq("analysis_id", analysis_id)
            .eq("username", username)
            .execute()
        )
        if existing.data:
            github_profile_id = existing.data[0]["id"]
            supabase.table("github_profiles").update({
                "public_repos": profile["public_repos"],
                "followers": profile["followers"],
                "following": profile["following"],
                "profile_data": profile,
                "last_analyzed": "now()",
            }).eq("id", github_profile_id).execute()
        else:
            supabase.table("github_profiles").insert({
                "id": github_profile_id,
                "analysis_id": analysis_id,
                "username": username,
                "public_repos": profile["public_repos"],
                "followers": profile["followers"],
                "following": profile["following"],
                "profile_data": profile,
                "last_analyzed": "now()",
            }).execute()
    except Exception as exc:
        logger.error("github_profile upsert failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save GitHub profile.")

    # 4. Batch upsert repositories under github_profile_id
    if repositories:
        try:
            supabase.table("repositories").delete().eq("github_profile_id", github_profile_id).execute()
            repo_records = [
                {
                    "id": str(uuid.uuid4()),
                    "github_profile_id": github_profile_id,
                    "repo_name": repo["repo_name"],
                    "full_name": repo["full_name"],
                    "description": repo.get("description"),
                    "primary_language": repo.get("primary_language"),
                    "languages": repo.get("languages", {}),
                    "topics": repo.get("topics", []),
                    "stars": repo.get("stars", 0),
                    "forks": repo.get("forks", 0),
                    "has_tests": repo.get("has_tests", False),
                    "has_ci": repo.get("has_ci", False),
                    "has_dockerfile": repo.get("has_dockerfile", False),
                    "dependencies": repo.get("dependencies", []),
                    "last_commit_at": repo.get("last_commit_at"),
                    "repo_data": {k: v for k, v in repo.items() if k != "dep_files"},
                }
                for repo in repositories
            ]
            supabase.table("repositories").insert(repo_records).execute()
        except Exception as exc:
            logger.warning("Repo batch insert failed: %s", exc)

    # 5. Batch upsert detected skills under analysis_skills
    if detected_skills:
        skills_payload = [
            {
                "id": str(uuid.uuid4()),
                "analysis_id": analysis_id,
                "name": skill_name,
                "claimed": False,
                "evidence_score": 0,
                "evidence_level": "claimed-only",
            }
            for skill_name in detected_skills
        ]
        try:
            supabase.table("analysis_skills").upsert(
                skills_payload,
                on_conflict="analysis_id,name",
            ).execute()
        except Exception as exc:
            logger.warning("Analysis skills batch upsert failed: %s", exc)

    # 6. Score all skills for this analysis and persist evidence
    try:
        skills_res = supabase.table("analysis_skills").select("*").eq("analysis_id", analysis_id).execute()
        all_analysis_skills = skills_res.data or []
        if all_analysis_skills:
            scored = score_all_skills(all_analysis_skills, repositories)
            skill_map = {s["name"].lower(): s for s in all_analysis_skills}

            updated_skills = []
            all_evidence_to_insert = []
            for s in scored:
                db_record = skill_map.get(s["name"].lower())
                if db_record:
                    updated_skills.append({
                        "id": db_record["id"],
                        "analysis_id": analysis_id,
                        "name": db_record["name"],
                        "category": s.get("category") or db_record.get("category", "other"),
                        "claimed": db_record.get("claimed", False),
                        "evidence_score": s["evidence_score"],
                        "evidence_level": s["evidence_level"],
                    })
                    for ev in s.get("evidence_details", []):
                        all_evidence_to_insert.append({
                            "id": str(uuid.uuid4()),
                            "analysis_skill_id": db_record["id"],
                            "evidence_type": ev.get("evidence_type", "other"),
                            "score_contribution": ev.get("score_contribution", 0),
                            "detail": ev.get("detail", ""),
                            "metadata": {"repo_name": ev.get("repo_name")},
                        })

            if updated_skills:
                supabase.table("analysis_skills").upsert(updated_skills, on_conflict="analysis_id,name").execute()

            if all_evidence_to_insert:
                skill_ids = [s["id"] for s in all_analysis_skills if s.get("id")]
                if skill_ids:
                    supabase.table("evidence").delete().in_("analysis_skill_id", skill_ids).execute()
                supabase.table("evidence").insert(all_evidence_to_insert).execute()
    except Exception as exc:
        logger.warning("Auto-scoring after GitHub analysis failed: %s", exc)

    return GitHubAnalysisResponse(
        github_profile_id=github_profile_id,
        username=username,
        public_repos=profile["public_repos"],
        repositories_analyzed=len(repositories),
        detected_skills=sorted(detected_skills),
        languages=all_languages,
    )
