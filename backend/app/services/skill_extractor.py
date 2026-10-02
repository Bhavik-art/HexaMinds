"""
Skill extraction from resume text using Groq LLM.
Returns structured skill list with categories.
"""
import json
import logging
from typing import List
from groq import Groq
from app.config import settings
from app.models.schemas import ExtractedSkill, SkillCategory

logger = logging.getLogger(__name__)

_client = None


def _get_groq_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.groq_api_key)
    return _client


SKILL_EXTRACTION_PROMPT = """You are a technical resume parser. Extract ALL technical skills from the resume text below.

For each skill, provide:
- name: the canonical skill name (e.g., "Python", "React", "PostgreSQL", "Docker")
- category: one of: language, framework, tool, database, cloud, concept, other
- confidence: 0.0 to 1.0 based on how explicitly the skill is mentioned

Rules:
- Include programming languages, frameworks, libraries, databases, cloud platforms, DevOps tools, and technical concepts
- Do NOT include soft skills (communication, teamwork, etc.)
- Normalize names: "JS" -> "JavaScript", "Postgres" -> "PostgreSQL", "k8s" -> "Kubernetes"
- Only return skills explicitly mentioned in the resume
- Return a JSON array of objects with keys: name, category, confidence

Resume text:
---
{resume_text}
---

Return ONLY valid JSON. Example:
[
  {{"name": "Python", "category": "language", "confidence": 1.0}},
  {{"name": "FastAPI", "category": "framework", "confidence": 0.9}}
]"""


def extract_skills_from_text(resume_text: str) -> List[ExtractedSkill]:
    """
    Use Groq to extract technical skills from resume text.
    Returns a list of ExtractedSkill objects.
    """
    client = _get_groq_client()

    # Truncate very long resumes to avoid token limits
    truncated_text = resume_text[:8000] if len(resume_text) > 8000 else resume_text

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {
                    "role": "user",
                    "content": SKILL_EXTRACTION_PROMPT.format(resume_text=truncated_text),
                }
            ],
            temperature=0.1,
            max_tokens=2048,
        )
    except Exception as exc:
        logger.error("Groq API error during skill extraction: %s", exc)
        raise RuntimeError(f"Groq API error: {exc}") from exc

    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        skills_data = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse Groq JSON response: %s\nRaw: %s", exc, raw[:500])
        raise ValueError(f"LLM returned invalid JSON: {exc}") from exc

    skills: List[ExtractedSkill] = []
    seen = set()

    for item in skills_data:
        name = item.get("name", "").strip()
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())

        try:
            category = SkillCategory(item.get("category", "other"))
        except ValueError:
            category = SkillCategory.other

        confidence = float(item.get("confidence", 1.0))
        confidence = max(0.0, min(1.0, confidence))

        skills.append(ExtractedSkill(name=name, category=category, confidence=confidence))

    logger.info("Extracted %d skills from resume", len(skills))
    return skills
