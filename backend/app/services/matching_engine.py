"""
Matching Engine: deterministic skill-to-job matching + micro-task generation via Groq.

Matching is done with code/rules. Groq is ONLY used for micro-task text generation.
"""
import json
import logging
from typing import List, Dict, Tuple
from groq import Groq
from app.config import settings
from app.models.schemas import MicroTask, TaskType, Difficulty, ResourceLink

logger = logging.getLogger(__name__)

_client = None


def _get_groq_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.groq_api_key)
    return _client


# ─────────────────────────────────────────────
# Skill name normalization (fixes React.js ≠ React, etc.)
# ─────────────────────────────────────────────

SKILL_ALIASES: Dict[str, str] = {
    # JavaScript ecosystem
    "react.js": "react",
    "reactjs": "react",
    "react js": "react",
    "node.js": "node",
    "nodejs": "node",
    "node js": "node",
    "vue.js": "vue",
    "vuejs": "vue",
    "vue js": "vue",
    "next.js": "nextjs",
    "nuxt.js": "nuxtjs",
    "express.js": "express",
    "expressjs": "express",
    "js": "javascript",
    "ts": "typescript",
    # Databases
    "postgres": "postgresql",
    "pg": "postgresql",
    "mongo": "mongodb",
    # DevOps / Cloud
    "k8s": "kubernetes",
    "tf": "terraform",
    "gcp": "google cloud",
    "google cloud platform": "google cloud",
    "amazon web services": "aws",
    "docker compose": "docker",
    # Languages
    "c sharp": "c#",
    "csharp": "c#",
    "cpp": "c++",
    "golang": "go",
    # CSS / ML
    "tailwind": "tailwindcss",
    "tailwind css": "tailwindcss",
    "sklearn": "scikit-learn",
    "sci-kit learn": "scikit-learn",
    # CI/CD aliases
    "github actions": "ci/cd",
    "jenkins": "ci/cd",
    "circleci": "ci/cd",
}


def normalize_skill_name(name: str) -> str:
    """Canonicalize a skill name via aliases then lowercase."""
    key = name.strip().lower()
    return SKILL_ALIASES.get(key, key)


# ─────────────────────────────────────────────
# Scoring tables
# ─────────────────────────────────────────────

# Evidence level → base weight (used as fallback when no JD level specified)
EVIDENCE_LEVEL_SCORE = {
    "proven": 1.0,
    "partial": 0.6,
    "claimed-only": 0.3,
}

# JD required experience level → evidence level → weight multiplier
# Higher JD levels penalize unproven skills more aggressively
LEVEL_MODIFIER: Dict[str, Dict[str, float]] = {
    "senior":  {"proven": 1.0, "partial": 0.7, "claimed-only": 0.2},
    "mid":     {"proven": 1.0, "partial": 0.8, "claimed-only": 0.3},
    "junior":  {"proven": 1.0, "partial": 0.9, "claimed-only": 0.5},
}


def compute_match_score(
    job_required_skills: List[Dict],   # [{"name": "Python", "level": ..., "required": True}]
    job_nice_to_have: List[Dict],
    user_skills: List[Dict],           # [{"name": "Python", "evidence_level": "proven", ...}]
) -> Tuple[float, List[Dict], List[str]]:
    """
    Compute match score deterministically.

    Algorithm:
    - Required skills are worth 80% of total score
    - Nice-to-have skills are worth 20% of total score
    - Each required skill contributes (evidence_weight / n_required) * 80
    - Each nice-to-have contributes (evidence_weight / n_nice) * 20
    - Evidence weight is adjusted by JD experience level (senior penalizes
      unproven skills more)
    - Nice-to-have bonus is scaled down when required coverage is poor
    - Skill names are normalized via aliases (React.js → react, etc.)

    Returns: (match_score_0_100, matched_skills_list, missing_skills_list)
    """
    # Build user skill lookup with normalized names
    user_skill_map: Dict[str, Dict] = {
        normalize_skill_name(s["name"]): s for s in user_skills
    }

    matched_skills = []
    missing_skills = []
    required_score = 0.0
    nice_score = 0.0

    n_required = len(job_required_skills) or 1
    n_nice = len(job_nice_to_have) or 1

    for req in job_required_skills:
        skill_name = req["name"]
        user_skill = user_skill_map.get(normalize_skill_name(skill_name))
        if user_skill:
            level = user_skill.get("evidence_level", "claimed-only")
            # Apply experience-level modifier if JD specifies a level
            required_level = req.get("level")
            level_mods = LEVEL_MODIFIER.get(required_level)
            if level_mods:
                weight = level_mods.get(level, 0.3)
            else:
                weight = EVIDENCE_LEVEL_SCORE.get(level, 0.3)
            contribution = (weight / n_required) * 80
            required_score += contribution
            matched_skills.append({
                "skill_name": skill_name,
                "evidence_level": level,
                "evidence_score": user_skill.get("evidence_score", 0),
                "match_strength": _match_strength(level),
            })
        else:
            missing_skills.append(skill_name)

    for nice in job_nice_to_have:
        skill_name = nice["name"]
        user_skill = user_skill_map.get(normalize_skill_name(skill_name))
        if user_skill:
            level = user_skill.get("evidence_level", "claimed-only")
            weight = EVIDENCE_LEVEL_SCORE.get(level, 0.3)
            contribution = (weight / n_nice) * 20
            nice_score += contribution
            matched_skills.append({
                "skill_name": skill_name,
                "evidence_level": level,
                "evidence_score": user_skill.get("evidence_score", 0),
                "match_strength": _match_strength(level),
            })

    # Cap nice-to-have bonus: scale by required coverage so it doesn't
    # inflate score when required skills are poorly matched.
    # Full nice-to-have credit kicks in at ~70% required coverage.
    required_pct = required_score / 80.0
    adjusted_nice = nice_score * min(1.0, required_pct + 0.3)

    total_score = round(min(100.0, required_score + adjusted_nice), 2)
    return total_score, matched_skills, missing_skills


