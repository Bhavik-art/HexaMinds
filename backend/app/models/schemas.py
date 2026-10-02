"""
Pydantic models for all domain objects.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime


# ─────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────

class EvidenceLevel(str, Enum):
    proven = "proven"
    partial = "partial"
    claimed_only = "claimed-only"


class SkillCategory(str, Enum):
    language = "language"
    framework = "framework"
    tool = "tool"
    database = "database"
    cloud = "cloud"
    concept = "concept"
    other = "other"


class TaskType(str, Enum):
    project = "project"
    tutorial = "tutorial"
    practice = "practice"
    contribution = "contribution"


class Difficulty(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class Priority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


# ─────────────────────────────────────────────
# Resume Models
# ─────────────────────────────────────────────

class ResumeUploadResponse(BaseModel):
    resume_id: str
    user_id: str
    filename: str
    skills_extracted: List[str]
    total_skills: int
    raw_text_preview: str


class ExtractedSkill(BaseModel):
    name: str
    category: SkillCategory = SkillCategory.other
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)


# ─────────────────────────────────────────────
# GitHub Models
# ─────────────────────────────────────────────

class RepositoryAnalysis(BaseModel):
    repo_name: str
    full_name: str
    description: Optional[str]
    primary_language: Optional[str]
    languages: Dict[str, int] = {}
    topics: List[str] = []
    stars: int = 0
    forks: int = 0
    has_tests: bool = False
    has_ci: bool = False
    has_dockerfile: bool = False
    dependencies: List[str] = []
    last_commit_at: Optional[datetime]
    commit_count_90days: int = 0


class GitHubAnalysisRequest(BaseModel):
    github_username: str
    user_id: str


class GitHubAnalysisResponse(BaseModel):
    github_profile_id: str
    username: str
    public_repos: int
    repositories_analyzed: int
    detected_skills: List[str]
    languages: Dict[str, int]


# ─────────────────────────────────────────────
# Skills Models
# ─────────────────────────────────────────────

class EvidenceDetail(BaseModel):
    evidence_type: str
    score_contribution: int
    detail: str
    repo_name: Optional[str]


class SkillEvidence(BaseModel):
    skill_name: str
    category: Optional[str] = "other"
    evidence_score: int
    evidence_level: EvidenceLevel
    evidence_details: List[EvidenceDetail] = []
    explanation: Optional[str] = None


class UserSkillsResponse(BaseModel):
    user_id: str
    username: str
    skills: List[SkillEvidence]
    proven_count: int
    partial_count: int
    claimed_only_count: int


# ─────────────────────────────────────────────
# Job Models
# ─────────────────────────────────────────────

class JobAnalyzeRequest(BaseModel):
    job_description: str
    job_title: Optional[str] = None


class JobSkillRequirement(BaseModel):
    name: str
    level: Optional[str] = None     # junior | mid | senior
    required: bool = True


class JobAnalyzeResponse(BaseModel):
    job_title: Optional[str]
    required_skills: List[JobSkillRequirement]
    nice_to_have_skills: List[JobSkillRequirement]
    total_required: int


class JobMatchRequest(BaseModel):
    user_id: str
    job_description: str
    job_title: Optional[str] = None
    required_skills: Optional[List[JobSkillRequirement]] = None
    nice_to_have_skills: Optional[List[JobSkillRequirement]] = None


class MatchedSkill(BaseModel):
    skill_name: str
    evidence_level: EvidenceLevel
    evidence_score: int
    match_strength: str   # strong | moderate | weak


class JobMatchResponse(BaseModel):
    job_match_id: str
    user_id: str
    job_title: Optional[str]
    match_score: float
    matched_skills: List[MatchedSkill]
    missing_skills: List[str]
    summary: str


class MicroTaskRequest(BaseModel):
    user_id: str
    job_match_id: str


class ResourceLink(BaseModel):
    title: str
    url: str


class MicroTask(BaseModel):
    title: str
    description: str
    skill_name: str
    task_type: TaskType
    difficulty: Difficulty
    estimated_hours: int
    resources: List[ResourceLink] = []


class MicroTaskResponse(BaseModel):
    user_id: str
    job_match_id: str
    skill_gaps: List[str]
    micro_tasks: List[MicroTask]
    total_tasks: int
