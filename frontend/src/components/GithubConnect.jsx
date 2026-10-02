import React, { useState } from 'react';
import { Search, CheckCircle2, ArrowRight, AlertCircle, Loader2, GitBranch, Terminal, ShieldAlert } from 'lucide-react';
import GithubIcon from './GithubIcon';
import { analyzeGithub, getUserSkills } from '../api';

export default function GithubConnect({ userData, setUserData, onProceed }) {
  const [username, setUsername] = useState(userData.githubUsername || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a GitHub username.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Analyze GitHub repositories
      const ghRes = await analyzeGithub(username.trim(), userData.userId);
      setAnalysisResult(ghRes);

      // 2. Fetch computed scores for all skills
      const skillsRes = await getUserSkills(username.trim());

      setUserData((prev) => ({
        ...prev,
        githubUsername: username.trim(),
        githubProfile: ghRes,
        scoredSkills: skillsRes.skills,
        provenCount: skillsRes.proven_count,
        partialCount: skillsRes.partial_count,
        claimedOnlyCount: skillsRes.claimed_only_count,
      }));
    } catch (err) {
      setError(err.message || 'Failed to scan GitHub profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <GithubIcon className="w-3.5 h-3.5" />
          <span>Step 2: Cross-Reference Repositories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          Verify Evidence on GitHub
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
          We inspect your public repositories, dependencies (package.json, requirements.txt, go.mod), test suites, CI pipelines, and recent commits.
        </p>
      </div>

      {/* Input Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl">
        <form onSubmit={handleScan} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="github-username-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              GitHub Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <GithubIcon className="w-5 h-5" />
              </div>
              <input
                id="github-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. torvalds or your-handle"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              {userData.claimedSkills?.length ? `Verifying ${userData.claimedSkills.length} claimed skills` : 'No resume uploaded yet'}
            </span>

            <button
              id="scan-github-btn"
              type="submit"
              disabled={loading || !username.trim()}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                loading || !username.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-600/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning Repositories & Tests...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Scan & Score Evidence</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Card */}
      {analysisResult && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center">
                <img
                  src={`https://github.com/${analysisResult.username}.png`}
                  alt={analysisResult.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>@{analysisResult.username}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </h2>
                <p className="text-xs text-slate-400">
                  {analysisResult.public_repos} public repos • {analysisResult.repositories_analyzed} repos analyzed
                </p>
              </div>
            </div>

            <button
              id="proceed-to-dashboard-btn"
              onClick={onProceed}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/25"
            >
              <span>View Proof Breakdown</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Proven Skills</span>
              <p className="text-2xl font-extrabold text-white">{userData.provenCount || 0}</p>
              <p className="text-[11px] text-slate-400">Verified by code, tests & deps (80+ pts)</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Partial Skills</span>
              <p className="text-2xl font-extrabold text-white">{userData.partialCount || 0}</p>
              <p className="text-[11px] text-slate-400">Moderate code signals (40–79 pts)</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Claimed Only</span>
              <p className="text-2xl font-extrabold text-white">{userData.claimedOnlyCount || 0}</p>
              <p className="text-[11px] text-slate-400">On resume without strong Git proof (&lt;40 pts)</p>
            </div>
          </div>

          {/* Languages Breakdown */}
          {analysisResult.languages && Object.keys(analysisResult.languages).length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Primary Languages Detected</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(analysisResult.languages).slice(0, 8).map(([lang, bytes]) => (
                  <span
                    key={lang}
                    className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700/60 text-xs font-medium text-slate-300 flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>{lang}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{(bytes / 1024).toFixed(0)} KB</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
