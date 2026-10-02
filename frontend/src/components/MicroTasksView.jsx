import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  ExternalLink,
  Sparkles,
  BookOpen,
  Code,
  Layers,
  Award,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { generateMicrotasks } from '../api';

export default function MicroTasksView({ userData, setUserData }) {
  const [tasks, setTasks] = useState(userData.microTasks || []);
  const [completedMap, setCompletedMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    if (!userData.jobMatch?.job_match_id) {
      setError('Please perform a Job Match in Step 4 first to generate personalized tasks.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await generateMicrotasks(userData.userId, userData.jobMatch.job_match_id);
      setTasks(res.micro_tasks || []);
      setUserData((prev) => ({
        ...prev,
        microTasks: res.micro_tasks,
      }));
    } catch (err) {
      setError(err.message || 'Failed to generate micro-tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tasks.length === 0 && userData.jobMatch?.job_match_id) {
      fetchTasks();
    }
  }, [userData.jobMatch?.job_match_id]);

  const toggleTask = (index) => {
    setCompletedMap((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'advanced':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getTaskIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'project':
        return <Code className="w-4 h-4 text-indigo-400" />;
      case 'tutorial':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'contribution':
        return <Award className="w-4 h-4 text-amber-400" />;
      default:
        return <Layers className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 5: Skill Gap Action Plan</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-white">
            Actionable Micro-Tasks
          </h1>
          <p className="text-slate-400 text-sm">
            Targeted mini-projects and tutorials curated by AI to close your verified skill gaps.
          </p>
        </div>

        <button
          id="regenerate-tasks-btn"
          onClick={fetchTasks}
          disabled={loading || !userData.jobMatch?.job_match_id}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-semibold text-xs transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Regenerate Tasks</span>
        </button>
      </div>

      {/* Progress Bar Card */}
      {tasks.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-white">Your Gap-Closing Progress</span>
            <span className="text-indigo-400">
              {completedCount} of {tasks.length} Completed ({progressPercent.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
        <div className="glass-panel p-16 text-center rounded-2xl border border-white/10 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <h3 className="text-white font-semibold text-base">Generating Tailored Micro-Tasks...</h3>
          <p className="text-xs text-slate-400">Groq is analyzing your missing skills and structuring concrete tasks.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-2xl border border-white/10 space-y-3">
          <CheckSquare className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-white font-semibold text-base">No Micro-Tasks Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Complete the Job Match step to uncover your skill gaps, and we will formulate an action plan here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, idx) => {
            const isDone = Boolean(completedMap[idx]);
            return (
              <div
                key={idx}
                className={`glass-panel p-6 rounded-2xl border transition-all ${
                  isDone
                    ? 'border-emerald-500/30 bg-emerald-950/10 opacity-75'
                    : 'border-white/10 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Checkbox & Details */}
                  <div className="flex items-start space-x-3.5">
                    <button
                      onClick={() => toggleTask(idx)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-400 transition"
                    >
                      {isDone ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-[11px]">
                          {task.skill_name}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getDifficultyBadge(
                            task.difficulty
                          )}`}
                        >
                          {task.difficulty}
                        </span>

                        <span className="flex items-center space-x-1 text-[11px] text-slate-400">
                          {getTaskIcon(task.task_type)}
                          <span className="capitalize">{task.task_type}</span>
                        </span>

                        <span className="flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>~{task.estimated_hours}h</span>
                        </span>
                      </div>

                      <h3 className={`text-base font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>

                      {/* Resources */}
                      {task.resources && task.resources.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Resources:
                          </span>
                          {task.resources.map((r, rIdx) => (
                            <a
                              key={rIdx}
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-[11px] text-indigo-300 hover:text-white hover:border-indigo-400 transition"
                            >
                              <span>{r.title}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
