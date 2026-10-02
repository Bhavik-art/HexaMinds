# HexaMinds — SkillProof

SkillProof is an evidence-based skill verification platform that bridges the gap between what a candidate claims on their resume and what they have actually built and contributed on GitHub.

---

## Architecture Overview

```
                          ┌────────────────────────┐
                          │   Candidate Resume     │
                          └───────────┬────────────┘
                                      │
                                      ▼
                        [ Resume Parsing & Extraction ]
                                      │
                                      ▼
┌─────────────────────────┐     ┌───────────┐     ┌─────────────────────────┐
│   GitHub Activity &     │ ──► │  Evidence │ ◄── │  Job Description        │
│   Code Repository Proof │     │  Engine   │     │  Analysis               │
└─────────────────────────┘     └─────┬─────┘     └─────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Verification Status:    │
                        │ • Proven (80-100)         │
                        │ • Partial (40-79)         │
                        │ • Claimed-only (0-39)     │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ Job Match & Gap Analysis  │
                        │   + Targeted Micro-tasks  │
                        └───────────────────────────┘
```

---

## Key Features

- **Resume Skill Extraction**: Automated parsing of PDF resumes using Groq LLM and PyMuPDF to extract technical competencies.
- **Deep GitHub Verification**: Connects to candidate GitHub profiles to scan repositories, commits, dependencies, tests, and CI/CD configs.
- **Deterministic Evidence Scoring**: Transparent scoring model out of 100 points:
  - Language usage in repos (25 pts)
  - Dependency manifests (20 pts)
  - Code pattern matching (20 pts)
  - Test suites detected (15 pts)
  - Recent commit activity (10 pts)
  - README/documentation mention (5 pts)
  - CI / Docker configuration (5 pts)
- **Job Matching & Gap Detection**: Evaluates candidate readiness against specific job requirements with weighted matching.
- **Micro-Tasks for Gaps**: Automatically generates contextual coding challenges and learning micro-tasks to bridge identified skill deficiencies.

---

## Project Structure

```
HexaMinds/
├── backend/                  # FastAPI backend service
│   ├── app/
│   │   ├── api/              # REST API routes (resume, github, skills, jobs)
│   │   ├── models/           # Pydantic schemas and database models
│   │   ├── services/         # Evidence engine, analyzers, parser, matching
│   │   └── main.py           # Application entrypoint
│   ├── database/             # Supabase schema definitions
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + Vite web dashboard
│   ├── src/
│   │   ├── components/       # Resume upload, GitHub connect, Evidence dashboard, Job matcher
│   │   ├── api.js            # API client service
│   │   └── App.jsx           # Main application shell
│   └── package.json          # Node dependencies
└── README.md
```

---

## Tech Stack

### Frontend
- **React 19** with **Vite**
- **Tailwind CSS** for UI styling
- **Recharts** for skill visualization & metrics
- **Lucide React** for icons

### Backend
- **FastAPI** + **Pydantic v2**
- **Supabase** (PostgreSQL) for persistence
- **Groq API** (Llama 3) for skill parsing and task generation
- **PyGithub** for GitHub API integration
- **PyMuPDF** (`fitz`) for PDF parsing

---

## Quickstart

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Supabase account
- Groq API Key
- GitHub Personal Access Token (optional, recommended for rate limits)

---

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with GROQ_API_KEY, SUPABASE_URL, SUPABASE_KEY, etc.

# Run server
uvicorn app.main:app --reload --port 8000
```

Backend interactive API documentation: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend application: `http://localhost:5173`

---

## API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health and status check |
| `POST` | `/api/resume/upload` | Upload resume and extract skills |
| `POST` | `/api/github/analyze` | Scan GitHub repos and score evidence |
| `GET` | `/api/skills/{username}` | Fetch calculated skill evidence levels |
| `POST` | `/api/jobs/analyze` | Extract required skills from job description |
| `POST` | `/api/jobs/match` | Match verified profile against job requirements |
| `POST` | `/api/jobs/microtasks` | Generate micro-tasks for identified skill gaps |
