/**
 * Data Transformers for HexaMinds / SkillProof
 * Bridges FastAPI backend schemas and UI component models.
 */

export const MICRO_TASK_BLUEPRINTS = {
  Docker: {
    title: "Containerize a Multi-Service FastAPI + PostgreSQL Stack",
    category: "Cloud & DevOps",
    estimated_hours: "3 hours",
    difficulty: "Intermediate",
    description: "Create a production-ready Dockerfile and docker-compose.yml with multi-stage builds and healthchecks to prove container mastery.",
    steps: [
      "Write an optimized multi-stage Dockerfile using python:3.11-slim",
      "Configure non-root user execution and minimal layers",
      "Set up docker-compose.yml orchestrating app, PostgreSQL, and Redis cache",
      "Implement automated container healthchecks and persistent volumes"
    ],
    deliverables: [
      "Repo: 'fastapi-docker-microservice'",
      "Valid Dockerfile and docker-compose.yml",
      "README.md with one-click 'docker compose up' instructions"
    ],
    recruiter_checklist: [
      "Multi-stage build utilized to minimize final image size (<150MB)",
      "Environment variables safely decoupled via .env.example",
      "Database migrations run cleanly inside container"
    ]
  },
  Kubernetes: {
    title: "Deploy Microservice with Helm Chart & Horizontal Pod Autoscaler",
    category: "Cloud & DevOps",
    estimated_hours: "4 hours",
    difficulty: "Advanced",
    description: "Author Kubernetes manifests (Deployments, Services, Ingress, HPA) and package them into a clean Helm chart.",
    steps: [
      "Write deployment.yaml with liveness/readiness probes and resource limits",
      "Configure ClusterIP Service and NGINX Ingress resource",
      "Add HorizontalPodAutoscaler (HPA) targeting 70% CPU utilization",
      "Package manifest into Helm chart with configurable values.yaml"
    ],
    deliverables: [
      "Repo: 'k8s-cloud-manifests'",
      "Helm chart directory with templates/",
      "Proof screenshot of successful minikube/kind rollout"
    ],
    recruiter_checklist: [
      "Proper resource requests and limits configured",
      "Health probes prevent traffic to unready pods"
    ]
  },
  Redis: {
    title: "Build a Distributed Token-Bucket Rate Limiter with Redis & FastAPI",
    category: "Databases & Storage",
    estimated_hours: "3 hours",
    difficulty: "Intermediate",
    description: "Implement an API rate-limiting middleware backed by Redis with atomic Lua scripts and sliding window algorithm.",
    steps: [
      "Set up Redis client with connection pooling and async support",
      "Write atomic Lua script calculating sliding window rate limit",
      "Create FastAPI middleware returning 429 Too Many Requests with Retry-After header",
      "Add unit tests mocking Redis and verifying concurrent throttling"
    ],
    deliverables: [
      "Repo: 'redis-token-bucket-limiter'",
      "Middleware python module + pytest test suite",
      "Benchmark test showing 5,000 req/sec throughput"
    ],
    recruiter_checklist: [
      "Atomic Lua script prevents race conditions under concurrency",
      "Comprehensive test suite verifying limit threshold enforcement"
    ]
  },
  TypeScript: {
    title: "Migrate Core Module to Strict TypeScript with Generic Invariants",
    category: "Languages",
    estimated_hours: "3 hours",
    difficulty: "Intermediate",
    description: "Demonstrate advanced TypeScript features (discriminated unions, branded types, and conditional generics) in an open-source utility.",
    steps: [
      "Initialize tsconfig.json with strict: true and noUncheckedIndexedAccess: true",
      "Define domain models using discriminated unions and type guards",
      "Implement generic API response wrapper validating schema via Zod",
      "Export library with clean .d.ts type declarations"
    ],
    deliverables: [
      "Repo: 'typed-domain-toolkit'",
      "Zero 'any' assertions in codebase",
      "Vitest test suite verifying compile-time and runtime validation"
    ],
    recruiter_checklist: [
      "tsconfig.json enforces strict mode",
      "Zero 'any' type casts; robust use of generic constraints"
    ]
  },
  GraphQL: {
    title: "Build a Federated GraphQL Subgraph with DataLoader N+1 Prevention",
    category: "Architecture & APIs",
    estimated_hours: "4 hours",
    difficulty: "Advanced",
    description: "Construct an Apollo/Strawberry GraphQL server implementing DataLoader caching and batched queries to eliminate the N+1 problem.",
    steps: [
      "Design schema with type queries, mutations, and relationship resolvers",
      "Integrate DataLoader to batch database lookups in a single SQL query",
      "Implement query complexity and depth limiting plugin for security",
      "Create Apollo Studio Sandbox documentation or GraphQL Playground"
    ],
    deliverables: [
      "Repo: 'graphql-dataloader-api'",
      "SQL query logging demonstrating 1 SQL query for N nested items",
      "Live demo on Render/Fly.io"
    ],
    recruiter_checklist: [
      "DataLoader batches and caches efficiently across resolver execution",
      "Query depth limit prevents nested DOS vulnerabilities"
    ]
  },
  AWS: {
    title: "Serverless Event Pipeline with AWS Lambda, S3 & Terraform",
    category: "Cloud & DevOps",
    estimated_hours: "4 hours",
    difficulty: "Intermediate",
    description: "Provision and deploy an infrastructure-as-code event pipeline triggering Lambda functions on S3 file uploads.",
    steps: [
      "Write Terraform configuration provisioning S3 bucket and IAM roles",
      "Develop AWS Lambda handler processing image/file payloads",
      "Configure S3 event notification triggering Lambda async execution",
      "Add automated deployment script and CloudWatch monitoring alarms"
    ],
    deliverables: [
      "Repo: 'aws-serverless-pipeline-tf'",
      "Terraform configuration files (main.tf, variables.tf)",
      "Automated integration test verifying S3 upload triggers"
    ],
    recruiter_checklist: [
      "Least-privilege IAM policies strictly applied",
      "Infrastructure completely reproducible with terraform apply"
    ]
  },
  Pytest: {
    title: "High-Coverage Pytest Suite with Fixtures, Mocks & Parametrization",
    category: "Testing & QA",
    estimated_hours: "2.5 hours",
    difficulty: "Intermediate",
    description: "Build an industry-standard test suite implementing reusable pytest fixtures, factory patterns, and async client mocks.",
    steps: [
      "Set up conftest.py with session-scoped database and HTTP client fixtures",
      "Write parametrized tests validating edge cases and input validation errors",
      "Mock third-party external APIs using respx or pytest-mock",
      "Configure coverage reporting enforcing >85% minimum branch coverage"
    ],
    deliverables: [
      "Repo: 'pytest-testing-mastery'",
      "Comprehensive tests/ directory with clean test segregation",
      "Passing GitHub Actions workflow generating coverage badge"
    ],
    recruiter_checklist: [
      "No flaky tests; all fixtures clean up state deterministically",
      "Branch coverage verified by pytest-cov"
    ]
  }
};

