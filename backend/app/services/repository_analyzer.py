"""
Repository analyzer: maps raw repo metadata to per-skill evidence signals.

Given a list of repositories, this module determines which skills are
evidenced in each repo and what evidence type was found.
"""
import logging
from typing import List, Dict, Set

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# Skill → Artifact mappings
# ─────────────────────────────────────────────

# Maps a skill name (lower) to the GitHub language names that prove it
LANGUAGE_MAP: Dict[str, Set[str]] = {
    "python": {"Python"},
    "javascript": {"JavaScript"},
    "typescript": {"TypeScript"},
    "java": {"Java"},
    "go": {"Go"},
    "rust": {"Rust"},
    "c++": {"C++"},
    "c": {"C"},
    "c#": {"C#"},
    "ruby": {"Ruby"},
    "php": {"PHP"},
    "swift": {"Swift"},
    "kotlin": {"Kotlin"},
    "scala": {"Scala"},
    "r": {"R"},
    "html": {"HTML"},
    "css": {"CSS"},
    "shell": {"Shell"},
    "bash": {"Shell"},
    "dart": {"Dart"},
    "haskell": {"Haskell"},
    "lua": {"Lua"},
    "matlab": {"MATLAB"},
    "sql": {"PLSQL", "TSQL"},
    "flutter": {"Dart"},
}

# Maps a skill name (lower) to dependency names that prove it
DEPENDENCY_MAP: Dict[str, Set[str]] = {
    # Python
    "fastapi": {"fastapi"},
    "django": {"django", "django-rest-framework", "djangorestframework"},
    "flask": {"flask"},
    "sqlalchemy": {"sqlalchemy", "sqlmodel"},
    "pandas": {"pandas"},
    "numpy": {"numpy"},
    "tensorflow": {"tensorflow", "tensorflow-gpu"},
    "pytorch": {"torch", "torchvision"},
    "scikit-learn": {"scikit-learn", "sklearn"},
    "celery": {"celery"},
    "pydantic": {"pydantic"},
    "pytest": {"pytest"},
    # JS/TS
    "react": {"react", "react-dom", "@types/react"},
    "next.js": {"next"},
    "vue.js": {"vue", "@vue/core"},
    "angular": {"@angular/core"},
    "express": {"express"},
    "nestjs": {"@nestjs/core"},
    "tailwindcss": {"tailwindcss"},
    "jest": {"jest", "@jest/core"},
    "webpack": {"webpack"},
    "vite": {"vite"},
    "graphql": {"graphql", "apollo-server", "@apollo/client"},
    "typescript": {"typescript"},
    # Java
    "spring": {"spring-boot", "spring-context"},
    "hibernate": {"hibernate-core"},
    # Ruby
    "rails": {"rails"},
    # Go
    "gin": {"github.com/gin-gonic/gin"},
    "echo": {"github.com/labstack/echo"},
    # DB / infra
    "postgresql": {"psycopg2", "pg", "postgres"},
    "mysql": {"mysql", "mysql-connector-python", "mysqlclient"},
    "mongodb": {"pymongo", "mongoose"},
    "redis": {"redis", "ioredis"},
    "elasticsearch": {"elasticsearch"},
    "kafka": {"confluent-kafka", "kafka-python"},
    # Cloud / DevOps
    "docker": {"docker"},
    "kubernetes": {"kubernetes"},
    "aws": {"boto3", "aws-cdk-lib"},
    "terraform": {"terraform"},
    "ansible": {"ansible"},
}



# ─────────────────────────────────────────────
# Core analysis function
# ─────────────────────────────────────────────

