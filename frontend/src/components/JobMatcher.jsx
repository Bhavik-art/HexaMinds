import React, { useState } from 'react';
import { 
  Briefcase, CheckCircle2, AlertTriangle, XCircle, ArrowRight, 
  Sparkles, Clock, Target, CheckSquare, Square, ChevronRight, Terminal, Award, Loader2, Filter 
} from 'lucide-react';
import { generateDefaultMicroTask } from '../utils/formatters';

export default function JobMatcher({ 
  candidate, 
  onMatchJob, 
  matchResult, 
  isLoadingMatch, 
  sampleJds = [], 
  viewOnlyTasks = false 
}) {
  const [jobText, setJobText] = useState(sampleJds[0]?.text || '');
  const [selectedJdId, setSelectedJdId] = useState(sampleJds[0]?.id || '');
  const [checkedChecklist, setCheckedChecklist] = useState({});
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('ALL');

  const handleSelectPreset = (jd) => {
    setSelectedJdId(jd.id);
    setJobText(jd.text);
  };

  const handleRunMatch = (e) => {
    e.preventDefault();
    if (!jobText.trim()) return;
    onMatchJob({
      job_description: jobText,
      candidate_data: candidate,
      candidate_id: candidate?.id
    });
  };

  const toggleCheck = (taskId, idx) => {
    const key = `${taskId}-${idx}`;
    setCheckedChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Derive micro-tasks from matchResult or fallback to candidate's partial & claimed skills
  let activeMicroTasks = matchResult?.gap_micro_tasks || [];
  if (activeMicroTasks.length === 0 && candidate?.skills) {
    const unprovenSkills = candidate.skills
      .filter(s => s.status !== 'PROVEN')
      .map(s => s.name);
    const targetGaps = unprovenSkills.length > 0 
      ? unprovenSkills.slice(0, 4) 
      : ['Docker', 'Kubernetes', 'AWS', 'Redis'];
    activeMicroTasks = targetGaps.map(skill => generateDefaultMicroTask(skill));
  }

  // Filter tasks if skill filter applied
  const filteredTasks = selectedSkillFilter === 'ALL'
    ? activeMicroTasks
    : activeMicroTasks.filter(t => t.skill?.toLowerCase() === selectedSkillFilter.toLowerCase());

  const availableSkills = ['ALL', ...Array.from(new Set(activeMicroTasks.map(t => t.skill).filter(Boolean)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 space-y-10">
      
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-[#d4ff3a]/40 text-neutral-950 text-xs font-black px-3.5 py-1 rounded-full mb-3 border border-neutral-900 shadow-xs">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{viewOnlyTasks ? 'Targeted Proof Engine' : 'Intelligent JD Parser & Gap Closer'}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
          {viewOnlyTasks ? 'Actionable Micro-Tasks & Gap Closer' : 'Job Description Match & Micro-Task Generator'}
        </h2>
        <p className="text-sm text-neutral-500 mt-2">
          {viewOnlyTasks 
            ? 'Complete these hands-on 2–4 hour projects, push to GitHub with test suites, and transform unverified competencies into verified Proven badges.'
            : 'Paste any job description. SkillProof extracts its required skills, calculates verifiable code matches, and generates custom micro-tasks for every skill deficiency.'}
        </p>
      </div>

      {/* Preset JD Picker & Input Form (Hidden or Secondary in viewOnlyTasks mode) */}
      <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm max-w-4xl mx-auto ${viewOnlyTasks ? 'order-2' : ''}`}>
        
        {/* Preset Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-neutral-100">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Quick Job Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {(sampleJds || []).map((jd) => (
              <button
                key={jd.id}
                type="button"
                onClick={() => handleSelectPreset(jd)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedJdId === jd.id
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                }`}
              >
                {jd.title?.split('—')[0] || jd.title}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area Form */}
        <form onSubmit={handleRunMatch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Paste Technical Job Description:
            </label>
            <textarea
              rows={5}
              value={jobText}
              onChange={(e) => {
                setJobText(e.target.value);
                setSelectedJdId('');
              }}
              placeholder="Paste requirements, tech stack, and responsibilities here..."
              className="w-full p-4 rounded-2xl border border-neutral-300 font-mono text-xs focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950 transition-all bg-neutral-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoadingMatch || !jobText.trim()}
            className="w-full flex items-center justify-center gap-3 bg-[#d4ff3a] hover:bg-[#c6f322] text-neutral-950 font-black text-sm sm:text-base py-3.5 rounded-2xl border-2 border-neutral-950 shadow-md transition-all group disabled:opacity-60 cursor-pointer"
          >
            {isLoadingMatch ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Extracting Requirements & Computing Code Match...</span>
              </div>
            ) : (
              <>
                <span>Calculate Match Score & Generate Gap Closers</span>
                <div className="w-6 h-6 rounded-full bg-neutral-950 text-[#d4ff3a] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </>
            )}
          </button>
        </form>

      </div>

      {/* Match Results Display */}
      {matchResult && (
        <div className={`space-y-8 animate-fadeIn max-w-6xl mx-auto ${viewOnlyTasks ? 'order-3' : ''}`}>
          
          {/* Match Score Comparison Banner */}
          <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-10 border border-neutral-800 shadow-xl relative overflow-hidden">
            
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4ff3a]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <span className="bg-[#d4ff3a] text-black text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Target Role
                </span>
                <h3 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
                  {matchResult.job_title}
                </h3>
                <p className="text-sm text-neutral-400 mt-1 max-w-xl">
                  {matchResult.role_summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="text-xs text-neutral-400 font-semibold mr-1">Required:</span>
                  {(matchResult.required_skills || []).map((s, i) => (
                    <span key={i} className="text-xs font-mono bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md text-neutral-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dual Score Cards */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full lg:w-auto">
                
                {/* Traditional Keyword Match Score */}
                <div className="bg-neutral-900/90 rounded-2xl p-4 sm:p-5 border border-neutral-800 text-center flex-1 min-w-[140px]">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block">
                    Résumé Claims Match
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-neutral-200 mt-1">
                    {matchResult.overall_match_score || 0}%
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium block mt-1">
                    Traditional keyword filter
                  </span>
                </div>

                {/* True Verifiable Code Proof Match Score */}
                <div className="bg-[#d4ff3a] text-neutral-950 rounded-2xl p-4 sm:p-5 border border-black text-center flex-1 min-w-[160px] shadow-lg relative">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-neutral-900">
                    True Code Proof Match
                  </span>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
                    {matchResult.proven_match_score || 0}%
                  </div>
                  <span className="text-[10px] font-extrabold text-neutral-900 bg-white/60 px-2 py-0.5 rounded-full inline-block mt-1">
                    Verifiable Repos & Tests
                  </span>
                </div>

              </div>
            </div>

            {/* Recruiter Insight Callout */}
            <div className="mt-8 pt-6 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Proven In Code ({(matchResult.matched_proven || []).length})</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(matchResult.matched_proven || []).map((s, i) => (
                    <span key={i} className="bg-emerald-900/60 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Partial Proof ({(matchResult.matched_partial || []).length})</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(matchResult.matched_partial || []).map((s, i) => (
                    <span key={i} className="bg-amber-900/60 text-amber-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold mb-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Claimed Only ({(matchResult.matched_claimed_only || []).length})</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(matchResult.matched_claimed_only || []).map((s, i) => (
                    <span key={i} className="bg-rose-900/60 text-rose-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-neutral-400 font-bold mb-1">
                  <span>Missing Gaps ({(matchResult.missing_skills || []).length})</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(matchResult.missing_skills || []).map((s, i) => (
                    <span key={i} className="bg-neutral-800 text-neutral-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Actionable Micro-Tasks Gap Closer Section */}
      <div className={`space-y-6 max-w-6xl mx-auto ${viewOnlyTasks ? 'order-1' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-[#8bb800]" />
              <span>Target Skill Gaps: Actionable Micro-Projects ({filteredTasks.length})</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Complete these targeted 2–4 hour projects, push to GitHub with passing unit tests, and earn deterministic <strong className="text-neutral-900">Proven</strong> badges.
            </p>
          </div>

          {/* Skill Filter Buttons */}
          {availableSkills.length > 2 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-neutral-400 mr-1" />
              {availableSkills.map((sk) => (
                <button
                  key={sk}
                  onClick={() => setSelectedSkillFilter(sk)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedSkillFilter === sk
                      ? 'bg-neutral-950 text-[#d4ff3a]'
                      : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                  }`}
                >
                  {sk}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Micro-tasks Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTasks.map((task, tIndex) => (
            <div
              key={task.id || tIndex}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-sm flex flex-col justify-between hover:border-black transition-all"
            >
              <div>
                {/* Task Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="bg-[#d4ff3a] text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-black inline-block mb-1">
                      GAP: {task.skill}
                    </span>
                    <h4 className="font-extrabold text-base text-neutral-950 leading-snug">
                      {task.title}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[11px] font-bold text-neutral-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimated_hours || '3 Hours'}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-400 mt-0.5">
                      {task.difficulty || 'Intermediate'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                  {task.description}
                </p>

                {/* Implementation Steps */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                    Step-by-Step Implementation:
                  </span>
                  <ol className="space-y-1.5 text-xs text-neutral-700">
                    {(task.steps || []).map((st, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Exact Deliverables */}
                <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-100 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                    GitHub Deliverables to Earn "Proven" Status:
                  </span>
                  <ul className="space-y-1 text-xs text-neutral-800 font-mono">
                    {(task.deliverables || []).map((del, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recruiter Verification Checklist (Interactive) */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                    Recruiter Verification Checklist:
                  </span>
                  <div className="space-y-1.5">
                    {(task.recruiter_checklist || []).map((item, cIdx) => {
                      const isChecked = !!checkedChecklist[`${tIndex}-${cIdx}`];
                      return (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => toggleCheck(tIndex, cIdx)}
                          className="w-full flex items-center gap-2 text-left text-xs p-2 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-400 shrink-0" />
                          )}
                          <span className={isChecked ? 'line-through text-neutral-400' : 'text-neutral-700 font-medium'}>
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Task Action Footer */}
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 font-medium">
                  Badge: <strong className="text-emerald-700 font-bold">+50 XP Proof</strong>
                </span>
                <a
                  href={task.repo_template_idea || `https://github.com/new?name=${task.skill?.toLowerCase() || 'proof'}-challenge`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-[#d4ff3a] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
                >
                  <Terminal className="w-3 h-3" />
                  <span>Create Proof Repo</span>
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