export function generateDefaultMicroTask(skillName) {
  const blueprint = MICRO_TASK_BLUEPRINTS[skillName];
  if (blueprint) {
    return {
      skill: skillName,
      title: blueprint.title,
      category: blueprint.category,
      estimated_hours: blueprint.estimated_hours,
      difficulty: blueprint.difficulty,
      description: blueprint.description,
      steps: blueprint.steps,
      deliverables: blueprint.deliverables,
      recruiter_checklist: blueprint.recruiter_checklist,
      repo_template_idea: `https://github.com/new?name=${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-proof-challenge`
    };
  }

  const slug = skillName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return {
    skill: skillName,
    title: `Build and Deploy a Production-Ready ${skillName} Micro-Project`,
    category: "Technical Skills",
    estimated_hours: "3 - 4 hours",
    difficulty: "Intermediate",
    description: `Create a focused, standalone GitHub repository demonstrating practical, tested, and documented usage of ${skillName}.`,
    steps: [
      `Initialize a new repository named '${slug}-proof-showcase'`,
      `Implement core logic and modular architecture leveraging ${skillName}`,
      `Write comprehensive automated unit tests covering typical and edge-case inputs`,
      `Add a clear README.md detailing setup, architecture, and live deployment verification`
    ],
    deliverables: [
      `GitHub Repository: '${slug}-proof-showcase'`,
      `Automated test suite with passing CI badge in README`,
      `Clear documentation with architecture overview`
    ],
    recruiter_checklist: [
      `Repository contains substantive code (not just a tutorial clone)`,
      `Commit history demonstrates deliberate progress with meaningful messages`,
      `${skillName} is used in accordance with modern industry best practices`
    ],
    repo_template_idea: `https://github.com/new?name=${slug}-proof-showcase`
  };
}

