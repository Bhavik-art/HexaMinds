import React from 'react';
import { X, ShieldCheck, Download, Copy, Check, ExternalLink, Award } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, candidate }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !candidate) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(candidate, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `skillproof-audit-${candidate.github_username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Audit Certificate Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-[#d4ff3a] flex items-center justify-center shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-neutral-950">Official SkillProof™ Audit</h3>
              <span className="bg-[#d4ff3a] text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black">
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-neutral-500">Cryptographically signed repository evidence report</p>
          </div>
        </div>

        {/* Candidate Summary Block */}
        <div className="bg-[#fbfbfa] p-5 rounded-2xl border border-neutral-200 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={candidate.avatar_url} alt={candidate.name} className="w-12 h-12 rounded-full border border-neutral-900 object-cover" />
            <div>
              <h4 className="font-extrabold text-sm text-neutral-950">{candidate.name}</h4>
              <p className="text-xs text-neutral-500">@{candidate.github_username} • {candidate.title}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-neutral-400 block uppercase">Proof Score</span>
            <span className="text-2xl font-black text-neutral-950">{candidate.overall_proof_score}%</span>
          </div>
        </div>

        {/* Verified Skills Breakdown */}
        <div className="space-y-4 mb-6">
          <h4 className="font-extrabold text-xs text-neutral-700 uppercase tracking-wider">
            Repository Evidence Summary:
          </h4>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <span className="text-xl font-black text-emerald-700">{candidate.proven_count}</span>
              <span className="text-[11px] font-bold text-emerald-800 block">Proven Skills</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
              <span className="text-xl font-black text-amber-700">{candidate.partial_count}</span>
              <span className="text-[11px] font-bold text-amber-800 block">Partial Evidence</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
              <span className="text-xl font-black text-rose-700">{candidate.claimed_only_count}</span>
              <span className="text-[11px] font-bold text-rose-800 block">Unverified Claims</span>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-2xl p-4 max-h-48 overflow-y-auto space-y-2 text-xs">
            {candidate.skills.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-1 border-b border-neutral-100 last:border-0">
                <span className="font-bold text-neutral-900">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400">{s.category}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    s.status === 'PROVEN' ? 'bg-[#d4ff3a] text-black border border-black' :
                    s.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownloadJson}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-900 text-white font-bold py-3 rounded-xl text-xs transition-all"
          >
            <Download className="w-4 h-4 text-[#d4ff3a]" />
            <span>Download Audit JSON</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-900 font-bold py-3 rounded-xl text-xs border border-neutral-300 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-neutral-600" />}
            <span>{copied ? 'Link Copied!' : 'Share Recruiter Link'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
