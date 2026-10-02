"""
Evidence Engine: deterministic scoring, NOT LLM-only decisions.

Takes per-skill evidence records from repository_analyzer and computes
a final score + level for each skill.
"""
import logging
from typing import List, Dict, Tuple
from app.config import settings
from app.models.schemas import EvidenceLevel
from app.services.repository_analyzer import analyze_repositories_for_skill

logger = logging.getLogger(__name__)

# Maximum score contribution per evidence type across ALL repos
MAX_CONTRIBUTION_PER_TYPE: Dict[str, int] = {
    "language": 25,
    "dependency": 20,
    "code_pattern": 20,
    "test": 15,
    "readme": 5,   # explicitly capped low
    "commit": 10,
    "deployment": 5,
}

# Total max = 100 (matches weight configuration)


def compute_evidence_score(evidence_list: List[Dict]) -> Tuple[int, EvidenceLevel, List[Dict]]:
    """
    Given raw evidence records for a single skill, compute:
      - total score (0-100)
      - evidence level (proven / partial / claimed-only)
      - capped evidence records with their final contribution

    Rules:
    - Each evidence type is capped at its MAX_CONTRIBUTION_PER_TYPE value
    - Evidence of the same type from multiple repos is summed, then capped
    - Final score is clamped to [0, 100]
    """
    # Accumulate raw totals per type
    raw_by_type: Dict[str, int] = {}
    for ev in evidence_list:
        ev_type = ev.get("evidence_type", "other")
        raw_by_type[ev_type] = raw_by_type.get(ev_type, 0) + ev.get("score_contribution", 0)

    # Apply per-type caps
    capped_by_type: Dict[str, int] = {}
    for ev_type, raw_score in raw_by_type.items():
        cap = MAX_CONTRIBUTION_PER_TYPE.get(ev_type, 5)
        capped_by_type[ev_type] = min(raw_score, cap)

    total_score = min(100, sum(capped_by_type.values()))

    # Build final evidence list with capped contributions
    processed: List[Dict] = []
    type_remaining: Dict[str, int] = dict(capped_by_type)

    for ev in evidence_list:
        ev_type = ev.get("evidence_type", "other")
        remaining = type_remaining.get(ev_type, 0)
        if remaining <= 0:
            continue
        contribution = min(ev.get("score_contribution", 0), remaining)
        type_remaining[ev_type] -= contribution
        if contribution > 0:
            processed.append({**ev, "score_contribution": contribution})

    # Determine level based on configurable thresholds
    proven_threshold = settings.evidence_proven_threshold
    partial_threshold = settings.evidence_partial_threshold

    if total_score >= proven_threshold:
        level = EvidenceLevel.proven
    elif total_score >= partial_threshold:
        level = EvidenceLevel.partial
    else:
        level = EvidenceLevel.claimed_only

    return total_score, level, processed


def score_all_skills(
    claimed_skills: List[Dict],   # [{"name": "Python", "category": "language", ...}]
    repositories: List[Dict],     # raw repo dicts from github_service
) -> List[Dict]:
    """
    For each claimed skill:
      1. Collect evidence from repositories (via repository_analyzer)
      2. Score with compute_evidence_score
      3. Return enriched skill dict with score, level, and evidence details
    """
    results = []
    for skill in claimed_skills:
        skill_name = skill["name"]
        evidence_raw = analyze_repositories_for_skill(skill_name, repositories)
        score, level, evidence_processed = compute_evidence_score(evidence_raw)

        results.append({
            "name": skill_name,
            "category": skill.get("category", "other"),
            "evidence_score": score,
            "evidence_level": level.value,
            "evidence_details": evidence_processed,
        })

    logger.info("Scored %d skills", len(results))
    return results