def analyze_repositories_for_skill(skill_name: str, repositories: List[Dict]) -> List[Dict]:
    """
    Given a skill name and a list of repo metadata dicts,
    return a list of evidence records:
    [
      {
        "evidence_type": "language" | "dependency" | "code_pattern" | "test" | "readme" | "commit" | "deployment",
        "score_contribution": int,
        "detail": str,
        "repo_name": str,
      },
      ...
    ]
    """
    evidence: List[Dict] = []
    skill_lower = skill_name.lower()

    for repo in repositories:
        # ── 1. Language usage ──────────────────
        lang_matches = LANGUAGE_MAP.get(skill_lower, set())
        repo_langs = repo.get("languages", {})
        matched_langs = {lang for lang in lang_matches if lang in repo_langs}
        if matched_langs:
            total_bytes = sum(repo_langs.values()) or 1
            skill_bytes = sum(repo_langs.get(lang, 0) for lang in matched_langs)
            pct = (skill_bytes / total_bytes) * 100
            contribution = min(25, int(pct / 4))  # max 25 pts from language
            if contribution > 0:
                evidence.append({
                    "evidence_type": "language",
                    "score_contribution": contribution,
                    "detail": f"{skill_name} is {pct:.1f}% of code in {repo['repo_name']}",
                    "repo_name": repo["repo_name"],
                })

        # ── 2. Dependency usage ───────────────
        dep_names = DEPENDENCY_MAP.get(skill_lower, set())
        repo_deps = set(repo.get("dependencies", []))
        matched_deps = dep_names & repo_deps
        if matched_deps:
            evidence.append({
                "evidence_type": "dependency",
                "score_contribution": 20,
                "detail": f"Found in {repo['dep_files']}: {', '.join(matched_deps)}",
                "repo_name": repo["repo_name"],
            })

        # ── 3. README mention (weak signal – capped at 5 pts) ──
        # We intentionally do NOT fetch README content here to stay fast.
        # README mention gets a low cap via the evidence engine.
        # Only grant if topics/description contain the skill.
        desc = (repo.get("description") or "").lower()
        topics_str = " ".join(repo.get("topics", [])).lower()
        if skill_lower in desc or skill_lower in topics_str:
            evidence.append({
                "evidence_type": "readme",
                "score_contribution": 5,
                "detail": f"{skill_name} found in repository description or topics",
                "repo_name": repo["repo_name"],
            })

        # ── 4. Test presence (bonus if skill is also evidenced elsewhere) ──
        if repo.get("has_tests") and (matched_langs or matched_deps):
            evidence.append({
                "evidence_type": "test",
                "score_contribution": 15,
                "detail": f"Test suite detected in {repo['repo_name']}",
                "repo_name": repo["repo_name"],
            })

        # ── 5. Deployment / CI ────────────────
        if repo.get("has_ci") or repo.get("has_dockerfile"):
            if matched_langs or matched_deps:
                detail_parts = []
                if repo.get("has_ci"):
                    detail_parts.append("CI pipeline")
                if repo.get("has_dockerfile"):
                    detail_parts.append("Dockerfile/Compose")
                evidence.append({
                    "evidence_type": "deployment",
                    "score_contribution": 5,
                    "detail": f"Found: {', '.join(detail_parts)} in {repo['repo_name']}",
                    "repo_name": repo["repo_name"],
                })

        # ── 6. Recent commits ─────────────────
        commit_count = repo.get("commit_count_90days", 0)
        if commit_count > 0 and (matched_langs or matched_deps):
            pts = min(10, commit_count // 5)   # max 10 pts; 50 commits = full 10 pts
            if pts > 0:
                evidence.append({
                    "evidence_type": "commit",
                    "score_contribution": pts,
                    "detail": f"{commit_count} commits in last 90 days in {repo['repo_name']}",
                    "repo_name": repo["repo_name"],
                })

    return evidence


def detect_skills_from_repos(repositories: List[Dict]) -> Set[str]:
    """
    Return a set of skill names detected across all repositories
    via language presence or dependency files.
    """
    detected: Set[str] = set()

    for repo in repositories:
        # From languages
        repo_langs = set(repo.get("languages", {}).keys())
        for skill, lang_set in LANGUAGE_MAP.items():
            if lang_set & repo_langs:
                detected.add(skill.title())

        # From dependencies
        repo_deps = set(repo.get("dependencies", []))
        for skill, dep_set in DEPENDENCY_MAP.items():
            if dep_set & repo_deps:
                detected.add(skill.title())

    return detected
