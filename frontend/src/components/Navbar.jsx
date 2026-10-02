import React from 'react';
import { ShieldCheck, ArrowUpRight, Sparkles, Terminal, Briefcase, Award } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, viewMode, setViewMode, onOpenAudit, backendOnline }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f7f7f5]/85 border-b border-black/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-10 h-10 rounded-2xl bg-black text-[#d4ff3a] flex items-center justify-center font-black text-xl shadow-md border border-neutral-800">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-neutral-900">SkillProof</span>
              <span className="bg-[#d4ff3a] text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-neutral-800 tracking-wider">
                v2.4 EVIDENCE
              </span>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${backendOnline ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-neutral-200 text-neutral-600 border border-neutral-300'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`}></span>
                {backendOnline ? 'API 8000 Online' : 'API Connecting'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium hidden sm:block">Code-Verified Engineering Intelligence</p>
          </div>
        </div>

        {/* Center Navigation Pills */}
        <nav className="hidden md:flex items-center bg-white/90 p-1.5 rounded-full border border-black/10 shadow-sm">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === 'explore'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
          >
            Proof Overview
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'verify'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d4ff3a]" />
            Verify Résumé
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeTab === 'matrix'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
          >
            Evidence Matrix
          </button>
          <button
            onClick={() => setActiveTab('matcher')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'matcher'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Job Matcher & Gaps
          </button>
          <button
            onClick={() => setActiveTab('microtasks')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'microtasks'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
          >
            <Award className="w-3.5 h-3.5 text-[#b8e61e]" />
            Gap Closer
          </button>
        </nav>

        {/* Right Action Buttons */}


      </div>
    </header>
  );
}
