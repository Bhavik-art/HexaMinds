# HexaMinds — SkillProof
### The Code-Verified Talent Intelligence Platform

> **Zero Exaggeration. 100% Deterministic Evidence.**  
> Bridging the gap between what candidates claim on résumés and what they actually build, commit, and deploy on GitHub.

---

## 👥 Team Members

| Name | Role |
|---|---|
| **Bhavik Jain** | Full-Stack & Systems Architecture |
| **Siddhi Pal** | AI Engineering & Data Extraction |
| **Soham Patil** | Backend & Verification Engine |
| **Harsh Shekhada** | Frontend Experience & UI/UX |

---

## 📌 Project Overview

Traditional technical hiring relies heavily on keyword matching and unverified résumé claims. This results in **résumé inflation**, where candidates list technologies after merely skimming tutorials or copying boilerplate code. 

**SkillProof** solves this by establishing a deterministic, code-verified audit trail:
1. **Parses Résumés**: Extracts technical competencies and claimed proficiencies using high-speed LLM processing and PDF stream extraction.
2. **Deep GitHub Auditing**: Connects to the candidate's GitHub profile to inspect public repositories, commit cadence, language byte distributions, dependency manifests (`package.json`, `requirements.txt`, `Cargo.toml`), test suites (`pytest`, `jest`, `vitest`), and CI/CD pipelines (`Dockerfile`, GitHub Actions).
3. **Deterministic Evidence Scoring**: Rates every claimed skill on a transparent 100-point rubric into **Proven**, **Partial**, or **Claimed-Only**.
4. **Targeted Job Matching & Gap Closer**: Compares verifiable candidate code against technical job descriptions and automatically synthesizes actionable 2–4 hour micro-projects for every identified gap.

---

## 🚀 Key Features

- **Automated Résumé Skill Extraction**: High-fidelity PDF parsing with PyMuPDF and Groq (Llama-3.3-70b-versatile) structured extraction.
- **Deep GitHub Code Verification**:
  - Scans language byte volume across all public repositories.
  - Inspects dependency manifests to confirm active library usage.
  - Detects test suites (`pytest`, `unittest`, `jest`, `mocha`) for QA validation.
  - Analyzes commit history to evaluate recency and contribution depth.
  - Confirms production configurations (`Dockerfile`, GitHub Actions CI workflows).
- **Deterministic 3-Tier Proof Status**:
  - 🟢 **Proven (80–100 pts)**: Substantive repositories, automated tests, and recent commits.
  - 🟡 **Partial (40–79 pts)**: Language usage or dependencies found, but missing tests or recent activity.
  - 🔴 **Claimed-Only (0–39 pts)**: Listed on résumé with zero verifiable public code evidence.
- **Dual Recruiter & Engineer Dashboards**:
  - **Recruiter View**: Plain-English verification summaries, Proof XP scores, and risk flags.
  - **Engineer View**: Commit hashes, AST diff previews, dependency file trees, and CI/CD logs.
- **Intelligent Job Matching**: Calculates both the **Traditional Résumé Claim Match** and the **True Code Proof Match** side-by-side.
- **Actionable Gap-Closer Micro-Tasks**: For every missing skill, generates step-by-step implementation roadmaps, GitHub deliverables, recruiter verification checklists, and starter prompt templates.
- **Official Audit Certificate Report**: Exportable audit report documenting verified skills, code proof ratios, and verification timestamps.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v3 with custom Polaroid surface design system
- **Visualizations**: Recharts (Radar charts, commit velocity area charts, competency breakdown)
- **Icons & Micro-Interactions**: Lucide React, Canvas Confetti
- **Typography**: Outfit, Plus Jakarta Sans, JetBrains Mono

### Backend
- **Framework**: Python 3.10+ with FastAPI
- **Data Validation**: Pydantic v2
- **Server**: Uvicorn with ASGI reload & GZip compression middleware
- **VCS & API Clients**: PyGithub, GitPython, Requests

