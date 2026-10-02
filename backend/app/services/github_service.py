"""
GitHub service: fetch user profile and repository metadata via PyGithub.
"""
import json
import logging
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Tuple, Any
from datetime import datetime, timezone, timedelta
from github import Github, GithubException
from github.Repository import Repository
from app.config import settings

logger = logging.getLogger(__name__)


def _get_github_client() -> Github:
    token = settings.github_token
    if token:
        return Github(token)
    logger.warning("No GITHUB_TOKEN set – using unauthenticated GitHub API (rate-limited)")
    return Github()


def get_user_profile(username: str) -> Dict:
    """
    Fetch basic GitHub user profile data.
    Raises ValueError if user not found, RuntimeError on API errors.
    """
    g = _get_github_client()
    try:
        user = g.get_user(username)
        return {
            "username": user.login,
            "name": user.name,
            "bio": user.bio,
            "public_repos": user.public_repos,
            "followers": user.followers,
            "following": user.following,
            "avatar_url": user.avatar_url,
            "html_url": user.html_url,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    except GithubException as exc:
        if exc.status == 404:
            raise ValueError(f"GitHub user '{username}' not found") from exc
        raise RuntimeError(f"GitHub API error: {exc.data}") from exc


def get_user_repositories(username: str, max_repos: int = 15) -> List[Dict]:
    """
    Fetch the user's public non-fork repositories, sorted by push date.
    Uses ThreadPoolExecutor to parallelize per-repo metadata extraction.
    Returns a list of raw repository metadata dicts.
    """
    g = _get_github_client()
    try:
        user = g.get_user(username)
        repos = user.get_repos(type="public", sort="pushed")
    except GithubException as exc:
        if exc.status == 404:
            raise ValueError(f"GitHub user '{username}' not found") from exc
        raise RuntimeError(f"GitHub API error: {exc.data}") from exc

    # Collect non-fork repos up to max_repos limit
    candidates = []
    for repo in repos:
        if len(candidates) >= max_repos:
            break
        if not repo.fork:
            candidates.append(repo)

    # Fetch metadata in parallel — each _extract_repo_metadata makes 4 network calls
    result = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(_extract_repo_metadata, repo): repo for repo in candidates}
        for future in as_completed(futures):
            repo = futures[future]
            try:
                result.append(future.result())
            except Exception as exc:
                logger.warning("Failed to extract metadata for %s: %s", repo.full_name, exc)

    # Restore push-date order (futures complete out of order)
    result.sort(key=lambda r: r.get("last_commit_at") or "", reverse=True)
    return result


def _extract_repo_metadata(repo: Repository) -> Dict:
    """Extract all useful metadata from a single repository object."""

    # Languages
    try:
        languages = dict(repo.get_languages())
    except Exception:
        languages = {}

    # Topics
    try:
        topics = list(repo.get_topics())
    except Exception:
        topics = []

    # Commit count in last 90 days
    ninety_days_ago = datetime.now(timezone.utc) - timedelta(days=90)
    try:
        commits_iter = repo.get_commits(since=ninety_days_ago)
        # Count without exhausting the full paginator
        commit_count_90days = 0
        for _ in commits_iter:
            commit_count_90days += 1
            if commit_count_90days >= 200:   # cap to avoid abuse
                break
    except Exception:
        commit_count_90days = 0

    # Root contents fetched once to avoid multiple network calls
    try:
        root_contents = repo.get_contents("")
        root_files = {c.name: c for c in root_contents}
        root_names_lower = [c.name.lower() for c in root_contents]
    except Exception:
        root_contents = []
        root_files = {}
        root_names_lower = []

    # Package / dependency files
    dependencies, dep_files = _detect_dependencies(root_files)

    # Test presence
    has_tests = any(
        name in root_names_lower or name.startswith("test_") or name.endswith("_test.py")
        for name in root_names_lower
    )

    # CI presence
    has_ci = ".github" in root_files or any(
        ci in root_files for ci in [".travis.yml", "Jenkinsfile", ".gitlab-ci.yml", "azure-pipelines.yml"]
    )

    # Dockerfile
    has_dockerfile = any(
        f in root_files for f in ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"]
    )

    return {
        "repo_name": repo.name,
        "full_name": repo.full_name,
        "description": repo.description,
        "primary_language": repo.language,
        "languages": languages,
        "topics": topics,
        "stars": repo.stargazers_count,
        "forks": repo.forks_count,
        "has_tests": has_tests,
        "has_ci": has_ci,
        "has_dockerfile": has_dockerfile,
        "dependencies": dependencies,
        "dep_files": dep_files,
        "last_commit_at": repo.pushed_at.isoformat() if repo.pushed_at else None,
        "commit_count_90days": commit_count_90days,
        "html_url": repo.html_url,
    }


def _detect_dependencies(root_files: Dict[str, Any]) -> Tuple[List[str], List[str]]:
    """
    Detect dependencies by looking at known package manifest files.
    Returns (list_of_dependency_names, list_of_files_found).
    """
    MANIFEST_FILES = {
        "requirements.txt": _parse_requirements_txt,
        "pyproject.toml": _parse_pyproject_toml,
        "package.json": _parse_package_json,
        "Gemfile": _parse_gemfile,
        "go.mod": _parse_go_mod,
        "pom.xml": _parse_pom_xml,
        "build.gradle": _parse_gradle,
        "Cargo.toml": _parse_cargo_toml,
        "composer.json": _parse_composer_json,
    }

    found_deps: List[str] = []
    found_files: List[str] = []

    for filename, parser in MANIFEST_FILES.items():
        content_file = root_files.get(filename)
        if not content_file:
            continue
        try:
            text = content_file.decoded_content.decode("utf-8", errors="ignore")
            deps = parser(text)
            found_deps.extend(deps)
            found_files.append(filename)
        except Exception:
            pass

    # Deduplicate
    found_deps = list(dict.fromkeys(d.lower() for d in found_deps))
    return found_deps, found_files


def _parse_requirements_txt(content: str) -> List[str]:
    deps = []
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("-"):
            continue
        name = re.split(r"[><=!;~@]", line)[0].strip()
        if name:
            deps.append(name)
    return deps


def _parse_package_json(content: str) -> List[str]:
    try:
        data = json.loads(content)
        deps = list(data.get("dependencies", {}).keys())
        deps += list(data.get("devDependencies", {}).keys())
        return deps
    except Exception:
        return []


def _parse_pyproject_toml(content: str) -> List[str]:
    deps = re.findall(r'"([a-zA-Z0-9\-_]+)[>=<!\[;~@]', content)
    return deps


def _parse_gemfile(content: str) -> List[str]:
    return re.findall(r"gem\s+'([^']+)'", content)


def _parse_go_mod(content: str) -> List[str]:
    return re.findall(r"^\s+([a-zA-Z0-9\.\-_/]+)\s+v", content, re.MULTILINE)


def _parse_pom_xml(content: str) -> List[str]:
    return re.findall(r"<artifactId>([^<]+)</artifactId>", content)


def _parse_gradle(content: str) -> List[str]:
    return re.findall(r"['\"]([a-zA-Z0-9\.\-_]+):[a-zA-Z0-9\.\-_]+:[^'\"]+['\"]", content)


def _parse_cargo_toml(content: str) -> List[str]:
    return re.findall(r'^([a-zA-Z0-9\-_]+)\s*=', content, re.MULTILINE)


def _parse_composer_json(content: str) -> List[str]:
    try:
        data = json.loads(content)
        deps = list(data.get("require", {}).keys())
        return deps
    except Exception:
        return []
