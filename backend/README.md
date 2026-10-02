# SkillProof Backend

A Python/FastAPI backend that validates developer skills by cross-referencing resume claims against real GitHub evidence.

## Core Flow

```
Resume PDF → Extract skills (Groq) → GitHub Analysis → Evidence Scoring → 
Proven / Partial / Claimed-only → Job Description → Match Score → Skill Gaps → Micro-tasks
```

## Stack

- **FastAPI** + **Pydantic v2** — API + validation
- **Supabase** (PostgreSQL) — persistence
- **Groq** — skill extraction, JD parsing, micro-task generation
- **PyMuPDF** — PDF text extraction
- **PyGithub** — GitHub REST API client

---

## Setup

### 1. Clone & create virtual environment

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in:
#   GROQ_API_KEY
#   SUPABASE_URL
#   SUPABASE_KEY
#   GITHUB_TOKEN  (optional but recommended to avoid rate limits)
#   FRONTEND_URL  (deployed frontend origin for CORS, optional locally)
```

### 4. Set up Supabase schema

Go to your [Supabase SQL Editor](https://supabase.com/dashboard) and run the contents of:

```
database/schema.sql
```

### 5. Run the server

```bash
uvicorn app.main:app --reload
```

API docs available at: **http://localhost:8000/docs**

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness check |
| `POST` | `/api/resume/upload` | Upload PDF resume, extract skills |
| `POST` | `/api/github/analyze` | Analyze GitHub repositories |
| `GET` | `/api/skills/{username}` | Get evidenced skill scores |
| `POST` | `/api/jobs/analyze` | Parse job description skills |
| `POST` | `/api/jobs/match` | Match user skills to a job |
| `POST` | `/api/jobs/microtasks` | Generate micro-tasks for skill gaps |

---

## Evidence Scoring

Scoring is **deterministic** (not LLM-only). Each signal is capped:

| Signal | Max Points |
|--------|-----------|
| Language usage in repos | 25 |
| Dependency in package files | 20 |
| Code patterns | 20 |
| Tests detected | 15 |
| Commit activity (90 days) | 10 |
| README/description mention | 5 |
| CI / Dockerfile | 5 |

**Total: 100 points**

| Score | Level |
|-------|-------|
| 80–100 | ✅ Proven |
| 40–79 | 🟡 Partial |
| 0–39 | ⬜ Claimed-only |

Thresholds are configurable via `.env`:
```
EVIDENCE_PROVEN_THRESHOLD=80
EVIDENCE_PARTIAL_THRESHOLD=40
```

---

## Usage Flow (Step by Step)

```bash
# 1. Upload resume
curl -X POST http://localhost:8000/api/resume/upload \
  -F "file=@resume.pdf" \
  -F "user_id=your-uuid"

# 2. Analyze GitHub
curl -X POST http://localhost:8000/api/github/analyze \
  -H "Content-Type: application/json" \
  -d '{"github_username": "octocat", "user_id": "your-uuid"}'

# 3. Get scored skills
curl http://localhost:8000/api/skills/octocat

# 4. Analyze a job description
curl -X POST http://localhost:8000/api/jobs/analyze \
  -H "Content-Type: application/json" \
  -d '{"job_description": "We need a senior Python developer with FastAPI...", "job_title": "Backend Engineer"}'

# 5. Match user to job
curl -X POST http://localhost:8000/api/jobs/match \
  -H "Content-Type: application/json" \
  -d '{"user_id": "your-uuid", "job_description": "...", "job_title": "Backend Engineer"}'

# 6. Generate micro-tasks
curl -X POST http://localhost:8000/api/jobs/microtasks \
  -H "Content-Type: application/json" \
  -d '{"user_id": "your-uuid", "job_match_id": "match-uuid-from-step-5"}'
```