### AI & Document Extraction
- **LLM Engine**: Groq Cloud API (Llama 3.3 70B Versatile, sub-second inference)
- **PDF Extraction**: PyMuPDF (`fitz`) stream-based text extraction

### Database & Storage
- **Database**: Supabase PostgreSQL with relational integrity
- **Tables**: `profiles`, `analyses`, `resumes`, `github_profiles`, `repositories`, `analysis_skills`, `evidence`, `jobs`, `job_requirements`, `match_results`, `skill_gaps`, `micro_tasks`

---

## 🏗️ Architecture & Workflow

```
                               ┌────────────────────────┐
                               │   Candidate Résumé     │
                               │      (PDF / Text)      │
                               └───────────┬────────────┘
                                           │
                                           ▼
                               [ PyMuPDF Text Extractor ]
                                           │
                                           ▼
                            [ Groq Llama 3.3 Skill Parser ]
                                           │
                                           ▼
                             Extracted Claimed Skill List
                                           │
 ┌─────────────────────────┐               │
 │   GitHub Public Repos   │               │
 │ • Language bytes        │               │
 │ • Dependency manifests  │               │
 │ • Unit test suites      │               │
 │ • CI/CD & Dockerfiles   │               │
 └────────────┬────────────┘               │
              │                            ▼
              └──────────────────► ┌──────────────────────────────┐
                                   │  Deterministic Evidence      │
                                   │  Scoring Engine (0-100 pts)  │
                                   └──────────────┬───────────────┘
                                                  │
                                                  ▼
                        ┌───────────────────────────────────────────────────┐
                        │                Verification Status:               │
                        │  🟢 Proven (80-100)   🟡 Partial (40-79)          │
                        │  🔴 Claimed-only (0-39)                           │
                        └─────────────────────────┬─────────────────────────┘
                                                  │
                                                  ▼
 ┌─────────────────────────┐       ┌──────────────────────────────┐
 │ Technical Job Posting   │ ────► │  Dual-Score Job Matcher &    │
 │ (Requirements & Stacks) │       │  Gap-Closer Micro-Tasks      │
 └─────────────────────────┘       └──────────────────────────────┘
```

### Deterministic 100-Point Evidence Rubric
| Metric | Max Points | Verification Criteria |
|---|---|---|
| **Primary Language Usage** | 25 pts | Language bytes detected across multiple repositories |
| **Dependency Manifests** | 20 pts | Named packages in `package.json`, `requirements.txt`, etc. |
| **Code Pattern Matching** | 20 pts | Implementation files, frameworks, and architecture markers |
| **Automated Test Suites** | 15 pts | `pytest`, `jest`, `vitest`, `unittest` detected and passing |
| **Commit Recency** | 10 pts | Activity within last 30–90 days |
| **Documentation & Readme** | 5 pts | Dedicated documentation mentioning the technology |
| **DevOps / CI Setup** | 5 pts | `Dockerfile`, `docker-compose.yml`, or GitHub Actions |

---

## 📡 Dataset & API Information

### Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Backend status, Supabase connection check, and Groq/GitHub status |
| `POST` | `/api/resume/upload` | Upload PDF résumé, extract raw text, parse skills via Groq, persist record |
| `POST` | `/api/github/analyze` | Scan candidate's GitHub repositories, compute language statistics, score skills |
| `GET` | `/api/skills/{username}` | Retrieve comprehensive evidence breakdown and status badges for a candidate |
| `POST` | `/api/jobs/analyze` | Parse job description text and extract mandatory vs. optional skills using AI |
| `POST` | `/api/jobs/match` | Compute deterministic match score, missing skills, and gap list |
| `POST` | `/api/jobs/microtasks` | Generate actionable mini-projects with steps and checklists for skill gaps |

### Benchmark Dataset
SkillProof includes pre-verified benchmark candidates for immediate evaluation:
- **`cand-alex-rivera`** (`@alexrivera-dev`): Full-Stack Systems Engineer (Proven Python, FastAPI, React; Partial Docker; Claimed Kubernetes, AWS).
- **`cand-sarah-chen`** (`@sarahchen-data`): Machine Learning & Data Platform Engineer (Proven PyTorch, Pandas, Scikit-Learn, SQL; Partial Docker; Claimed Spark).
- **Sample Job Descriptions**: Senior Full-Stack Platform Engineer (`jd-fullstack`) and AI Infrastructure Engineer (`jd-ai-infra`).

