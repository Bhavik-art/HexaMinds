import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Code2,
  Package,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function EvidenceDashboard({ userData, onProceed }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedSkill, setExpandedSkill] = useState(null);

  const skills = userData.scoredSkills || [];

  const filteredSkills = skills.filter((s) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'proven'
        ? s.evidence_level === 'proven'
        : filter === 'partial'
        ? s.evidence_level === 'partial'
        : s.evidence_level === 'claimed-only';

    const matchesSearch = s.skill_name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pie chart data
  const pieData = [
    { name: 'Proven', value: userData.provenCount || 0, color: '#10b981' },
    { name: 'Partial', value: userData.partialCount || 0, color: '#f59e0b' },
    { name: 'Claimed Only', value: userData.claimedOnlyCount || 0, color: '#64748b' },
  ].filter((d) => d.value > 0);

  // Bar chart data (top 8 skills by score)
  const barData = [...skills]
    .sort((a, b) => b.evidence_score - a.evidence_score)
    .slice(0, 8)
    .map((s) => ({
      name: s.skill_name,
      score: s.evidence_score,
      level: s.evidence_level,
    }));

  const getScoreColor = (level) => {
    switch (level) {
      case 'proven':
        return '#10b981';
      case 'partial':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getBadgeClass = (level) => {
    switch (level) {
      case 'proven':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'partial':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Step 3: Deterministic Proof Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-white">
            Skill Evidence Breakdown
          </h1>
          <p className="text-slate-400 text-sm">
            Scores are deterministically capped across language use, manifest dependencies, tests, CI, and commit history.
          </p>
        </div>

        <button
          id="proceed-to-job-matcher-btn"
          onClick={onProceed}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25 self-start md:self-auto"
        >
          <span>Match Against Job Description</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Evidence Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Total of {skills.length} skills analyzed</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No skill evidence available.</p>
            )}
          </div>

          <div className="flex justify-around pt-3 border-t border-white/5 text-center">
            <div>
              <span className="text-emerald-400 font-bold text-base block">{userData.provenCount || 0}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Proven</span>
            </div>
            <div>
              <span className="text-amber-400 font-bold text-base block">{userData.partialCount || 0}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Partial</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold text-base block">{userData.claimedOnlyCount || 0}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Claimed Only</span>
            </div>
          </div>
        </div>

        {/* Top Scored Skills Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 lg:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Top Verified Skills</h3>
            <p className="text-xs text-slate-400 mb-4">Highest scoring skills based on multi-repo proof signals</p>
          </div>

          <div className="h-56 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} interval={0} angle={-25} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val) => [`${val}/100 pts`, 'Evidence Score']}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={getScoreColor(entry.level)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Run GitHub analysis to view verified skill chart.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Skills' },
            { id: 'proven', label: 'Proven (80-100)' },
            { id: 'partial', label: 'Partial (40-79)' },
            { id: 'claimed-only', label: 'Claimed Only' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Cards Grid */}
      <div className="space-y-3">
        {filteredSkills.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-white/10">
            <FileQuestion className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h4 className="text-white font-semibold text-sm">No skills found</h4>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search or filter.</p>
          </div>
        ) : (
          filteredSkills.map((skill) => {
            const isExpanded = expandedSkill === skill.skill_name;
            return (
              <div
                key={skill.skill_name}
                className="glass-panel rounded-xl border border-white/10 overflow-hidden transition-all duration-200 hover:border-slate-700"
              >
                <div
                  onClick={() => setExpandedSkill(isExpanded ? null : skill.skill_name)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        skill.evidence_level === 'proven'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : skill.evidence_level === 'partial'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {skill.evidence_score}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-sm">{skill.skill_name}</h4>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          {skill.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {skill.explanation || 'Analyzed via GitHub repositories and dependency files.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getBadgeClass(
                        skill.evidence_level
                      )}`}
                    >
                      {skill.evidence_level}
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-slate-950/40 space-y-4 animate-fade-in">
                    {/* Explanation */}
                    {skill.explanation && (
                      <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-indigo-200">AI Evidence Verdict</span>
                          <span>{skill.explanation}</span>
                        </div>
                      </div>
                    )}

                    {/* Breakdown List */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Detailed Signal Contributions
                      </span>
                      {skill.evidence_details && skill.evidence_details.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {skill.evidence_details.map((ev, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-lg bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs"
                            >
                              <div className="space-y-0.5">
                                <span className="font-semibold text-slate-200 block">{ev.detail}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                                  {ev.evidence_type} {ev.repo_name ? `• ${ev.repo_name}` : ''}
                                </span>
                              </div>
                              <span className="font-bold text-emerald-400 font-mono">+{ev.score_contribution} pts</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          No direct evidence detected in GitHub repos. Ranked as claimed-only.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
