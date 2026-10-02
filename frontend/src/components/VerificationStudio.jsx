import React, { useState, useEffect } from 'react';
import { UploadCloud, ArrowRight, Sparkles, FileText, Check, AlertCircle, Loader2, User, FileCode, CheckCircle2, ChevronRight, Terminal } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function VerificationStudio({ onAnalyze, isLoading, sampleCandidates, onSelectSample }) {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [githubUser, setGithubUser] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [auditStep, setAuditStep] = useState(0);

  // Animated step indicator during loading
  useEffect(() => {
    let interval;
    if (isLoading) {
      setAuditStep(1);
      interval = setInterval(() => {
        setAuditStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 900);
    } else {
      setAuditStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith('.pdf')) {
        setFile(droppedFile);
        setErrorMessage('');
      } else {
        setErrorMessage("Please upload a PDF document (.pdf).");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Check if at least one input is provided
    if (!file && !resumeText.trim() && !githubUser.trim()) {
      setErrorMessage("Please upload a PDF résumé, paste résumé text, or enter a GitHub username to verify.");
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append('resume_file', file);
    }
    if (resumeText.trim()) {
      formData.append('resume_text', resumeText);
    }
    if (githubUser.trim()) {
      formData.append('github_username', githubUser.trim());
    }
    if (candidateName.trim()) {
      formData.append('candidate_name', candidateName.trim());
    }

    onAnalyze(formData);
  };

  const handleLoadSampleResume = () => {
    setInputMode('paste');
    setResumeText(`David Miller
Senior Full-Stack & Cloud Engineer
Email: david.miller@engineer.dev | GitHub: alexrivera-dev
Location: San Francisco, CA

SUMMARY
Full-Stack Engineer with 5+ years experience building cloud services, asynchronous APIs, and responsive frontends.

CORE SKILLS
- Languages: Python, TypeScript, SQL, Bash
- Frameworks & Libs: FastAPI, React, Next.js, Tailwind CSS
- Databases: PostgreSQL, Redis, Supabase
- Cloud & DevOps: Docker, Kubernetes, AWS, GitHub Actions CI/CD
- Testing: Pytest, Vitest, TDD methodology
- Architecture: REST APIs, Microservices, Async Queues

EXPERIENCE
Lead Systems Engineer — Scaled asynchronous FastAPI microservices serving 400k req/day.
Implemented automated Pytest suites and multi-stage Docker containerization.`);
    setGithubUser('alexrivera-dev');
    setCandidateName('David Miller');
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-6 sm:p-10 max-w-4xl mx-auto my-8 relative overflow-hidden">
      
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neutral-900 via-[#d4ff3a] to-neutral-900"></div>

      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 bg-[#d4ff3a]/30 text-neutral-900 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-[#d4ff3a]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Automated Verification Pipeline</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          Verify New Résumé Document & GitHub
        </h2>
        <p className="text-sm text-neutral-500 mt-2">
          Upload any engineering résumé. PyMuPDF extracts claimed skills; SkillProof then audits the candidate’s GitHub repositories for tests, deployments, and commit history.
        </p>
      </div>

      {/* 1-Click Fast Demos Bar */}
      <div className="mb-6 p-4 bg-[#fbfbfa] rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-semibold text-neutral-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#d4ff3a] border border-black animate-pulse"></span>
          <span>Fast 1-Click Demo Profiles:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {sampleCandidates.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectSample(c)}
              className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-900 hover:text-white border border-neutral-300 text-xs font-bold transition-all shadow-xs"
            >
              <img src={c.avatar_url} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
              <span>{c.name}</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full font-mono">
                {c.overall_proof_score}%
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleLoadSampleResume}
            className="text-xs font-bold text-neutral-900 bg-[#d4ff3a] px-3 py-1.5 rounded-full border border-black hover:bg-[#c2f026] transition-all"
          >
            Load Sample CV Text
          </button>
        </div>
      </div>

      {/* Input Mode Selector: Upload PDF vs Paste Text */}
      <div className="flex items-center gap-2 mb-6 border-b border-neutral-200 pb-3">
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            inputMode === 'upload'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:text-black'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Upload PDF Résumé (PyMuPDF)</span>
        </button>
        <button
          type="button"
          onClick={() => setInputMode('paste')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            inputMode === 'paste'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:text-black'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Paste Résumé Text</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Loading / Auditing Visualizer */}
      {isLoading ? (
        <div className="py-12 px-6 bg-neutral-950 text-white rounded-2xl border border-neutral-800 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#d4ff3a] text-black flex items-center justify-center mx-auto shadow-glow-lime animate-bounce">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Auditing Candidate Evidence...</h3>
            <p className="text-xs text-neutral-400 mt-1">Inspecting actual code, commits, and tests across GitHub</p>
          </div>

          <div className="max-w-md mx-auto space-y-3 text-left font-mono text-xs">
            <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${auditStep >= 1 ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-neutral-800 text-neutral-500'}`}>
              <CheckCircle2 className={`w-4 h-4 ${auditStep >= 1 ? 'text-emerald-400' : 'text-neutral-600'}`} />
              <span>1. Extracting text from document via PyMuPDF</span>
            </div>
            <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${auditStep >= 2 ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-neutral-800 text-neutral-500'}`}>
              <CheckCircle2 className={`w-4 h-4 ${auditStep >= 2 ? 'text-emerald-400' : 'text-neutral-600'}`} />
              <span>2. Parsing claimed skills across tech categories</span>
            </div>
            <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${auditStep >= 3 ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-neutral-800 text-neutral-500'}`}>
              <CheckCircle2 className={`w-4 h-4 ${auditStep >= 3 ? 'text-emerald-400' : 'text-neutral-600'}`} />
              <span>3. Querying GitHub REST API for public repositories</span>
            </div>
            <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${auditStep >= 4 ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-neutral-800 text-neutral-500'}`}>
              <CheckCircle2 className={`w-4 h-4 ${auditStep >= 4 ? 'text-emerald-400' : 'text-neutral-600'}`} />
              <span>4. Auditing test frameworks, Dockerfiles, and recency</span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Option A: PDF Upload Dropzone */}
          {inputMode === 'upload' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-neutral-900 bg-neutral-50 scale-[1.01]'
                  : file
                  ? 'border-[#d4ff3a] bg-[#d4ff3a]/10'
                  : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50'
              }`}
              onClick={() => document.getElementById('pdf-input').click()}
            >
              <input
                id="pdf-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    setErrorMessage('');
                  }
                }}
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black text-[#d4ff3a] flex items-center justify-center shadow-md">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-neutral-900">{file.name}</p>
                    <p className="text-xs text-neutral-500">{(file.size / 1024).toFixed(1)} KB • Ready for PyMuPDF extraction</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="ml-4 text-xs text-rose-600 font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center mx-auto mb-3 text-neutral-700">
                    <UploadCloud className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <p className="text-sm font-bold text-neutral-900">
                    Drop your candidate résumé (PDF) here, or <span className="text-neutral-950 underline decoration-[#d4ff3a] decoration-2">browse files</span>
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">PyMuPDF automatically extracts claimed skills, education, and experience</p>
                </div>
              )}
            </div>
          )}

          {/* Option B: Paste Text */}
          {inputMode === 'paste' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Paste Résumé Text:
              </label>
              <textarea
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste candidate technical résumé, bio, and claimed technologies here..."
                className="w-full p-4 rounded-xl border border-neutral-300 font-mono text-xs focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all bg-neutral-50/50"
              />
            </div>
          )}

          {/* Candidate Details & GitHub Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Candidate GitHub Username <span className="text-neutral-400 font-normal">(Public repos)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <GithubIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  placeholder="e.g. alexrivera-dev or torvalds"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 text-sm font-medium transition-all"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">If blank, SkillProof checks for @username inside the résumé.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Candidate Name <span className="text-neutral-400 font-normal">(Optional override)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Extracted from document if blank"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 text-sm font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit Verification Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-neutral-950 hover:bg-neutral-900 text-white font-extrabold text-sm sm:text-base py-4 rounded-2xl shadow-lg transition-all border border-neutral-800 disabled:opacity-70 group"
          >
            <span>Run SkillProof Audit Engine</span>
            <div className="w-6 h-6 rounded-full bg-[#d4ff3a] text-neutral-950 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>

        </form>
      )}

    </div>
  );
}