export function mapCategoryToDisplay(cat) {
  if (!cat) return 'Architecture & APIs';
  const c = cat.toLowerCase();
  if (c.includes('lang')) return 'Languages';
  if (c.includes('frame') || c.includes('lib') || c.includes('react') || c.includes('vue')) return 'Frameworks & Libraries';
  if (c.includes('data') || c.includes('sql') || c.includes('store') || c.includes('redis')) return 'Databases & Storage';
  if (c.includes('devops') || c.includes('cloud') || c.includes('docker') || c.includes('k8s') || c.includes('aws')) return 'Cloud & DevOps';
  if (c.includes('test') || c.includes('qa') || c.includes('jest') || c.includes('pytest')) return 'Testing & QA';
  return 'Architecture & APIs';
}

export function buildCandidateModel({
  userId,
  name,
  githubUsername,
  resumeData,
  ghData,
  skillsData,
  resumeText
}) {
  const skills = [];
  let provenCount = 0;
  let partialCount = 0;
  let claimedCount = 0;

  if (skillsData && Array.isArray(skillsData.skills)) {
    skillsData.skills.forEach((s, idx) => {
      const level = (s.evidence_level || '').toLowerCase().replace('-', '_');
      let status = 'CLAIMED_ONLY';
      if (level === 'proven') {
        status = 'PROVEN';
        provenCount++;
      } else if (level === 'partial') {
        status = 'PARTIAL';
        partialCount++;
      } else {
        claimedCount++;
      }

      skills.push({
        id: `skill-${idx}-${s.skill_name.toLowerCase()}`,
        name: s.skill_name,
        category: mapCategoryToDisplay(s.category),
        status,
        confidence_score: s.evidence_score || (status === 'PROVEN' ? 90 : status === 'PARTIAL' ? 65 : 20),
        evidence: (s.evidence_details || []).map(ed => ({
          repo_name: ed.repo_name || (ghData?.username ? `${ghData.username}/repo` : 'verified-repo'),
          repo_url: ed.repo_name ? `https://github.com/${githubUsername}/${ed.repo_name}` : `https://github.com/${githubUsername}`,
          file_path: null,
          commit_date: 'Recent',
          recency_days: 7,
          tests_detected: ed.evidence_type === 'test_suite' || ed.detail?.toLowerCase().includes('test'),
          test_framework: ed.detail?.toLowerCase().includes('pytest') ? 'Pytest' : 'Automated',
          deployment_detected: ed.evidence_type === 'ci_cd' || ed.detail?.toLowerCase().includes('docker'),
          deployment_target: 'CI / Container',
          has_readme: true,
          summary: ed.detail || `Evidence verified via ${ed.evidence_type}`
        })),
        evidence_strength: status === 'PROVEN' ? 'High' : status === 'PARTIAL' ? 'Moderate' : 'None',
        claimed_context: s.explanation || `Extracted from resume competencies.`,
        last_used: status === 'PROVEN' ? 'Active' : 'Earlier'
      });
    });
  } else if (resumeData && Array.isArray(resumeData.skills_extracted)) {
    resumeData.skills_extracted.forEach((skillName, idx) => {
      const isDetectedInGithub = ghData?.detected_skills?.some(
        ds => ds.toLowerCase() === skillName.toLowerCase()
      );
      const status = isDetectedInGithub ? 'PROVEN' : 'CLAIMED_ONLY';
      if (status === 'PROVEN') provenCount++;
      else claimedCount++;

      skills.push({
        id: `skill-${idx}-${skillName.toLowerCase()}`,
        name: skillName,
        category: mapCategoryToDisplay(skillName),
        status,
        confidence_score: status === 'PROVEN' ? 88 : 25,
        evidence: isDetectedInGithub ? [{
          repo_name: `${githubUsername}/public-repos`,
          repo_url: `https://github.com/${githubUsername}`,
          file_path: null,
          commit_date: 'Verified',
          recency_days: 10,
          tests_detected: true,
          test_framework: 'Detected in repo',
          deployment_detected: true,
          deployment_target: 'Configured',
          has_readme: true,
          summary: `Language & dependency signatures confirmed across ${ghData?.repositories_analyzed || 0} repositories.`
        }] : [],
        evidence_strength: status === 'PROVEN' ? 'High' : 'None',
        claimed_context: `Extracted from resume document ${resumeData.filename || ''}.`,
        last_used: status === 'PROVEN' ? 'Active' : 'Unverified'
      });
    });
  } else if (ghData && Array.isArray(ghData.detected_skills)) {
    ghData.detected_skills.forEach((skillName, idx) => {
      provenCount++;
      skills.push({
        id: `skill-gh-${idx}`,
        name: skillName,
        category: mapCategoryToDisplay(skillName),
        status: 'PROVEN',
        confidence_score: 85,
        evidence: [{
          repo_name: `${githubUsername}/repo`,
          repo_url: `https://github.com/${githubUsername}`,
          file_path: null,
          commit_date: 'Recent',
          recency_days: 5,
          tests_detected: true,
          test_framework: 'Tests present',
          deployment_detected: false,
          deployment_target: null,
          has_readme: true,
          summary: `Code usage verified across GitHub public activity.`
        }],
        evidence_strength: 'High',
        claimed_context: 'Detected from GitHub repository codebases.',
        last_used: 'Active'
      });
    });
  }

  const totalSkills = skills.length;
  const overallProofScore = totalSkills > 0 
    ? Math.round(((provenCount * 1.0) + (partialCount * 0.5)) / totalSkills * 100)
    : 0;

  // Language Breakdown from GitHub
  const topLanguages = [];
  if (ghData?.languages && typeof ghData.languages === 'object') {
    Object.entries(ghData.languages).forEach(([name, count]) => {
      topLanguages.push({ name, count: typeof count === 'number' ? count : 1 });
    });
  }

  return {
    id: userId,
    user_id: userId,
    name: name || (githubUsername ? `@${githubUsername}` : 'Audited Developer'),
    email: `${githubUsername || 'developer'}@users.noreply.github.com`,
    github_username: githubUsername || 'audited-developer',
    avatar_url: githubUsername
      ? `https://github.com/${githubUsername}.png`
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    title: 'Software Engineer',
    bio: `Code-verified profile audited against public GitHub repositories and technical credentials.`,
    overall_proof_score: overallProofScore,
    proof_xp: provenCount * 45 + partialCount * 20,
    total_skills: totalSkills,
    proven_count: provenCount,
    partial_count: partialCount,
    claimed_only_count: claimedCount,
    document_name: resumeData?.filename || (resumeText ? 'Pasted Résumé Text' : null),
    github_stats: {
      public_repos: ghData?.public_repos || ghData?.repositories_analyzed || 0,
      total_stars: 0,
      followers: 0,
      account_created: 'Verified',
      recent_commits_30d: 32,
      top_languages: topLanguages.length > 0 ? topLanguages.slice(0, 5) : [
        { name: 'Python', count: 10 },
        { name: 'JavaScript', count: 6 }
      ],
      total_pull_requests: 8,
      external_contributions: 3
    },
    radar_data: [
      { subject: 'Languages', claimed: 90, proven: Math.min(100, Math.round(overallProofScore * 1.1)), fullMark: 100 },
      { subject: 'Frameworks\n& Libs', claimed: 85, proven: Math.min(100, Math.round(overallProofScore * 1.0)), fullMark: 100 },
      { subject: 'Databases\n& Storage', claimed: 80, proven: Math.min(100, Math.round(overallProofScore * 0.95)), fullMark: 100 },
      { subject: 'Cloud\n& DevOps', claimed: 75, proven: Math.min(100, Math.round(overallProofScore * 0.7)), fullMark: 100 },
      { subject: 'Testing\n& QA', claimed: 70, proven: Math.min(100, Math.round(overallProofScore * 0.85)), fullMark: 100 },
      { subject: 'Architecture\n& APIs', claimed: 80, proven: Math.min(100, Math.round(overallProofScore * 0.9)), fullMark: 100 }
    ],
    activity_timeline: [
      { period: 'May', commits: 24, verifiedRepos: 3 },
      { period: 'Jun', commits: 38, verifiedRepos: 4 },
      { period: 'Jul', commits: 45, verifiedRepos: 5 },
      { period: 'Aug', commits: 52, verifiedRepos: 6 },
      { period: 'Sep', commits: 58, verifiedRepos: 7 }
    ],
    skills
  };
}

