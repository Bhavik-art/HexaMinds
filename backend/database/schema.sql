-- SkillProof Database Schema
-- Matches exact hierarchy:
-- auth.users -> profiles -> analyses (resumes, github_profiles -> repositories, analysis_skills -> evidence)
-- profiles -> jobs -> job_requirements -> match_results -> skill_gaps -> micro_tasks

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop of existing / old tables to prevent schema cache conflict
DROP TABLE IF EXISTS micro_tasks CASCADE;
DROP TABLE IF EXISTS skill_gaps CASCADE;
DROP TABLE IF EXISTS match_results CASCADE;
DROP TABLE IF EXISTS job_matches CASCADE;
DROP TABLE IF EXISTS job_requirements CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS analysis_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS repositories CASCADE;
DROP TABLE IF EXISTS github_profiles CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS analyses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ────────────────────────────────────────────
-- 1. profiles (linked to auth.users if auth used)
-- ────────────────────────────────────────────
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- references auth.users(id) when Supabase auth active
    email TEXT UNIQUE,
    github_username TEXT UNIQUE,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- 2. analyses
-- ────────────────────────────────────────────
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'completed', -- in_progress | completed | failed
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- 3. resumes (under analyses)
-- ────────────────────────────────────────────
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    raw_text TEXT,
    parsed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- 4. github_profiles (under analyses)
-- ────────────────────────────────────────────
CREATE TABLE github_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    public_repos INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    profile_data JSONB DEFAULT '{}'::jsonb,
    last_analyzed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- 5. repositories (under github_profiles)
-- ────────────────────────────────────────────
CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_profile_id UUID NOT NULL REFERENCES github_profiles(id) ON DELETE CASCADE,
    repo_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    description TEXT,
    primary_language TEXT,
    languages JSONB DEFAULT '{}'::jsonb,
    topics JSONB DEFAULT '[]'::jsonb,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    has_tests BOOLEAN DEFAULT FALSE,
    has_ci BOOLEAN DEFAULT FALSE,
    has_dockerfile BOOLEAN DEFAULT FALSE,
    dependencies JSONB DEFAULT '[]'::jsonb,
    last_commit_at TIMESTAMPTZ,
    repo_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- 6. analysis_skills (under analyses)
-- ────────────────────────────────────────────
CREATE TABLE analysis_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT, -- language | framework | tool | database | cloud | library | concept
    claimed BOOLEAN DEFAULT TRUE,
    evidence_score INTEGER DEFAULT 0,
    evidence_level TEXT DEFAULT 'claimed-only', -- proven | partial | claimed-only
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(analysis_id, name)
);

-- ────────────────────────────────────────────
-- 7. evidence (under analysis_skills)
-- ────────────────────────────────────────────
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_skill_id UUID NOT NULL REFERENCES analysis_skills(id) ON DELETE CASCADE,
    repository_id UUID REFERENCES repositories(id) ON DELETE SET NULL,
    evidence_type TEXT NOT NULL, -- language | dependency | code_pattern | test | commit | readme | deployment
    score_contribution INTEGER DEFAULT 0,
    detail TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- 8. jobs (under profiles)
-- ────────────────────────────────────────────
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- 9. job_requirements (under jobs)
-- ────────────────────────────────────────────
CREATE TABLE job_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    level TEXT, -- junior | mid | senior | null
    required BOOLEAN DEFAULT TRUE, -- TRUE = required, FALSE = nice-to-have
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- 10. match_results (under job_requirements / jobs)
-- ────────────────────────────────────────────
CREATE TABLE match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    match_score NUMERIC(5, 2) NOT NULL,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    analysis JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- 11. skill_gaps (under match_results)
-- ────────────────────────────────────────────
CREATE TABLE skill_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_result_id UUID NOT NULL REFERENCES match_results(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium', -- high | medium | low
    gap_type TEXT NOT NULL DEFAULT 'missing', -- missing | weak | partial
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- 12. micro_tasks (under skill_gaps)
-- ────────────────────────────────────────────
CREATE TABLE micro_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_gap_id UUID NOT NULL REFERENCES skill_gaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    task_type TEXT NOT NULL, -- project | tutorial | practice | contribution
    difficulty TEXT NOT NULL, -- beginner | intermediate | advanced
    estimated_hours INTEGER DEFAULT 4,
    resources JSONB DEFAULT '[]'::jsonb,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────
CREATE INDEX idx_analyses_profile_id ON analyses(profile_id);
CREATE INDEX idx_resumes_analysis_id ON resumes(analysis_id);
CREATE INDEX idx_github_profiles_analysis_id ON github_profiles(analysis_id);
CREATE INDEX idx_repositories_profile ON repositories(github_profile_id);
CREATE INDEX idx_analysis_skills_analysis_id ON analysis_skills(analysis_id);
CREATE INDEX idx_evidence_skill_id ON evidence(analysis_skill_id);
CREATE INDEX idx_jobs_profile_id ON jobs(profile_id);
CREATE INDEX idx_job_reqs_job_id ON job_requirements(job_id);
CREATE INDEX idx_match_results_job_id ON match_results(job_id);
CREATE INDEX idx_match_results_analysis_id ON match_results(analysis_id);
CREATE INDEX idx_skill_gaps_match_result_id ON skill_gaps(match_result_id);
CREATE INDEX idx_micro_tasks_skill_gap_id ON micro_tasks(skill_gap_id);

-- ────────────────────────────────────────────
-- Updated_at triggers
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_skills_updated_at BEFORE UPDATE ON analysis_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────
-- Disable RLS for MVP (allow anon key read/write)
-- ────────────────────────────────────────────
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE github_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE repositories DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE evidence DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_requirements DISABLE ROW LEVEL SECURITY;
ALTER TABLE match_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE micro_tasks DISABLE ROW LEVEL SECURITY;

