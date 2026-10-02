import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, ExternalLink, ShieldCheck, 
  GitBranch, GitCommit, Terminal, Layers, Search, Filter, Sparkles 
} from 'lucide-react';

export default function SkillMatrix({ skills, githubUsername, onInspectEvidence }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', 'Languages', 'Frameworks & Libraries', 'Databases & Storage', 'Cloud & DevOps', 'Testing & QA', 'Architecture & APIs'];

  const filteredSkills = skills.filter((skill) => {
    const matchesStatus = statusFilter === 'ALL' || skill.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || skill.category === categoryFilter;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4ff3a]" />
            <span>Deep Code Evidence Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
            Claimed vs. Verifiable Proof
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Every skill extracted from the résumé is scrutinized for actual repository code, tests, and deployments.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search skill (e.g. Pytest, Docker)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none focus:border-neutral-950"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200">
        
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400'
            }`}
          >
            All ({skills.length})
          </button>
          <button
            onClick={() => setStatusFilter('PROVEN')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'PROVEN'
                ? 'bg-[#d4ff3a] text-neutral-950 border border-black shadow-xs'
                : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Proven ({skills.filter(s => s.status === 'PROVEN').length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('PARTIAL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'PARTIAL'
                ? 'bg-amber-400 text-black border border-amber-600 shadow-xs'
                : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Partial ({skills.filter(s => s.status === 'PARTIAL').length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('CLAIMED_ONLY')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'CLAIMED_ONLY'
                ? 'bg-rose-500 text-white border border-rose-700 shadow-xs'
                : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Claimed Only ({skills.filter(s => s.status === 'CLAIMED_ONLY').length})</span>
          </button>
        </div>

        {/* Category Dropdown/Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
              }`}
            >
              {cat === 'ALL' ? 'All Domains' : cat.split(' ')[0]}
            </button>
          ))}
        </div>

      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill) => {
          const isProven = skill.status === 'PROVEN';
          const isPartial = skill.status === 'PARTIAL';
          const isClaimedOnly = skill.status === 'CLAIMED_ONLY';

          return (
            <div
              key={skill.id}
              className={`rounded-2xl p-5 border transition-all duration-200 bg-white flex flex-col justify-between ${
                isProven
                  ? 'border-neutral-200 hover:border-black shadow-xs hover:shadow-md'
                  : isPartial
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div>
                {/* Header: Skill Name & Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-neutral-950 tracking-tight flex items-center gap-2">
                      <span>{skill.name}</span>
                    </h3>
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      {skill.category}
                    </span>
                  </div>

                  {/* Status Pill Badge */}
                  <div>
                    {isProven && (
                      <span className="inline-flex items-center gap-1 bg-[#d4ff3a] text-neutral-950 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-neutral-900 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                        <span>PROVEN</span>
                      </span>
                    )}
                    {isPartial && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        <span>PARTIAL</span>
                      </span>
                    )}
                    {isClaimedOnly && (
                      <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-rose-300">
                        <XCircle className="w-3 h-3 text-rose-700" />
                        <span>CLAIMED ONLY</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Claimed Quote Context */}
                <div className="bg-neutral-50 rounded-xl p-2.5 mb-3 border border-neutral-100 text-[11px] text-neutral-600 italic">
                  <span className="font-bold not-italic text-neutral-500 uppercase text-[9px] block mb-0.5">
                    Claimed in Résumé:
                  </span>
                  "{skill.claimed_context}"
                </div>

                {/* Evidence Details */}
                {skill.evidence && skill.evidence.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Repository Code Evidence:
                    </span>
                    {skill.evidence.map((ev, i) => {
                      const cardId = ev.repo_name.includes('starter-kit') ? 'redis' : (skill.name.toLowerCase().includes('docker') ? 'docker' : (skill.name.toLowerCase().includes('react') ? 'react' : 'pytest'));
                      return (
                        <div 
                          key={i} 
                          onClick={() => onInspectEvidence?.(cardId)}
                          className="bg-neutral-900 text-white rounded-xl p-3 text-xs font-mono border border-neutral-800 hover:border-[#d4ff3a]/60 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1 text-[#d4ff3a] font-bold">
                              <GitBranch className="w-3 h-3" />
                              <span className="group-hover:underline">{ev.repo_name}</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-sans">{ev.commit_date}</span>
                          </div>

                          <p className="text-[11px] font-sans text-neutral-300 leading-snug mb-2">
                            {ev.summary}
                          </p>

                          {/* Evidence Tags */}
                          <div className="flex flex-wrap gap-1.5 text-[10px] font-sans font-bold">
                            {ev.tests_detected && (
                              <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-800 flex items-center gap-1">
                                ✓ {ev.test_framework || 'Tests'} verified
                              </span>
                            )}
                            {ev.deployment_detected && (
                              <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded-md border border-blue-800 flex items-center gap-1">
                                ✓ {ev.deployment_target || 'Deployment'}
                              </span>
                            )}
                            {ev.has_readme && (
                              <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-700">
                                ✓ README
                              </span>
                            )}
                          </div>

                          {/* Click to Inspect Prompt */}
                          <div className="mt-2.5 pt-1.5 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-sans text-neutral-400 group-hover:text-[#d4ff3a] transition-colors">
                            <span>Inspect commit hash, file tree & CI logs</span>
                            <span className="font-bold text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-rose-50/80 rounded-xl p-3 border border-rose-100 text-xs text-rose-800 mt-3">
                    <p className="font-bold flex items-center gap-1.5 text-rose-900">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Zero Verifiable GitHub Evidence</span>
                    </p>
                    <p className="text-[11px] text-rose-700 mt-1 leading-snug">
                      Candidate listed this skill on their résumé, but no public repositories, commits, or dependencies were found in their GitHub account.
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer: Confidence Score & Recency */}
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
                <span>Confidence: <strong className="text-neutral-900 font-bold">{skill.confidence_score}%</strong></span>
                <span>Active: <strong className="text-neutral-900">{skill.last_used}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 my-4">
          <p className="text-neutral-500 font-semibold text-sm">No skills found matching this filter criteria.</p>
        </div>
      )}

    </div>
  );
}
