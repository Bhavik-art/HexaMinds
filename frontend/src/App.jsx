import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ResumeUpload from './components/ResumeUpload';
import GithubConnect from './components/GithubConnect';
import EvidenceDashboard from './components/EvidenceDashboard';
import JobMatcher from './components/JobMatcher';
import MicroTasksView from './components/MicroTasksView';
import { checkBackendHealth } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('resume');
  const [backendStatus, setBackendStatus] = useState('checking');

  const [userData, setUserData] = useState({
    userId: null,
    resumeId: null,
    resumeFilename: null,
    claimedSkills: [],
    resumePreview: '',
    githubUsername: '',
    githubProfile: null,
    scoredSkills: [],
    provenCount: 0,
    partialCount: 0,
    claimedOnlyCount: 0,
    jobMatch: null,
    microTasks: [],
  });

  useEffect(() => {
    checkBackendHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar
        backendStatus={backendStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === 'resume' && (
          <ResumeUpload
            userData={userData}
            setUserData={setUserData}
            onProceed={() => setActiveTab('github')}
          />
        )}

        {activeTab === 'github' && (
          <GithubConnect
            userData={userData}
            setUserData={setUserData}
            onProceed={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dashboard' && (
          <EvidenceDashboard
            userData={userData}
            onProceed={() => setActiveTab('matcher')}
          />
        )}

        {activeTab === 'matcher' && (
          <JobMatcher
            userData={userData}
            setUserData={setUserData}
            onProceed={() => setActiveTab('tasks')}
          />
        )}

        {activeTab === 'tasks' && (
          <MicroTasksView
            userData={userData}
            setUserData={setUserData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SkillProof • Deterministic Developer Skill Verification Engine</span>
          <span>FastAPI + Supabase PostgreSQL + Groq AI + React Vite</span>
        </div>
      </footer>
    </div>
  );
}
