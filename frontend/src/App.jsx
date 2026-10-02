import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import VerificationStudio from './components/VerificationStudio';
import ProofDashboard from './components/ProofDashboard';
import SkillMatrix from './components/SkillMatrix';
import JobMatcher from './components/JobMatcher';
import FloatingDock from './components/FloatingDock';
import ReportModal from './components/ReportModal';
import EvidenceInspectorModal from './components/EvidenceInspectorModal';
import confetti from 'canvas-confetti';
import sampleFallback from './data/sampleFallback.json';
import {
  checkBackendHealth,
  uploadResume,
  analyzeGithub,
  getUserSkills,
  analyzeJobDescription,
  matchJobWithSkills,
  generateMicrotasks
} from './api';
import { buildCandidateModel, buildMatchResult } from './utils/formatters';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [viewMode, setViewMode] = useState('recruiter');
  const [sampleCandidates, setSampleCandidates] = useState(sampleFallback?.candidates || []);
  const [sampleJds, setSampleJds] = useState(sampleFallback?.jds || []);
  const [currentCandidate, setCurrentCandidate] = useState(sampleFallback?.candidates?.[0] || null);
  const [matchResult, setMatchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [inspectorCardId, setInspectorCardId] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);

  // Initial check: test backend liveness
  useEffect(() => {
    checkBackendHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  // Run job match when candidate or sample JDs change
  useEffect(() => {
    if (currentCandidate && sampleJds.length > 0) {
      handleMatchJob({
        job_description: sampleJds[0].text,
        candidate_data: currentCandidate,
        candidate_id: currentCandidate.id
      });
    }
  }, [currentCandidate?.id, sampleJds]);

  const handleSelectSample = (candidate) => {
    setCurrentCandidate(candidate);
    setMatchResult(null);
    setShowStudioModal(false);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#d4ff3a', '#10b981', '#000000']
    });
  };

  const handleAnalyzeCandidate = async (formData) => {
    setIsLoading(true);
    try {
      const resumeFile = formData.get('resume_file');
      const resumeText = formData.get('resume_text');
      const githubUsername = (formData.get('github_username') || '').trim();
      const candidateName = (formData.get('candidate_name') || '').trim() || (githubUsername ? `@${githubUsername}` : 'Audited Developer');

      let userId = `user-${Date.now()}`;
      let resumeData = null;
      let ghData = null;
      let skillsData = null;

      // 1. If resume file uploaded, call POST /api/resume/upload
      if (resumeFile && resumeFile instanceof File && resumeFile.size > 0) {
        try {
          resumeData = await uploadResume(resumeFile, userId);
          if (resumeData?.user_id) {
            userId = resumeData.user_id;
          }
        } catch (rErr) {
          console.warn("Resume parsing notice:", rErr);
        }
      }

      // 2. If GitHub username entered, call POST /api/github/analyze
      if (githubUsername) {
        try {
          ghData = await analyzeGithub(githubUsername, userId);
        } catch (gErr) {
          console.warn("GitHub analysis notice:", gErr);
        }

        // 3. Load full scored skills from GET /api/skills/{username}
        try {
          skillsData = await getUserSkills(githubUsername);
        } catch (sErr) {
          console.warn("Skills fetch notice:", sErr);
        }
      }

      // 4. Construct candidate object
      const analyzedCandidate = buildCandidateModel({
        userId,
        name: candidateName,
        githubUsername,
        resumeData,
        ghData,
        skillsData,
        resumeText
      });

      setCurrentCandidate(analyzedCandidate);
      setMatchResult(null);
      setShowStudioModal(false);
      setActiveTab('explore');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4ff3a', '#10b981', '#000000']
      });
    } catch (err) {
      console.error("Error analyzing candidate:", err);
      alert(`Error analyzing candidate: ${err.message || 'Please check backend logs'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchJob = async ({ job_description, candidate_data, candidate_id }) => {
    setIsLoadingMatch(true);
    try {
      const candidate = candidate_data || currentCandidate;
      const userId = candidate?.id || candidate?.user_id || 'cand-alex-rivera';
      let backendMatch = null;
      let backendTasks = null;
      let analyzedJd = null;

      // Try backend job match: POST /api/jobs/match
      try {
        backendMatch = await matchJobWithSkills(userId, "Full-Stack Engineer", job_description);
        if (backendMatch?.job_match_id) {
          try {
            backendTasks = await generateMicrotasks(userId, backendMatch.job_match_id);
          } catch (tErr) {
            console.warn("Microtasks generation notice:", tErr);
          }
        }
      } catch (mErr) {
        // If profile not in DB (e.g. sample candidate), parse JD using Groq: POST /api/jobs/analyze
        try {
          analyzedJd = await analyzeJobDescription("Full-Stack Engineer", job_description);
        } catch (jErr) {
          console.warn("AI JD analysis notice:", jErr);
        }
      }

      // Format complete result for JobMatcher component
      const result = buildMatchResult({
        backendMatch,
        backendTasks,
        analyzedJd,
        candidate,
        job_description
      });

      setMatchResult(result);
    } catch (err) {
      console.error("Error matching job:", err);
    } finally {
      setIsLoadingMatch(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-neutral-900 pb-28 selection:bg-[#d4ff3a] selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenAudit={() => setShowStudioModal(true)}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <main>
        {/* Hero Section */}
        <HeroSection
          onOpenAudit={() => setShowStudioModal(true)}
          onSelectSample={handleSelectSample}
          sampleCandidates={sampleCandidates}
          onInspectCard={(cardId) => setInspectorCardId(cardId || 'pytest')}
        />

        {/* Verification Studio Modal Popup */}
        {showStudioModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowStudioModal(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white hover:bg-neutral-100 text-neutral-500 hover:text-black shadow-md"
              >
                ✕
              </button>
              <VerificationStudio
                onAnalyze={handleAnalyzeCandidate}
                isLoading={isLoading}
                sampleCandidates={sampleCandidates}
                onSelectSample={handleSelectSample}
              />
            </div>
          </div>
        )}

        {/* Dedicated Verify Tab (Direct Page Access) */}
        {activeTab === 'verify' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
            <VerificationStudio
              onAnalyze={handleAnalyzeCandidate}
              isLoading={isLoading}
              sampleCandidates={sampleCandidates}
              onSelectSample={handleSelectSample}
            />
          </div>
        )}

        {/* Recently Verified Document Banner */}
        {currentCandidate && currentCandidate.document_name && activeTab !== 'verify' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-[#d4ff3a] flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-neutral-900">
                      Document Audited: {currentCandidate.document_name}
                    </span>
                    <span className="bg-[#d4ff3a] text-black text-[10px] font-black px-2 py-0.5 rounded-full border border-black">
                      PyMuPDF Extracted
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Candidate: <strong className="text-neutral-900 font-bold">{currentCandidate.name}</strong> • GitHub: <strong className="text-neutral-900">@{currentCandidate.github_username}</strong> • Proof Score: <strong className="text-emerald-600">{currentCandidate.overall_proof_score}%</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('verify')}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-all"
                >
                  Verify Another Document
                </button>
                <button
                  onClick={() => setActiveTab('matrix')}
                  className="px-3.5 py-1.5 rounded-full text-xs font-black bg-neutral-950 text-white hover:bg-neutral-900 transition-all"
                >
                  Inspect Evidence Matrix →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Proof Overview & Analytics */}
        {activeTab === 'explore' && currentCandidate && (
          <div className="space-y-6">
            <ProofDashboard candidate={currentCandidate} viewMode={viewMode} />
            <SkillMatrix 
              skills={currentCandidate.skills} 
              githubUsername={currentCandidate.github_username} 
              onInspectEvidence={(cardId) => setInspectorCardId(cardId || 'pytest')}
            />
          </div>
        )}

        {/* Tab 2: Full Deep Evidence Matrix */}
        {activeTab === 'matrix' && currentCandidate && (
          <SkillMatrix 
            skills={currentCandidate.skills} 
            githubUsername={currentCandidate.github_username} 
            onInspectEvidence={(cardId) => setInspectorCardId(cardId || 'pytest')}
          />
        )}

        {/* Tab 3: Recruiter Job Matcher */}
        {activeTab === 'matcher' && currentCandidate && (
          <JobMatcher
            candidate={currentCandidate}
            onMatchJob={handleMatchJob}
            matchResult={matchResult}
            isLoadingMatch={isLoadingMatch}
            sampleJds={sampleJds}
          />
        )}

        {/* Tab 4: Gap Closer & Micro-Tasks Only */}
        {activeTab === 'microtasks' && currentCandidate && (
          <JobMatcher
            candidate={currentCandidate}
            onMatchJob={handleMatchJob}
            matchResult={matchResult}
            isLoadingMatch={isLoadingMatch}
            sampleJds={sampleJds}
            viewOnlyTasks={true}
          />
        )}

      </main>

      {/* Floating Action Dock (Image 2 - Zero Style) */}
      <FloatingDock
        candidate={currentCandidate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAudit={() => setShowStudioModal(true)}
        onExportReport={() => setShowReportModal(true)}
        sampleCandidates={sampleCandidates}
        onSelectSample={handleSelectSample}
      />

      {/* Official Audit Certificate Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        candidate={currentCandidate}
      />

      {/* Code-Verified Evidence Inspector Modal (Commit Hashes, File Tree, CI Logs) */}
      <EvidenceInspectorModal
        isOpen={!!inspectorCardId}
        onClose={() => setInspectorCardId(null)}
        initialCardId={inspectorCardId || 'pytest'}
        candidate={currentCandidate}
      />

    </div>
  );
}
