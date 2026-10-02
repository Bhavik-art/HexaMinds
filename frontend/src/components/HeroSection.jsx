import React from 'react';
import { ArrowUpRight, CheckCircle2, ShieldCheck, GitCommit, Play, Sparkles, Terminal } from 'lucide-react';

export default function HeroSection({ onOpenAudit, onSelectSample, sampleCandidates, onInspectCard }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
      
      {/* Subtle curved background aesthetic lines */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
        <div className="w-[850px] h-[850px] rounded-full border border-neutral-300/60 -translate-y-12"></div>
        <div className="absolute w-[1150px] h-[1150px] rounded-full border border-neutral-200/50 -translate-y-12"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 bg-neutral-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm border border-neutral-800">
          <Sparkles className="w-3.5 h-3.5 text-[#d4ff3a]" />
          <span>The Code-Verified Talent Intelligence Engine</span>
        </div>

        {/* Massive Bold Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-neutral-950 max-w-4xl mx-auto leading-[1.08] mb-6">
          Certificates Claimed.{' '}
          <span className="relative inline-block text-neutral-900">
            <span className="relative z-10">Evidence Proven.</span>
            <span className="absolute bottom-2 left-0 w-full h-4 bg-[#d4ff3a] -z-0 opacity-80 -rotate-1 rounded-sm"></span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Résumés tell recruiters what a candidate claims. <span className="font-semibold text-neutral-900">SkillProof</span> inspects actual GitHub code: test suites, commit recency, Docker deployments, READMEs, and upstream pull requests.
        </p>

        {/* Main Hero Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onOpenAudit}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#d4ff3a] hover:bg-[#c6f322] text-neutral-950 font-extrabold text-sm sm:text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-neutral-950 group hover:-translate-y-0.5"
          >
            <span>Verify Resume & GitHub</span>
            <div className="w-7 h-7 rounded-full bg-neutral-950 text-[#d4ff3a] flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </div>
          </button>

          <div className="flex items-center gap-2 bg-neutral-950 text-white px-3 py-2 rounded-full border border-neutral-800 shadow-md">
            <span className="text-xs font-semibold text-neutral-400 pl-3">Try 1-Click:</span>
            {sampleCandidates.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectSample(c)}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-[#d4ff3a] hover:text-black transition-all flex items-center gap-1.5"
              >
                <span>{c.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-70">({c.overall_proof_score}%)</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4 Floating Polaroid Evidence Cards (Inspiration from Image 1) */}
        <div className="relative mt-8 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          {/* Card 1: Pytest Suite */}
          <div 
            onClick={() => onInspectCard?.('pytest')}
            className="polaroid-card p-4 rotate-[-4deg] hover:rotate-0 transition-transform duration-300 cursor-pointer group"
          >
            <div className="bg-neutral-950 text-white rounded-xl p-3 mb-3 border border-neutral-800 font-mono text-[11px] group-hover:border-[#d4ff3a]/50 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-2 border-b border-neutral-800 pb-1.5">
                <span className="flex items-center gap-1"><Terminal className="w-3 h-3 text-[#d4ff3a]" /> pytest-cov</span>
                <span className="text-emerald-400 font-bold">94% PASSED</span>
              </div>
              <div className="text-emerald-300 text-[10px] space-y-0.5">
                <p>✓ test_async_worker.py (0.12s)</p>
                <p>✓ test_redis_throttle.py (0.04s)</p>
                <p>✓ test_jwt_auth.py (0.08s)</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-neutral-900 group-hover:text-black">Pytest Automated Suite</h4>
                <p className="text-[10px] text-neutral-500">async-task-engine • 3d ago</p>
              </div>
              <span className="bg-[#d4ff3a] text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black shadow-2xs">
                PROVEN
              </span>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] font-medium text-neutral-400 group-hover:text-neutral-900 transition-colors">
              <span>Inspect Code & CI Logs</span>
              <span className="font-bold text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </div>
          </div>

          {/* Card 2: Docker & CI/CD */}
          <div 
            onClick={() => onInspectCard?.('docker')}
            className="polaroid-card p-4 rotate-[3deg] hover:rotate-0 transition-transform duration-300 cursor-pointer group"
          >
            <div className="bg-neutral-950 text-white rounded-xl p-3 mb-3 border border-neutral-800 font-mono text-[11px] group-hover:border-[#d4ff3a]/50 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-2 border-b border-neutral-800 pb-1.5">
                <span className="flex items-center gap-1">🐳 Dockerfile</span>
                <span className="text-[#d4ff3a] font-bold">118MB</span>
              </div>
              <div className="text-neutral-300 text-[10px] space-y-0.5">
                <p className="text-neutral-500">FROM python:3.11-slim</p>
                <p className="text-neutral-400">RUN useradd -m appuser</p>
                <p className="text-neutral-300">USER appuser</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-neutral-900 group-hover:text-black">Multi-Stage Docker</h4>
                <p className="text-[10px] text-neutral-500">GH Actions CI • Verified</p>
              </div>
              <span className="bg-[#d4ff3a] text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black shadow-2xs">
                PROVEN
              </span>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] font-medium text-neutral-400 group-hover:text-neutral-900 transition-colors">
              <span>Inspect Code & CI Logs</span>
              <span className="font-bold text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </div>
          </div>

          {/* Card 3: React & Vitest */}
          <div 
            onClick={() => onInspectCard?.('react')}
            className="polaroid-card p-4 rotate-[-3deg] hover:rotate-0 transition-transform duration-300 cursor-pointer group"
          >
            <div className="bg-neutral-950 text-white rounded-xl p-3 mb-3 border border-neutral-800 font-mono text-[11px] group-hover:border-[#d4ff3a]/50 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-2 border-b border-neutral-800 pb-1.5">
                <span className="flex items-center gap-1">⚛️ React 18</span>
                <span className="text-sky-400 font-bold">Vercel Live</span>
              </div>
              <div className="text-neutral-300 text-[10px] space-y-0.5">
                <p className="text-emerald-400">✓ 8 custom hooks</p>
                <p className="text-neutral-400">✓ Tailwind tokens</p>
                <p className="text-neutral-400">✓ Zero console errors</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-neutral-900 group-hover:text-black">React + Vitest UI</h4>
                <p className="text-[10px] text-neutral-500">Production Deploy • 7d ago</p>
              </div>
              <span className="bg-[#d4ff3a] text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black shadow-2xs">
                PROVEN
              </span>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] font-medium text-neutral-400 group-hover:text-neutral-900 transition-colors">
              <span>Inspect Code & CI Logs</span>
              <span className="font-bold text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </div>
          </div>

          {/* Card 4: Redis Partial */}
          <div 
            onClick={() => onInspectCard?.('redis')}
            className="polaroid-card p-4 rotate-[4deg] hover:rotate-0 transition-transform duration-300 cursor-pointer group"
          >
            <div className="bg-neutral-950 text-white rounded-xl p-3 mb-3 border border-neutral-800 font-mono text-[11px] group-hover:border-amber-400/50 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-2 border-b border-neutral-800 pb-1.5">
                <span className="flex items-center gap-1">⚡ Redis Cache</span>
                <span className="text-amber-400 font-bold">92d Stale</span>
              </div>
              <div className="text-amber-200 text-[10px] space-y-0.5">
                <p>⚠ Configured in app.py</p>
                <p className="text-neutral-500">⚠ No Lua atomicity</p>
                <p className="text-neutral-500">⚠ 0 dedicated unit tests</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-neutral-900 group-hover:text-black">Redis Caching</h4>
                <p className="text-[10px] text-neutral-500">Stale commit • Audit gap</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                PARTIAL
              </span>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] font-medium text-neutral-400 group-hover:text-neutral-900 transition-colors">
              <span>Inspect Gap & CI Logs</span>
              <span className="font-bold text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </div>
          </div>

        </div>

        {/* Hand-drawn style note (from Image 1 reference) */}
        <button
          type="button"
          onClick={() => onInspectCard?.('pytest')}
          className="mt-8 inline-flex items-center justify-center gap-2 text-xs text-neutral-500 hover:text-neutral-950 font-medium italic cursor-pointer group transition-colors px-4 py-2 rounded-full hover:bg-neutral-200/60"
        >
          <span className="text-sm font-bold group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 transition-transform">⤴</span>
          <span className="underline decoration-neutral-300 group-hover:decoration-neutral-900 underline-offset-4">
            Click any card to inspect commit hashes, repository file trees, and CI logs
          </span>
        </button>

      </div>
    </section>
  );
}