---

## 💻 Setup & Installation Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10, v3.11, or v3.12 (Python 3.14 not recommended due to dependencies)
- **Git**
- **Groq API Key**: Obtainable from [console.groq.com](https://console.groq.com)
- **Supabase Account & Project**: Free project on [supabase.com](https://supabase.com)
- **GitHub Token (Optional)**: Personal Access Token to avoid GitHub API rate limits (60 req/hr vs 5000 req/hr)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Bhavik-art/HexaMinds.git
cd HexaMinds
```

---

### Step 2: Backend Setup

1. **Navigate to backend and create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activate the virtual environment**:
   - **Windows PowerShell**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows Command Prompt**:
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file inside `backend/` by copying the example:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration:
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key_here
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_supabase_anon_or_service_key
   GITHUB_TOKEN=ghp_your_optional_github_token_here
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```

5. **Initialize Supabase Database Schema**:
   Open the **SQL Editor** in your Supabase dashboard and run the SQL script found in:
   ```
   backend/database/schema.sql
   ```

6. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API interactive documentation will be available at: **http://127.0.0.1:8000/docs**

---

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Frontend Environment (Optional)**:
   By default, the frontend connects to `http://127.0.0.1:8000`. To customize, create a `.env` file in `frontend/`:
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   Open your browser to: **http://localhost:5173**

---

## 📸 Screenshots & Demo Information

### Demo Walkthrough
1. **Proof Overview**: Review candidate summary, Proof XP (+320 XP), overall proof score, Recharts radar map, and recent commit velocity.
2. **Deep Code Evidence Matrix**: Filter by Category (`Languages`, `Cloud & DevOps`, `Testing & QA`) or Verification Level (`Proven`, `Partial`, `Claimed-Only`). Click on any card to view detected test suites, recent repositories, and commit timestamps.
3. **Verification Studio**: Drag and drop any developer PDF résumé or enter a GitHub username to run a live multi-point audit.
4. **Job Matcher & Gap Closer**: Paste a job description or click a preset (e.g., *Senior Full-Stack Engineer*). Review the dual score breakdown:
   - **Résumé Claims Match**: 100%
   - **True Code Proof Match**: 70%
5. **Actionable Micro-Tasks**: Review customized project assignments designed to close identified gaps (e.g., *Containerize a Multi-Service FastAPI + PostgreSQL Stack for Docker*), complete with step-by-step guides, deliverables, and recruiter verification checklists.
6. **Code Evidence Inspector**: Inspect commit hashes, verified diffs, and AST unit test logs.

---

## ⚠️ Limitations & Future Scope

### Current Limitations
- **Public Repositories Only**: Private repositories and enterprise commits (e.g., private GitHub orgs, GitLab, Bitbucket) are not scanned unless granted specific OAuth tokens.
- **GitHub REST API Rate Limits**: Unauthenticated GitHub API calls are limited to 60 requests/hour (mitigated by configuring `GITHUB_TOKEN`).
- **Text-Based PDF Extraction**: Non-searchable scanned images of résumés require OCR preprocessing prior to ingestion.

### Future Scope
- **OAuth Multi-Platform Integration**: Support for GitLab, Bitbucket, and private GitHub repository scanning with scoped token permissions.
- **Automated Sandbox Execution**: Running test suites inside ephemeral Firecracker microVMs or Docker sandboxes to independently verify code pass rates.
- **Automated Pull Request Proof Bot**: A GitHub bot that automatically assigns and evaluates gap-closer pull requests submitted by candidates.
- **Verifiable Credentials on Blockchain**: Minting cryptographically signed Soulbound Tokens (SBTs) or W3C Verifiable Credentials for verified skills.

---

## 📄 License

This project is licensed under the MIT License. Built for transparent, merit-based technical hiring.
