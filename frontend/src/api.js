/**
 * SkillProof API Client
 * Centralized fetch functions for communication with FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend offline');
  return res.json();
}

export async function uploadResume(file, userId) {
  const formData = new FormData();
  formData.append('file', file);
  if (userId) {
    formData.append('user_id', userId);
  }

  const res = await fetch(`${API_BASE}/api/resume/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Resume upload failed');
  }

  return res.json();
}

export async function analyzeGithub(username, userId) {
  const res = await fetch(`${API_BASE}/api/github/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      github_username: username,
      user_id: userId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'GitHub analysis failed');
  }

  return res.json();
}

export async function getUserSkills(username) {
  const res = await fetch(`${API_BASE}/api/skills/${encodeURIComponent(username)}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch user skills');
  }

  return res.json();
}

export async function analyzeJobDescription(jobTitle, jobDescription) {
  const res = await fetch(`${API_BASE}/api/jobs/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      job_title: jobTitle || undefined,
      job_description: jobDescription,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Job description analysis failed');
  }

  return res.json();
}

export async function matchJobWithSkills(userId, jobTitle, jobDescription) {
  const res = await fetch(`${API_BASE}/api/jobs/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      job_title: jobTitle || undefined,
      job_description: jobDescription,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Job matching failed');
  }

  return res.json();
}

export async function generateMicrotasks(userId, jobMatchId) {
  const res = await fetch(`${API_BASE}/api/jobs/microtasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      job_match_id: jobMatchId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Micro-tasks generation failed');
  }

  return res.json();
}
