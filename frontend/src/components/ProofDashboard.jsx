import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar 
} from 'recharts';
import { ShieldCheck, Award, GitBranch, GitCommit, CheckCircle2, AlertTriangle, XCircle, Sparkles, ExternalLink } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function ProofDashboard({ candidate, viewMode }) {
  if (!candidate) return null;

  const {
    name,
    title,
    bio,
    avatar_url,
    github_username,
    overall_proof_score,
    proof_xp,
    total_skills,
    proven_count,
    partial_count,
    claimed_only_count,
    github_stats,
    radar_data,
    activity_timeline
  } = candidate;

  return (
    <div className="space-y-8 my-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Candidate Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4ff3a]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            <img
              src={avatar_url}
              alt={name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-neutral-900 shadow-md"
            />
            <div className="absolute -bottom-2 -right-2 bg-neutral-950 text-[#d4ff3a] rounded-full p-1.5 border border-neutral-800 shadow-sm">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">{name}</h2>
              {/* Proof XP badge inspired by Image 2 (Zero) */}
              <div className="inline-flex items-center gap-1.5 bg-[#d4ff3a] text-neutral-950 px-3 py-1 rounded-full text-xs font-black shadow-xs border border-neutral-900">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+{proof_xp} XP EVIDENCE</span>
              </div>
            </div>

            <p className="text-sm font-semibold text-neutral-700">{title}</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-xl leading-relaxed">{bio}</p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-neutral-600 font-medium">
              <a
                href={`https://github.com/${github_username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-neutral-900 hover:text-black font-bold hover:underline"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>@{github_username}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <span>•</span>
              <span>{github_stats.public_repos} Repositories</span>
              <span>•</span>
              <span>{github_stats.total_stars} Total Stars</span>
              <span>•</span>
              <span>{github_stats.recent_commits_30d} Commits (Last 30d)</span>
            </div>
          </div>
        </div>

        {/* Big Overall Proof Score Gauge */}
        <div className="w-full lg:w-auto flex items-center justify-between sm:justify-start lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-neutral-100">
          <div className="text-left lg:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
              SkillProof Score
            </span>
            <span className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tighter">
              {overall_proof_score}<span className="text-neutral-400 text-2xl font-bold">%</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 block mt-1">
              Verifiable Code Proof
            </span>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#d4ff3a]"
                strokeDasharray={`${overall_proof_score}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-neutral-900">
              <Award className="w-6 h-6 text-neutral-900" />
            </div>
          </div>
        </div>

      </div>

      {/* KPI Proof Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Proven Skills */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Proven Skills</span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#d4ff3a] border border-black"></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-neutral-950">{proven_count}</span>
            <span className="text-xs text-neutral-500 font-medium">of {total_skills} claimed</span>
          </div>
          <p className="text-xs text-emerald-800 font-medium mt-2 bg-emerald-50 p-2 rounded-xl border border-emerald-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Backed by real repos, test suites & recent commits</span>
          </p>
        </div>

        {/* Partial Skills */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Partial Evidence</span>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600"></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-neutral-950">{partial_count}</span>
            <span className="text-xs text-neutral-500 font-medium">skills</span>
          </div>
          <p className="text-xs text-amber-800 font-medium mt-2 bg-amber-50 p-2 rounded-xl border border-amber-100 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Found in 1 repo or stale commit (&gt;90d) without tests</span>
          </p>
        </div>

        {/* Claimed-Only / Keyword Stuffed */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Claimed Only</span>
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-700"></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-neutral-950">{claimed_only_count}</span>
            <span className="text-xs text-rose-600 font-semibold font-mono">0 Git Evidence</span>
          </div>
          <p className="text-xs text-rose-800 font-medium mt-2 bg-rose-50 p-2 rounded-xl border border-rose-100 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Written on résumé, but zero GitHub repositories or commits</span>
          </p>
        </div>

      </div>

      {/* Dual Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart: Claimed vs Proven */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-neutral-950 tracking-tight">
                Skill Proof Radar: Claimed vs. Verifiable
              </h3>
              <p className="text-xs text-neutral-500">
                Comparing what was claimed in the résumé against confirmed repository evidence
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300"></span>
                <span className="text-neutral-500">Claimed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b8e61e]"></span>
                <span className="text-neutral-900">Proven</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar_data} outerRadius="75%">
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#525252', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#d4d4d4" />
                <Radar name="Claimed" dataKey="claimed" stroke="#9ca3af" fill="#d1d5db" fillOpacity={0.25} />
                <Radar name="Proven" dataKey="proven" stroke="#111827" fill="#d4ff3a" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart: Commit Recency & Verification History */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-neutral-950 tracking-tight">
                Commit Cadence & Active Recency
              </h3>
              <p className="text-xs text-neutral-500">
                Frequency and distribution of commits in verified skill repositories
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-neutral-100 px-2.5 py-1 rounded-full text-neutral-700">
              Active Streak: Verified
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4ff3a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d4ff3a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="commits" stroke="#111" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCommits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
