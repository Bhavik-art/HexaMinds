import React from 'react';
import { ShieldCheck, Sparkles, Activity } from 'lucide-react';
import GithubIcon from './GithubIcon';

export default function Navbar({ backendStatus, activeTab, setActiveTab }) {
  const tabs = [
    { id: 'resume', label: '1. Resume' },
    { id: 'github', label: '2. GitHub Evidence' },
    { id: 'dashboard', label: '3. Skill Proofs' },
    { id: 'matcher', label: '4. Job Match' },
    { id: 'tasks', label: '5. Micro-Tasks' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('resume')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-extrabold text-xl tracking-tight text-white">
                Skill<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Proof</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Deterministic Evidence Engine</p>
          </div>
        </div>

        {/* Steps Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-white/5 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Status & Links */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              backendStatus === 'online'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : backendStatus === 'offline'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'online'
                  ? 'bg-emerald-400 animate-pulse'
                  : backendStatus === 'offline'
                  ? 'bg-rose-400'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="capitalize">{backendStatus}</span>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            title="GitHub"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