def _match_strength(evidence_level: str) -> str:
    mapping = {
        "proven": "strong",
        "partial": "moderate",
        "claimed-only": "weak",
    }
    return mapping.get(evidence_level, "weak")


def identify_skill_gaps(
    missing_skills: List[str],
    matched_skills: List[Dict],
    match_score: float,
) -> List[Dict]:
    """
    Build a prioritized list of skill gaps.
    Missing skills are HIGH priority.
    Weak-matched skills (claimed-only OR evidence_score < 30) are MEDIUM priority.
    Partial-matched skills with low evidence_score (< 60) are LOW priority.
    Near-proven partial skills (score ≥ 60) are excluded — not a real gap.
    """
    gaps = []

    for skill in missing_skills:
        gaps.append({
            "skill_name": skill,
            "priority": "high",
            "gap_type": "missing",
        })

    for match in matched_skills:
        ev_score = match.get("evidence_score", 0)
        if match["evidence_level"] == "claimed-only" or ev_score < 30:
            gaps.append({
                "skill_name": match["skill_name"],
                "priority": "medium",
                "gap_type": "weak",
            })
        elif match["evidence_level"] == "partial" and ev_score < 60:
            gaps.append({
                "skill_name": match["skill_name"],
                "priority": "low",
                "gap_type": "partial",
            })

    return gaps


MICROTASK_PROMPT = """You are a technical career coach. Generate actionable micro-tasks to help a developer close skill gaps.

For each skill gap listed below, generate 1-2 concrete micro-tasks.

Each task must be:
- Specific and actionable (not generic)
- Completable in a few hours to days
- Realistic for a developer to actually do

Skill gaps (with priority):
{gaps}

Return ONLY a JSON array of task objects:
[
  {{
    "title": "Build a FastAPI CRUD app with PostgreSQL",
    "description": "Create a simple REST API with full CRUD operations using FastAPI and asyncpg. Deploy it to a free hosting platform.",
    "skill_name": "FastAPI",
    "task_type": "project",
    "difficulty": "intermediate",
    "estimated_hours": 6,
    "resources": [
      {{"title": "FastAPI Official Docs", "url": "https://fastapi.tiangolo.com"}},
      {{"title": "asyncpg Tutorial", "url": "https://magicstack.github.io/asyncpg/"}}
    ]
  }}
]

task_type must be one of: project, tutorial, practice, contribution
difficulty must be one of: beginner, intermediate, advanced
estimated_hours must be an integer (1-40)

Return ONLY valid JSON."""


def generate_micro_tasks(skill_gaps: List[Dict]) -> List[MicroTask]:
    """
    Use Groq to generate concrete micro-tasks for skill gaps.
    Returns a list of MicroTask objects.
    """
    if not skill_gaps:
        return []

    client = _get_groq_client()

    # Format gaps for prompt
    gaps_text = "\n".join(
        f"- {g['skill_name']} (priority: {g['priority']}, type: {g['gap_type']})"
        for g in skill_gaps[:10]  # limit to avoid token overflow
    )

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {
                    "role": "user",
                    "content": MICROTASK_PROMPT.format(gaps=gaps_text),
                }
            ],
            temperature=0.4,
            max_tokens=2048,
        )
    except Exception as exc:
        logger.error("Groq API error during micro-task generation: %s", exc)
        raise RuntimeError(f"Groq API error: {exc}") from exc

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        tasks_data = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse Groq micro-task JSON: %s\nRaw: %s", exc, raw[:500])
        raise ValueError(f"LLM returned invalid JSON: {exc}") from exc

    tasks: List[MicroTask] = []
    for item in tasks_data:
        try:
            resources = [
                ResourceLink(title=r["title"], url=r["url"])
                for r in item.get("resources", [])
            ]
            task = MicroTask(
                title=item["title"],
                description=item["description"],
                skill_name=item["skill_name"],
                task_type=TaskType(item.get("task_type", "project")),
                difficulty=Difficulty(item.get("difficulty", "intermediate")),
                estimated_hours=int(item.get("estimated_hours", 4)),
                resources=resources,
            )
            tasks.append(task)
        except Exception as exc:
            logger.warning("Skipping invalid micro-task item: %s | Error: %s", item, exc)

    return tasks