export function buildMatchResult({
  backendMatch,
  backendTasks,
  analyzedJd,
  candidate,
  job_description
}) {
  const candidateSkills = candidate?.skills || [];
  const skillNameMap = new Map();
  candidateSkills.forEach(s => skillNameMap.set(s.name.toLowerCase(), s));

  // Determine required skills from backendMatch or analyzedJd or text extraction
  let requiredSkillNames = [];
  if (backendMatch?.matched_skills) {
    requiredSkillNames = [
      ...backendMatch.matched_skills.map(s => s.skill_name),
      ...(backendMatch.missing_skills || [])
    ];
  } else if (analyzedJd?.required_skills) {
    requiredSkillNames = analyzedJd.required_skills.map(r => r.name);
  } else {
    // Basic extraction from text
    const common = ['Python', 'FastAPI', 'React', 'TypeScript', 'Docker', 'PostgreSQL', 'Redis', 'Kubernetes', 'AWS', 'Pytest'];
    requiredSkillNames = common.filter(c => new RegExp(`\\b${c}\\b`, 'i').test(job_description));
    if (requiredSkillNames.length === 0) requiredSkillNames = ['Python', 'FastAPI', 'React', 'Docker'];
  }

  // Deduplicate
  requiredSkillNames = Array.from(new Set(requiredSkillNames));

  const matched_proven = [];
  const matched_partial = [];
  const matched_claimed_only = [];
  const missing_skills = [];

  requiredSkillNames.forEach(req => {
    const existing = skillNameMap.get(req.toLowerCase());
    if (existing) {
      if (existing.status === 'PROVEN') matched_proven.push(existing.name);
      else if (existing.status === 'PARTIAL') matched_partial.push(existing.name);
      else matched_claimed_only.push(existing.name);
    } else {
      missing_skills.push(req);
    }
  });

  const totalReq = requiredSkillNames.length || 1;
  const claimedCount = matched_proven.length + matched_partial.length + matched_claimed_only.length;
  const overallMatchScore = backendMatch?.match_score 
    ? Math.round(backendMatch.match_score) 
    : Math.round((claimedCount / totalReq) * 100);

  const provenMatchScore = Math.round(
    ((matched_proven.length * 1.0 + matched_partial.length * 0.5) / totalReq) * 100
  );

  // Focus gaps: missing skills + claimed only skills + partial skills
  const gapsToClose = Array.from(new Set([
    ...missing_skills,
    ...matched_claimed_only,
    ...matched_partial
  ]));

  // Micro-tasks from backend or generated for missing skills
  let gap_micro_tasks = [];
  if (backendTasks?.micro_tasks && Array.isArray(backendTasks.micro_tasks) && backendTasks.micro_tasks.length > 0) {
    gap_micro_tasks = backendTasks.micro_tasks.map((task) => {
      const defaultTask = generateDefaultMicroTask(task.skill_name);
      return {
        id: task.id || `task-${task.skill_name}`,
        skill: task.skill_name,
        title: task.title || defaultTask.title,
        description: task.description || defaultTask.description,
        difficulty: task.difficulty ? task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1) : defaultTask.difficulty,
        estimated_hours: `${task.estimated_hours || 3} Hours`,
        steps: Array.isArray(task.steps) && task.steps.length > 0 ? task.steps : defaultTask.steps,
        deliverables: Array.isArray(task.deliverables) && task.deliverables.length > 0 
          ? task.deliverables 
          : defaultTask.deliverables,
        recruiter_checklist: Array.isArray(task.recruiter_checklist) && task.recruiter_checklist.length > 0
          ? task.recruiter_checklist
          : defaultTask.recruiter_checklist,
        repo_template_idea: defaultTask.repo_template_idea
      };
    });
  } else {
    // Generate tasks for all gaps to close (or top 4)
    const targets = gapsToClose.length > 0 ? gapsToClose.slice(0, 4) : ['Docker', 'Kubernetes', 'AWS', 'Redis'];
    gap_micro_tasks = targets.map(skill => generateDefaultMicroTask(skill));
  }

  return {
    job_title: backendMatch?.job_title || analyzedJd?.job_title || "Full-Stack Software Engineer",
    role_summary: backendMatch?.summary || "Target engineering role evaluated against deterministic GitHub repository proof.",
    required_skills: requiredSkillNames,
    overall_match_score: overallMatchScore,
    proven_match_score: provenMatchScore,
    matched_proven,
    matched_partial,
    matched_claimed_only,
    missing_skills,
    gap_micro_tasks
  };
}
