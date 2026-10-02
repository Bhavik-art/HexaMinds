import React from 'react';
import { ShieldCheck, Award, Briefcase, Download, Sparkles, UserCheck, RefreshCw } from 'lucide-react';

export default function FloatingDock({ 
  candidate, 
  activeTab, 
  setActiveTab, 
  onOpenAudit, 
  onExportReport,
  sampleCandidates,
  onSelectSample 
}) {
  if (!candidate) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[95vw]">
      <div className="glass-dock px-3 sm:px-4 py-2.5 rounded-full flex items-center gap-2 sm:gap-3 text-white shadow-dock border border-white/15">
        
        {/* Active Candidate Pill with Avatar */}
        <div className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 border-r border-white/15">
          <img
            src={candidate.avatar_url}
            alt={candidate.name}
            className="w-7 h-7 rounded-full object-cover border border-[#d4ff3a]"
          />
          <div className="hidden sm:block text-left">
            <span className="text-xs font-black block leading-none">{candidate.name}</span>
            <span className="text-[10px] text-[#d4ff3a] font-mono leading-none">{candidate.overall_proof_score}% PROVEN</span>
          </div>
        </div>

        {/* Quick Switch Candidates */}
        <div className="hidden md:flex items-center gap-1 border-r border-white/15 pr-2">
          {sampleCandidates.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectSample(c)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                c.id === candidate.id
                  ? 'bg-[#d4ff3a] text-black font-extrabold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Navigation Shortcut Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('explore')}
            title="Proof Overview"
            className={`p-2 rounded-full transition-all ${
              activeTab === 'explore' ? 'bg-white/20 text-[#d4ff3a]' : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            title="Evidence Matrix"
            className={`p-2 rounded-full transition-all ${
              activeTab === 'matrix' ? 'bg-white/20 text-[#d4ff3a]' : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('matcher')}
            title="Job Matcher"
            className={`p-2 rounded-full transition-all ${
              activeTab === 'matcher' ? 'bg-white/20 text-[#d4ff3a]' : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Briefcase className="w-4 h-4" />
          </button>
        </div>

        {/* Export / Audit Actions */}
        <div className="flex items-center gap-2 border-l border-white/15 pl-2">
          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-neutral-100 transition-all border border-white/10"
          >
            <Download className="w-3.5 h-3.5 text-[#d4ff3a]" />
            <span className="hidden sm:inline">Export Audit</span>
          </button>

          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-[#d4ff3a] hover:bg-[#c2f026] text-neutral-950 transition-all shadow-sm"
          >
            <RefreshCw className="w-3 h-3 stroke-[2.5]" />
            <span>Verify New</span>
          </button>
        </div>

      </div>
    </div>
  );
}
