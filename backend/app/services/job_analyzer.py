"""
Job analyzer: extract required skills from a job description using Groq.
"""
import json
import logging
from typing import List
from groq import Groq
from app.config import settings
from app.models.schemas import JobSkillRequirement

logger = logging.getLogger(__name__)

_client = None


def _get_groq_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.groq_api_key)
    return _client


JD_EXTRACTION_PROMPT = """You are a technical job description parser. Extract all technical skills from the job description below.

Classify each skill as either "required" (must-have) or "nice_to_have" (preferred/bonus).
Optionally detect experience level per skill: "junior", "mid", "senior", or null.
Normalize skill names (e.g. "Postgres" -> "PostgreSQL", "JS" -> "JavaScript").

Return ONLY a JSON object:
{{
  "job_title": "detected job title or null",
  "required_skills": [
    {{"name": "Python", "level": "senior", "required": true}},
    ...
  ],
  "nice_to_have_skills": [
    {{"name": "Docker", "level": null, "required": false}},
    ...
  ]
}}

Job Description:
---
{job_description}
---

Return ONLY valid JSON. No prose."""


def extract_skills_from_jd(job_description: str, job_title: str = None) -> dict:
    """
    Use Groq to extract required and nice-to-have skills from a job description.
    Returns a dict with keys: job_title, required_skills, nice_to_have_skills
    """
    client = _get_groq_client()
    truncated = job_description[:6000] if len(job_description) > 6000 else job_description

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {
                    "role": "user",
                    "content": JD_EXTRACTION_PROMPT.format(job_description=truncated),
                }
            ],
            temperature=0.1,
            max_tokens=1024,
        )
    except Exception as exc:
        logger.error("Groq API error during JD extraction: %s", exc)
        raise RuntimeError(f"Groq API error: {exc}") from exc

    raw = response.choices[0].message.content.strip()

    # Strip markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse Groq JD JSON: %s\nRaw: %s", exc, raw[:500])
        raise ValueError(f"LLM returned invalid JSON: {exc}") from exc

    # Use provided job_title if not extracted
    if job_title and not data.get("job_title"):
        data["job_title"] = job_title

    return {
        "job_title": data.get("job_title"),
        "required_skills": [
            JobSkillRequirement(**s) for s in data.get("required_skills", [])
        ],
        "nice_to_have_skills": [
            JobSkillRequirement(**s) for s in data.get("nice_to_have_skills", [])
        ],
    }


def generate_evidence_explanation(
    skill_name: str,
    evidence_level: str,
    evidence_details: List[dict],
) -> str:
    """
    Generate clean, factual explanation of why a skill received
    its evidence score without hitting LLM rate limits in a loop.
    """
    if not evidence_details:
        return f"{skill_name} is claimed on resume with no direct repository proof detected."

    top_ev = evidence_details[0]
    detail = top_ev.get("detail", "")
    score = sum(e.get("score_contribution", 0) for e in evidence_details)
    count = len(evidence_details)

    if evidence_level == "proven":
        return f"Proven with {score} pts across {count} signal(s) including {detail}."
    elif evidence_level == "partial":
        return f"Partially evidenced with {score} pts from {detail}."
    else:
        return f"Minimal repository signals ({score} pts); primarily claimed on resume."

