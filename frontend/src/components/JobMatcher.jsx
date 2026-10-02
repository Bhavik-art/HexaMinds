import React, { useState } from 'react';
import { Briefcase, ArrowRight, CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles, FileText } from 'lucide-react';
import { matchJobWithSkills } from '../api';

const SAMPLE_JOBS = [
  {
    title: 'Senior Python & FastAPI Engineer',
    desc: 'We are looking for a Senior Backend Engineer proficient in Python, FastAPI, and PostgreSQL. Experience with Docker containerization, Pytest unit testing, and GitHub Actions CI/CD is required. Nice to have: AWS, Redis, and React fundamentals.',
  },
  {
    title: 'Full Stack React & Node Developer',
    desc: 'Seeking a Full Stack Developer skilled in JavaScript, TypeScript, React, and Node.js. Must have experience building REST APIs with Express or Next.js, and writing test suites with Jest or Vitest. Experience with Docker and Tailwind CSS preferred.',
  },
];

export default function JobMatcher({ userData, setUserData, onProceed }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOBS[0].desc);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchResult, setMatchResult] = useState(userData.jobMatch || null);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }

    if (!userData.userId) {
      setError('Please upload a resume or connect GitHub first to establish your skill profile.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await matchJobWithSkills(userData.userId, jobTitle.trim(), jobDescription.trim());
      setMatchResult(res);
      setUserData((prev) => ({
        ...prev,
        jobMatch: res,
      }));
    } catch (err) {
      setError(err.message || 'Job matching failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Step 4: Evidence-Weighted Job Matching</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          Compare Proofs to Job Description
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
          Our algorithm weighs required skills at 80% and nice-to-have at 20%, adjusting for proven vs claimed proof strength.
        </p>
      </div>

      {/* Input Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        {/* Sample Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Or pick a sample Job Description template:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_JOBS.map((job, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setJobTitle(job.title);
                  setJobDescription(job.desc);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500/50 transition flex items-center space-x-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{job.title}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleMatch} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="job-title-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Target Job Title (Optional)
            </label>
            <input
              id="job-title-input"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="job-desc-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Job Description Text
            </label>
            <textarea
              id="job-desc-input"
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste full job requirements and responsibilities here..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              id="match-job-btn"
              type="submit"
              disabled={loading || !jobDescription.trim()}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                loading || !jobDescription.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Match with Groq AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Compute Match Score</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Match Result Display */}
      {matchResult && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overall Match</span>
              <h2 className="text-xl font-bold text-white">{matchResult.job_title || 'Target Job Match'}</h2>
              <p className="text-xs text-slate-400">{matchResult.summary}</p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Circular Score Badge */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-extrabold text-2xl border shadow-xl ${
                    matchResult.match_score >= 80
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20'
                      : matchResult.match_score >= 50
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/20'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/20'
                  }`}
                >
                  <span>{matchResult.match_score.toFixed(0)}%</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Score</span>
                </div>
              </div>

              <button
                id="generate-microtasks-cta-btn"
                onClick={onProceed}
                className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30"
              >
                <span>Generate Micro-Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grid of Matched vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Matched Skills ({matchResult.matched_skills.length})</span>
              </span>

              <div className="space-y-2">
                {matchResult.matched_skills.map((skill, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{skill.skill_name}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Level: {skill.evidence_level}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        skill.match_strength === 'strong'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : skill.match_strength === 'moderate'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {skill.match_strength} match
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Skills / Gaps */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Identified Skill Gaps ({matchResult.missing_skills.length})</span>
              </span>

              <div className="space-y-2">
                {matchResult.missing_skills.length > 0 ? (
                  matchResult.missing_skills.map((skill, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between text-xs text-rose-300"
                    >
                      <span className="font-semibold">{skill}</span>
                      <span className="text-[10px] uppercase font-bold text-rose-400">Needs Evidence</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                    All required skills are covered in your profile!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
