import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { uploadResume } from '../api';

export default function ResumeUpload({ userData, setUserData, onProceed }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type === 'application/pdf' || selected.name.endsWith('.pdf')) {
        setFile(selected);
        setError(null);
      } else {
        setError('Only PDF files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.endsWith('.pdf')) {
        setFile(selected);
        setError(null);
      } else {
        setError('Only PDF files are supported.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume file.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await uploadResume(file, userData.userId);
      setUserData((prev) => ({
        ...prev,
        userId: res.user_id,
        resumeId: res.resume_id,
        resumeFilename: res.filename,
        claimedSkills: res.skills_extracted,
        resumePreview: res.raw_text_preview,
      }));
    } catch (err) {
      setError(err.message || 'Failed to upload and parse resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1: Ingest Resume Claims</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          Upload Your Resume PDF
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
          Our Groq-powered parser extracts your claimed technical skills, categorizes them, and prepares them for GitHub cross-verification.
        </p>
      </div>

      {/* Upload Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer relative ${
              dragActive
                ? 'border-indigo-400 bg-indigo-500/10'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/60'
            }`}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {file ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">{file.name}</h3>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze</p>
                </div>
                <span className="text-xs text-indigo-400 font-medium hover:underline">Click or drop to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Drag & drop your PDF resume here</h3>
                  <p className="text-xs text-slate-400 mt-1">or click to browse files from your computer</p>
                </div>
                <p className="text-[11px] text-slate-500">Maximum file size: 10 MB (PDF format only)</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              {userData.userId ? `User ID: ${userData.userId.slice(0, 8)}...` : 'Anonymous session'}
            </span>

            <button
              id="upload-resume-btn"
              type="submit"
              disabled={!file || loading}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                !file || loading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Skills via AI...</span>
                </>
              ) : (
                <>
                  <span>Extract Skills</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Extracted Skills Preview */}
      {userData.claimedSkills && userData.claimedSkills.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Extracted {userData.claimedSkills.length} Claimed Skills</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Parsed from {userData.resumeFilename}</p>
            </div>

            <button
              id="proceed-to-github-btn"
              onClick={onProceed}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/25"
            >
              <span>Next: Verify on GitHub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {userData.claimedSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-200 text-xs font-medium hover:border-indigo-500/50 hover:bg-indigo-500/10 transition"
              >
                {skill}
              </span>
            ))}
          </div>

          {userData.resumePreview && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Resume Snippet</span>
              <p className="text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 font-mono line-clamp-3">
                {userData.resumePreview}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
