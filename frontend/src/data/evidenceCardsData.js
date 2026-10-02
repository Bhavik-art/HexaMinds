// Realistic repository evidence datasets for SkillProof Inspector
export const EVIDENCE_CARDS_DATA = {
  pytest: {
    id: 'pytest',
    title: 'Pytest Automated Suite',
    subtitle: 'async-task-engine • 3d ago',
    repoName: 'alexrivera-dev/async-task-engine',
    repoUrl: 'https://github.com/alexrivera-dev/async-task-engine',
    branch: 'main',
    status: 'PROVEN',
    badgeText: '94% PASSED',
    claimText: 'Engineered high-throughput background processing workers using Python 3.11 and asyncio with pytest suites.',
    summary: 'Core maintainer. 84 commits, 94% test coverage via pytest, poetry packaging, async queue pipeline.',
    commit: {
      hash: '7f8a92b43e8d91c28f09da95a703d982b6c14e82',
      shortHash: '7f8a92b',
      message: 'feat(worker): implement async redis pipeline & unit test suite with backoff throttle',
      author: 'Alex Rivera',
      authorHandle: '@alexrivera-dev',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      timestamp: '3 days ago (Oct 14, 2026, 14:22:18 UTC)',
      gpgVerified: true,
      gpgKeyId: '0x4A8E9B12 (Verified Key)',
      parentHash: '8c41ea0f98b',
      stats: {
        additions: 184,
        deletions: 28,
        filesChanged: 3
      },
      diffs: [
        {
          filename: 'tests/test_async_worker.py',
          additions: 92,
          deletions: 8,
          patch: `@@ -12,8 +12,18 @@ import pytest
 import asyncio
 from unittest.mock import AsyncMock, patch
-from worker.engine import TaskWorker
+from worker.engine import TaskWorker, TaskStatus, ExponentialBackoff
 
+@pytest.mark.asyncio
+async def test_worker_initialization():
+    worker = TaskWorker(concurrency=4, max_retries=3)
+    assert worker.concurrency == 4
+    assert worker.status == TaskStatus.IDLE
+    await worker.start()
+    assert worker.is_running is True
+    await worker.shutdown()
+
 @pytest.mark.asyncio
-def test_legacy_runner():
-    pass
+async def test_job_dispatch_concurrency():
+    worker = TaskWorker(concurrency=8)
+    processed_jobs = []
+    async def mock_handler(job_id):
+        await asyncio.sleep(0.02)
+        processed_jobs.append(job_id)
+    
+    await asyncio.gather(*(worker.dispatch(i, mock_handler) for i in range(10)))
+    assert len(processed_jobs) == 10
+    assert worker.metrics.total_processed == 10
+
+@pytest.mark.asyncio
+async def test_exponential_backoff_retry():
+    backoff = ExponentialBackoff(base_delay=0.1, factor=2.0, max_delay=1.0)
+    assert backoff.calculate_delay(attempt=1) == 0.1
+    assert backoff.calculate_delay(attempt=2) == 0.2
+    assert backoff.calculate_delay(attempt=3) == 0.4`
        },
        {
          filename: 'src/worker/engine.py',
          additions: 74,
          deletions: 16,
          patch: `@@ -34,16 +34,32 @@ class TaskWorker:
     def __init__(self, concurrency: int = 4, max_retries: int = 3):
         self.concurrency = concurrency
         self.max_retries = max_retries
-        self.queue = []
+        self.queue = asyncio.Queue()
         self.is_running = False
+        self._semaphore = asyncio.Semaphore(concurrency)
+        self.metrics = WorkerMetrics()
 
-    def process(self):
-        pass
+    async def start(self):
+        self.is_running = True
+        self._worker_tasks = [
+            asyncio.create_task(self._consumer_loop())
+            for _ in range(self.concurrency)
+        ]
+
+    async def dispatch(self, job_id: int, handler):
+        async with self._semaphore:
+            self.metrics.increment()
+            return await handler(job_id)
+
+    async def shutdown(self):
+        self.is_running = False
+        await self.queue.join()`
        },
        {
          filename: 'pyproject.toml',
          additions: 18,
          deletions: 4,
          patch: `@@ -22,4 +22,12 @@ [tool.poetry.dependencies]
 python = "^3.11"
 asyncio = "^3.4.3"
+redis = "^5.0.1"
+uvloop = "^0.19.0"
 
+[tool.pytest.ini_options]
+asyncio_mode = "auto"
+testpaths = ["tests"]
+addopts = "-v --cov=src --cov-report=term-missing"`
        }
      ]
    },
    fileTree: [
      {
        name: 'tests',
        type: 'folder',
        isOpen: true,
        children: [
          {
            name: 'test_async_worker.py',
            type: 'file',
            language: 'python',
            isVerifiedProof: true,
            size: '3.4 KB',
            content: `"""
SkillProof Verified Test Suite
Corresponds to candidate resume claims: Python, Asyncio, Pytest
"""
import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from worker.engine import TaskWorker, TaskStatus, ExponentialBackoff

@pytest.fixture
def worker_instance():
    return TaskWorker(concurrency=4, max_retries=3)

@pytest.mark.asyncio
async def test_worker_initialization(worker_instance):
    assert worker_instance.concurrency == 4
    assert worker_instance.status == TaskStatus.IDLE
    await worker_instance.start()
    assert worker_instance.is_running is True
    await worker_instance.shutdown()

@pytest.mark.asyncio
async def test_job_dispatch_concurrency(worker_instance):
    processed_jobs = []
    
    async def mock_handler(job_id):
        await asyncio.sleep(0.01)
        processed_jobs.append(job_id)
        
    await worker_instance.start()
    tasks = [worker_instance.dispatch(f"job-{i}", mock_handler) for i in range(10)]
    await asyncio.gather(*tasks)
    
    assert len(processed_jobs) == 10
    assert worker_instance.metrics.total_processed == 10
    await worker_instance.shutdown()

@pytest.mark.asyncio
async def test_exponential_backoff_retry():
    backoff = ExponentialBackoff(base_delay=0.1, factor=2.0, max_delay=1.0)
    assert backoff.calculate_delay(attempt=1) == 0.1
    assert backoff.calculate_delay(attempt=2) == 0.2
    assert backoff.calculate_delay(attempt=3) == 0.4
    assert backoff.calculate_delay(attempt=10) == 1.0  # capped at max_delay`
          },
          {
            name: 'test_redis_throttle.py',
            type: 'file',
            language: 'python',
            isVerifiedProof: true,
            size: '2.1 KB',
            content: `import pytest
import asyncio
from worker.throttle import SlidingWindowLimiter

@pytest.mark.asyncio
async def test_sliding_window_limiter():
    limiter = SlidingWindowLimiter(max_requests=5, window_seconds=1.0)
    user_id = "test-user-123"
    
    for _ in range(5):
        allowed = await limiter.allow_request(user_id)
        assert allowed is True
        
    blocked = await limiter.allow_request(user_id)
    assert blocked is False`
          },
          {
            name: 'test_jwt_auth.py',
            type: 'file',
            language: 'python',
            isVerifiedProof: false,
            size: '1.8 KB',
            content: `import pytest
from worker.auth import create_access_token, verify_token

def test_token_generation_and_expiry():
    token = create_access_token(data={"sub": "user_1"}, expires_delta_secs=60)
    assert token is not None
    payload = verify_token(token)
    assert payload["sub"] == "user_1"`
          }
        ]
      },
      {
        name: 'src',
        type: 'folder',
        isOpen: true,
        children: [
          {
            name: 'worker',
            type: 'folder',
            isOpen: true,
            children: [
              {
                name: 'engine.py',
                type: 'file',
                language: 'python',
                isVerifiedProof: true,
                size: '4.8 KB',
                content: `import asyncio
from enum import Enum

class TaskStatus(Enum):
    IDLE = "idle"
    RUNNING = "running"
    STOPPED = "stopped"

class WorkerMetrics:
    def __init__(self):
        self.total_processed = 0
    def increment(self):
        self.total_processed += 1

class ExponentialBackoff:
    def __init__(self, base_delay: float = 0.1, factor: float = 2.0, max_delay: float = 1.0):
        self.base_delay = base_delay
        self.factor = factor
        self.max_delay = max_delay

    def calculate_delay(self, attempt: int) -> float:
        delay = self.base_delay * (self.factor ** (attempt - 1))
        return min(delay, self.max_delay)

class TaskWorker:
    def __init__(self, concurrency: int = 4, max_retries: int = 3):
        self.concurrency = concurrency
        self.max_retries = max_retries
        self.status = TaskStatus.IDLE
        self.is_running = False
        self._semaphore = asyncio.Semaphore(concurrency)
        self.metrics = WorkerMetrics()

    async def start(self):
        self.status = TaskStatus.RUNNING
        self.is_running = True

    async def dispatch(self, job_id: str, handler):
        async with self._semaphore:
            self.metrics.increment()
            return await handler(job_id)

    async def shutdown(self):
        self.status = TaskStatus.STOPPED
        self.is_running = False`
              },
              {
                name: 'throttle.py',
                type: 'file',
                language: 'python',
                isVerifiedProof: false,
                size: '2.4 KB',
                content: `import time
from collections import defaultdict

class SlidingWindowLimiter:
    def __init__(self, max_requests: int, window_seconds: float):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.timestamps = defaultdict(list)

    async def allow_request(self, key: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds
        self.timestamps[key] = [t for t in self.timestamps[key] if t > window_start]
        if len(self.timestamps[key]) < self.max_requests:
            self.timestamps[key].append(now)
            return True
        return False`
              }
            ]
          }
        ]
      },
      {
        name: '.github',
        type: 'folder',
        isOpen: false,
        children: [
          {
            name: 'workflows',
            type: 'folder',
            isOpen: false,
            children: [
              {
                name: 'test-and-coverage.yml',
                type: 'file',
                language: 'yaml',
                isVerifiedProof: true,
                size: '1.2 KB',
                content: `name: Test & Coverage CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install poetry
          poetry install
      - name: Run pytest with coverage
        run: poetry run pytest --cov=src --cov-report=term-missing`
              }
            ]
          }
        ]
      },
      {
        name: 'pyproject.toml',
        type: 'file',
        language: 'toml',
        isVerifiedProof: false,
        size: '890 B',
        content: `[tool.poetry]
name = "async-task-engine"
version = "0.4.2"
description = "High-performance distributed asynchronous task processor"
authors = ["Alex Rivera <alex.rivera.dev@gmail.com>"]

[tool.poetry.dependencies]
python = "^3.11"
asyncio = "^3.4.3"
redis = "^5.0.1"
uvloop = "^0.19.0"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "-v --cov=src --cov-report=term-missing"`
      },
      {
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        isVerifiedProof: false,
        size: '2.5 KB',
        content: `# async-task-engine

A modern, non-blocking asynchronous task execution pipeline written in Python 3.11.

## Features
- **Asyncio Concurrency**: Up to 10,000 tasks/sec with uvloop
- **Comprehensive Pytest Suite**: 94% code coverage
- **Sliding-Window Throttling**: Protect downstream endpoints with backoff
`
      }
    ],
    ciLogs: {
      workflow: '.github/workflows/test-and-coverage.yml',
      runner: 'GitHub Actions / Ubuntu 22.04 LTS (x86_64)',
      duration: '42s',
      status: 'success',
      steps: [
        { name: 'Set up job runner', duration: '1.2s', status: 'success' },
        { name: 'actions/checkout@v4 (commit 7f8a92b)', duration: '0.9s', status: 'success' },
        { name: 'Set up Python 3.11 environment', duration: '2.1s', status: 'success' },
        { name: 'Install dependencies (poetry install)', duration: '6.4s', status: 'success' },
        { name: 'Run pytest automated test suite', duration: '18.2s', status: 'success' },
        { name: 'SkillProof Cryptographic Hash Audit', duration: '0.5s', status: 'success' }
      ],
      rawTerminal: `2026-10-14T14:22:20.102Z [INFO] Initializing GitHub Actions runner (ubuntu-22.04)
2026-10-14T14:22:21.015Z [INFO] Checking out commit SHA: 7f8a92b43e8d91c28f09da95a703d982b6c14e82
2026-10-14T14:22:21.920Z [INFO] Commit GPG Signature: VALID (Key: 0x4A8E9B12, Author: Alex Rivera)
2026-10-14T14:22:23.400Z [INFO] Setting up Python 3.11.8 / Poetry 1.8.2
2026-10-14T14:22:29.800Z [INFO] Dependencies installed successfully: pytest==8.1.1, pytest-asyncio==0.23.5, pytest-cov==5.0.0
2026-10-14T14:22:30.100Z [RUN] poetry run pytest --cov=src --cov-report=term-missing -v

============================= test session starts ==============================
platform linux -- Python 3.11.8, pytest-8.1.1, pluggy-1.4.0
rootdir: /home/runner/work/async-task-engine/async-task-engine
configfile: pyproject.toml
plugins: asyncio-0.23.5, cov-5.0.0
asyncio: mode=Mode.AUTO
collected 18 items

tests/test_async_worker.py::test_worker_initialization PASSED            [  5%] (0.02s)
tests/test_async_worker.py::test_job_dispatch_concurrency PASSED         [ 11%] (0.08s)
tests/test_async_worker.py::test_exponential_backoff_retry PASSED       [ 16%] (0.01s)
tests/test_redis_throttle.py::test_sliding_window_limiter PASSED         [ 22%] (0.04s)
tests/test_redis_throttle.py::test_rate_limit_reset_window PASSED        [ 27%] (0.03s)
tests/test_jwt_auth.py::test_token_generation_and_expiry PASSED          [ 33%] (0.02s)
tests/test_jwt_auth.py::test_expired_token_rejection PASSED              [ 38%] (0.01s)
tests/test_worker_engine.py::test_pipeline_shutdown_cleanly PASSED       [ 44%] (0.02s)
tests/test_worker_engine.py::test_concurrent_drain PASSED                [ 50%] (0.03s)
tests/test_worker_engine.py::test_worker_metrics_increment PASSED        [ 55%] (0.01s)
tests/test_worker_engine.py::test_queue_pressure_backpressure PASSED     [ 61%] (0.04s)
tests/test_worker_engine.py::test_worker_failure_recovery PASSED         [ 66%] (0.03s)
tests/test_worker_engine.py::test_worker_retry_limit_reached PASSED      [ 72%] (0.02s)
tests/test_worker_engine.py::test_circuit_breaker_trip PASSED            [ 77%] (0.03s)
tests/test_worker_engine.py::test_circuit_breaker_half_open PASSED       [ 83%] (0.02s)
tests/test_worker_engine.py::test_uvloop_event_policy PASSED              [ 88%] (0.01s)
tests/test_worker_engine.py::test_async_context_manager PASSED           [ 94%] (0.01s)
tests/test_worker_engine.py::test_healthcheck_endpoint PASSED            [100%] (0.01s)

---------- coverage: platform linux, python 3.11.8 ----------
Name                       Stmts   Miss  Cover   Missing
--------------------------------------------------------
src/worker/__init__.py         4      0   100%
src/worker/engine.py          72      4    94%   88-92
src/worker/throttle.py        38      2    95%   41-42
src/worker/auth.py            28      1    96%   55
--------------------------------------------------------
TOTAL                        142      7    95%

============================== 18 passed in 0.24s ==============================
2026-10-14T14:22:48.300Z [INFO] SkillProof Verification: Passed. 18 tests verified against commit 7f8a92b.
2026-10-14T14:22:48.512Z [SUCCESS] Job completed with exit code 0.`
    }
  },

  docker: {
    id: 'docker',
    title: 'Multi-Stage Docker & CI/CD',
    subtitle: 'GH Actions CI • Verified',
    repoName: 'alexrivera-dev/async-task-engine',
    repoUrl: 'https://github.com/alexrivera-dev/async-task-engine',
    branch: 'main',
    status: 'PROVEN',
    badgeText: '118MB OPTIMIZED',
    claimText: 'Packaged production microservices using lightweight multi-stage Dockerfiles and automated CI/CD pipelines.',
    summary: 'Multi-stage Dockerfile: builder cache layer, non-root user (appuser UID 1001), 118MB final image size, Trivy CVE scan zero vulnerabilities.',
    commit: {
      hash: '3c19e4a89d71c82e5b0213aa67ef882103f19bc4',
      shortHash: '3c19e4a',
      message: 'ci(docker): multi-stage build optimization and security non-root user container',
      author: 'Alex Rivera',
      authorHandle: '@alexrivera-dev',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      timestamp: '5 days ago (Oct 12, 2026, 09:15:42 UTC)',
      gpgVerified: true,
      gpgKeyId: '0x4A8E9B12 (Verified Key)',
      parentHash: '19fa2c4b810',
      stats: {
        additions: 48,
        deletions: 14,
        filesChanged: 2
      },
      diffs: [
        {
          filename: 'Dockerfile',
          additions: 36,
          deletions: 10,
          patch: `@@ -1,10 +1,28 @@
-# Old single-stage heavy image (740MB)
-FROM python:3.11
-WORKDIR /app
-COPY . .
-RUN pip install -r requirements.txt
-CMD ["python", "src/main.py"]
+# Stage 1: Build & Dependencies
+FROM python:3.11-slim as builder
+WORKDIR /app
+RUN apt-get update && apt-get install -y --no-install-recommends build-essential gcc
+RUN python -m venv /opt/venv
+ENV PATH="/opt/venv/bin:$PATH"
+COPY pyproject.toml poetry.lock ./
+RUN pip install poetry && poetry export -f requirements.txt | pip install -r /dev/stdin
+
+# Stage 2: Final Minimal Runtime (118MB)
+FROM python:3.11-slim as runner
+WORKDIR /app
+RUN useradd -m -u 1001 appuser
+COPY --from=builder /opt/venv /opt/venv
+ENV PATH="/opt/venv/bin:$PATH"
+COPY src/ ./src/
+USER appuser
+EXPOSE 8000
+HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1
+CMD ["python", "src/main.py"]`
        },
        {
          filename: '.github/workflows/docker-publish.yml',
          additions: 12,
          deletions: 4,
          patch: `@@ -18,4 +18,12 @@ jobs:
       - name: Set up Docker Buildx
         uses: docker/setup-buildx-action@v3
+      - name: Build and push container
+        uses: docker/build-push-action@v5
+        with:
+          context: .
+          push: false
+          tags: async-task-engine:latest
+          cache-from: type=gha
+          cache-to: type=gha,mode=max`
        }
      ]
    },
    fileTree: [
      {
        name: 'Dockerfile',
        type: 'file',
        language: 'dockerfile',
        isVerifiedProof: true,
        size: '1.1 KB',
        content: `# ==============================================================================
# Multi-Stage Optimized Dockerfile (Verified by SkillProof)
# Final image size: 118MB (vs 740MB standard base)
# Non-root security user configured: appuser (UID 1001)
# ==============================================================================

# Stage 1: Dependencies & Builder
FROM python:3.11-slim AS builder

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry export -f requirements.txt --output requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Minimal Production Image
FROM python:3.11-slim AS runner

WORKDIR /app

# Security: Create non-privileged user
RUN useradd -m -u 1001 -s /bin/bash appuser

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Copy source code and set ownership
COPY --chown=appuser:appuser src/ ./src/

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["python", "src/main.py"]`
      },
      {
        name: 'docker-compose.yml',
        type: 'file',
        language: 'yaml',
        isVerifiedProof: false,
        size: '640 B',
        content: `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"`
      },
      {
        name: '.dockerignore',
        type: 'file',
        language: 'text',
        isVerifiedProof: false,
        size: '140 B',
        content: `__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.pytest_cache/
.coverage
htmlcov/
.git/
.github/`
      },
      {
        name: '.github',
        type: 'folder',
        isOpen: true,
        children: [
          {
            name: 'workflows',
            type: 'folder',
            isOpen: true,
            children: [
              {
                name: 'docker-publish.yml',
                type: 'file',
                language: 'yaml',
                isVerifiedProof: true,
                size: '980 B',
                content: `name: Build & Security Scan
on:
  push:
    branches: [main]

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          load: true
          tags: async-task-engine:test
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'async-task-engine:test'
          severity: 'CRITICAL,HIGH'
          exit-code: '0'`
              }
            ]
          }
        ]
      }
    ],
    ciLogs: {
      workflow: '.github/workflows/docker-publish.yml',
      runner: 'GitHub Actions / Docker Buildx v0.13.0',
      duration: '1m 12s',
      status: 'success',
      steps: [
        { name: 'Set up Docker Buildx', duration: '2.1s', status: 'success' },
        { name: 'Build Multi-Stage Image', duration: '48.3s', status: 'success' },
        { name: 'Verify Container Size (118MB)', duration: '1.4s', status: 'success' },
        { name: 'Trivy Security Vulnerability Scan', duration: '19.2s', status: 'success' },
        { name: 'SkillProof Docker Verification Hook', duration: '0.8s', status: 'success' }
      ],
      rawTerminal: `2026-10-12T09:15:45.001Z [INFO] GitHub Actions Buildx Runner
2026-10-12T09:15:46.120Z [INFO] Checking out commit SHA: 3c19e4a89d71c82e5b0213aa67ef882103f19bc4
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 1.1kB done
#2 [internal] load .dockerignore
#2 transferring context: 140B done
#3 [stage-1 1/7] FROM docker.io/library/python:3.11-slim@sha256:7f10b
#3 resolve docker.io/library/python:3.11-slim@sha256:7f10b done
#4 [builder 2/5] RUN apt-get update && apt-get install -y --no-install-recommends build-essential gcc
#4 4.120 Installing build-essential packages... done
#5 [builder 3/5] RUN python -m venv /opt/venv
#6 [builder 4/5] COPY pyproject.toml poetry.lock ./
#7 [builder 5/5] RUN pip install poetry && poetry export -f requirements.txt | pip install -r /dev/stdin
#7 14.80 Successfully installed dependencies into /opt/venv
#8 [stage-1 2/7] RUN useradd -m -u 1001 -s /bin/bash appuser
#9 [stage-1 3/7] COPY --from=builder /opt/venv /opt/venv
#10 [stage-1 4/7] COPY --chown=appuser:appuser src/ ./src/
#11 exporting to image
#11 exporting layers done
#11 writing image sha256:3c19e4a89d71c82e5b0213aa67ef882103f19bc4
#11 naming to docker.io/library/async-task-engine:test done

[IMAGE SIZE REPORT]
REPOSITORY           TAG       IMAGE ID       CREATED          SIZE
async-task-engine    test      3c19e4a        12 seconds ago   118.4MB

[SECURITY SCAN: TRIVY]
2026-10-12T09:16:32.410Z [INFO] Scanning image async-task-engine:test
2026-10-12T09:16:35.120Z [INFO] Base OS: Debian GNU/Linux 12 (bookworm)
2026-10-12T09:16:35.800Z [INFO] Total Vulnerabilities: 0 CRITICAL, 0 HIGH
✓ SkillProof Audit: Docker security constraints met. Non-root user verified. Size budget passed.`
    }
  },

  react: {
    id: 'react',
    title: 'React + Vitest UI',
    subtitle: 'Production Deploy • 7d ago',
    repoName: 'alexrivera-dev/skillproof-ui',
    repoUrl: 'https://github.com/alexrivera-dev/skillproof-ui',
    branch: 'main',
    status: 'PROVEN',
    badgeText: 'VERCEL LIVE',
    claimText: 'Built modular React 18 dashboards with custom TypeScript hooks, Tailwind CSS tokens, and Vitest suites.',
    summary: 'Frontend repo. 8 custom hooks, Tailwind tokens, zero console errors, 100% Vitest unit test coverage on state managers.',
    commit: {
      hash: 'e2b810f639bc0192a54388107ef4c9901ad44211',
      shortHash: 'e2b810f',
      message: 'feat(ui): add 8 custom hooks, vitest suites, and tailwind design tokens',
      author: 'Alex Rivera',
      authorHandle: '@alexrivera-dev',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      timestamp: '7 days ago (Oct 10, 2026, 18:40:11 UTC)',
      gpgVerified: true,
      gpgKeyId: '0x4A8E9B12 (Verified Key)',
      parentHash: '9a72cd11b84',
      stats: {
        additions: 312,
        deletions: 45,
        filesChanged: 5
      },
      diffs: [
        {
          filename: 'src/hooks/useProofVerification.ts',
          additions: 54,
          deletions: 6,
          patch: `@@ -1,6 +1,54 @@
-import { useState } from 'react';
+import { useState, useCallback, useMemo } from 'react';
 
-export function useProofVerification() {
-  return {};
-}
+export interface ProofClaim {
+  id: string;
+  skillName: string;
+  confidence: number;
+  verified: boolean;
+}
+
+export function useProofVerification(initialClaims: ProofClaim[] = []) {
+  const [claims, setClaims] = useState<ProofClaim[]>(initialClaims);
+  const [isVerifying, setIsVerifying] = useState(false);
+
+  const verifiedCount = useMemo(
+    () => claims.filter(c => c.verified).length,
+    [claims]
+  );
+
+  const verifyClaim = useCallback(async (claimId: string) => {
+    setIsVerifying(true);
+    try {
+      await new Promise(r => setTimeout(r, 120));
+      setClaims(prev => prev.map(c => c.id === claimId ? { ...c, verified: true } : c));
+    } finally {
+      setIsVerifying(false);
+    }
+  }, []);
+
+  return { claims, verifiedCount, verifyClaim, isVerifying };
+}`
        },
        {
          filename: 'src/tests/useProofVerification.test.tsx',
          additions: 42,
          deletions: 0,
          patch: `@@ -0,0 +1,42 @@
+import { renderHook, act } from '@testing-library/react';
+import { describe, it, expect } from 'vitest';
+import { useProofVerification } from '../hooks/useProofVerification';
+
+describe('useProofVerification hook', () => {
+  it('calculates verifiedCount correctly', () => {
+    const { result } = renderHook(() => useProofVerification([
+      { id: '1', skillName: 'React', confidence: 95, verified: true },
+      { id: '2', skillName: 'Python', confidence: 90, verified: false }
+    ]));
+    expect(result.current.verifiedCount).toBe(1);
+  });
+
+  it('updates claim verification state on verifyClaim call', async () => {
+    const { result } = renderHook(() => useProofVerification([
+      { id: '1', skillName: 'Docker', confidence: 88, verified: false }
+    ]));
+    await act(async () => {
+      await result.current.verifyClaim('1');
+    });
+    expect(result.current.claims[0].verified).toBe(true);
+  });
+});`
        }
      ]
    },
    fileTree: [
      {
        name: 'src',
        type: 'folder',
        isOpen: true,
        children: [
          {
            name: 'hooks',
            type: 'folder',
            isOpen: true,
            children: [
              {
                name: 'useProofVerification.ts',
                type: 'file',
                language: 'typescript',
                isVerifiedProof: true,
                size: '2.2 KB',
                content: `import { useState, useCallback, useMemo } from 'react';

export interface ProofClaim {
  id: string;
  skillName: string;
  confidence: number;
  verified: boolean;
}

/**
 * SkillProof Verified Hook
 * 8 custom hooks exported across repository
 */
export function useProofVerification(initialClaims: ProofClaim[] = []) {
  const [claims, setClaims] = useState<ProofClaim[]>(initialClaims);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifiedCount = useMemo(
    () => claims.filter((c) => c.verified).length,
    [claims]
  );

  const verificationRatio = useMemo(
    () => (claims.length > 0 ? (verifiedCount / claims.length) * 100 : 0),
    [claims, verifiedCount]
  );

  const verifyClaim = useCallback(async (claimId: string) => {
    setIsVerifying(true);
    try {
      // Simulate cryptographic contract validation
      await new Promise((r) => setTimeout(r, 150));
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, verified: true } : c))
      );
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { claims, verifiedCount, verificationRatio, verifyClaim, isVerifying };
}`
              },
              {
                name: 'useRadarMetrics.ts',
                type: 'file',
                language: 'typescript',
                isVerifiedProof: false,
                size: '1.4 KB',
                content: `import { useMemo } from 'react';

export function useRadarMetrics(radarData: any[]) {
  return useMemo(() => {
    const totalClaimed = radarData.reduce((acc, curr) => acc + curr.claimed, 0);
    const totalProven = radarData.reduce((acc, curr) => acc + curr.proven, 0);
    return {
      claimedAvg: Math.round(totalClaimed / radarData.length),
      provenAvg: Math.round(totalProven / radarData.length)
    };
  }, [radarData]);
}`
              }
            ]
          },
          {
            name: 'tests',
            type: 'folder',
            isOpen: true,
            children: [
              {
                name: 'useProofVerification.test.tsx',
                type: 'file',
                language: 'typescript',
                isVerifiedProof: true,
                size: '1.8 KB',
                content: `import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useProofVerification } from '../hooks/useProofVerification';

describe('useProofVerification hook', () => {
  it('calculates verifiedCount correctly', () => {
    const { result } = renderHook(() =>
      useProofVerification([
        { id: '1', skillName: 'React', confidence: 95, verified: true },
        { id: '2', skillName: 'Python', confidence: 90, verified: false }
      ])
    );
    expect(result.current.verifiedCount).toBe(1);
    expect(result.current.verificationRatio).toBe(50);
  });

  it('updates claim verification state on verifyClaim call', async () => {
    const { result } = renderHook(() =>
      useProofVerification([
        { id: '1', skillName: 'Docker', confidence: 88, verified: false }
      ])
    );
    await act(async () => {
      await result.current.verifyClaim('1');
    });
    expect(result.current.claims[0].verified).toBe(true);
  });
});`
              }
            ]
          }
        ]
      },
      {
        name: 'vite.config.ts',
        type: 'file',
        language: 'typescript',
        isVerifiedProof: false,
        size: '520 B',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
});`
      },
      {
        name: 'package.json',
        type: 'file',
        language: 'json',
        isVerifiedProof: false,
        size: '1.2 KB',
        content: `{
  "name": "skillproof-ui",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.428.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "vitest": "^2.0.5",
    "typescript": "^5.5.3"
  }
}`
      }
    ],
    ciLogs: {
      workflow: '.github/workflows/frontend-ci.yml',
      runner: 'GitHub Actions / Ubuntu 22.04 LTS (Node 20.x)',
      duration: '29s',
      status: 'success',
      steps: [
        { name: 'Checkout Repository', duration: '0.8s', status: 'success' },
        { name: 'Setup Node.js 20 & npm cache', duration: '1.8s', status: 'success' },
        { name: 'Install npm dependencies', duration: '7.2s', status: 'success' },
        { name: 'Typecheck & Lint (0 errors)', duration: '4.6s', status: 'success' },
        { name: 'Vitest Unit & Hook Tests (8 passed)', duration: '11.4s', status: 'success' },
        { name: 'Vercel Preview Deploy', duration: '3.2s', status: 'success' }
      ],
      rawTerminal: `2026-10-10T18:40:15.012Z [INFO] Initializing Node CI workflow
2026-10-10T18:40:16.100Z [INFO] Checking out commit SHA: e2b810f639bc0192a54388107ef4c9901ad44211
2026-10-10T18:40:17.300Z [RUN] npm run test -- --run

 RUN  v2.0.5 /home/runner/work/skillproof-ui/skillproof-ui

 ✓ src/tests/useProofVerification.test.tsx (2 tests) 14ms
 ✓ src/tests/useRadarMetrics.test.tsx (2 tests) 9ms
 ✓ src/tests/useJobMatcher.test.tsx (4 tests) 18ms
 ✓ src/tests/useAuditReport.test.tsx (3 tests) 12ms

 Test Files  4 passed (4)
      Tests  11 passed (11)
   Start at  18:40:24
   Duration  412ms (transform 82ms, setup 18ms, collect 42ms, tests 53ms, env 142ms)

2026-10-10T18:40:25.100Z [RUN] npm run build
vite v5.4.2 building for production...
✓ 42 modules transformed.
dist/index.html                   0.82 kB │ gzip:  0.41 kB
dist/assets/index-Dk9.css        14.28 kB │ gzip:  3.65 kB
dist/assets/index-Bt1.js        142.10 kB │ gzip: 44.82 kB
✓ built in 620ms

2026-10-10T18:40:27.420Z [INFO] Vercel Live Preview ready: https://skillproof-ui-alexrivera.vercel.app
✓ SkillProof Audit: 8 custom hooks & clean Vitest build confirmed.`
    }
  },

  redis: {
    id: 'redis',
    title: 'Redis Caching',
    subtitle: 'Stale commit • Audit gap',
    repoName: 'alexrivera-dev/fastapi-starter-kit',
    repoUrl: 'https://github.com/alexrivera-dev/fastapi-starter-kit',
    branch: 'main',
    status: 'PARTIAL',
    badgeText: '92D STALE',
    claimText: 'Architected low-latency distributed caching layers with Redis clustering and TTL policies.',
    summary: 'Audit gap detected: Single commit 92 days ago with rudimentary connection stub. No Lua atomicity, no cluster failover, 0 dedicated unit tests.',
    commit: {
      hash: '91da07eb4231ac78931405e3234d6738290fae19',
      shortHash: '91da07e',
      message: 'chore(cache): stub redis connection pool in app.py',
      author: 'Alex Rivera',
      authorHandle: '@alexrivera-dev',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      timestamp: '92 days ago (Jul 15, 2026, 11:03:40 UTC)',
      gpgVerified: true,
      gpgKeyId: '0x4A8E9B12 (Verified Key)',
      parentHash: '72c819fa2e1',
      stats: {
        additions: 12,
        deletions: 3,
        filesChanged: 1
      },
      diffs: [
        {
          filename: 'src/app.py',
          additions: 12,
          deletions: 3,
          patch: `@@ -8,3 +8,12 @@ app = FastAPI(title="Starter Kit")
 
+# Audit Note: Minimal stub detected, no pooling or error retry logic
+import redis
+redis_client = None
+
+@app.on_event("startup")
+def init_redis():
+    global redis_client
+    redis_client = redis.Redis(host="localhost", port=6379, db=0)
+    # Missing: connection timeout, backoff, retry handler`
        }
      ]
    },
    fileTree: [
      {
        name: 'src',
        type: 'folder',
        isOpen: true,
        children: [
          {
            name: 'app.py',
            type: 'file',
            language: 'python',
            isVerifiedProof: false,
            size: '1.2 KB',
            content: `from fastapi import FastAPI
import redis

app = FastAPI(title="Starter Kit")

# SkillProof Audit Alert:
# - Stale commit (92 days ago)
# - No Lua scripting or distributed locks
# - Missing connection pooling and timeout handling
redis_client = None

@app.on_event("startup")
def init_redis():
    global redis_client
    redis_client = redis.Redis(host="localhost", port=6379, db=0)

@app.get("/health")
def health():
    return {"status": "ok", "redis": redis_client is not None}`
          }
        ]
      },
      {
        name: 'tests',
        type: 'folder',
        isOpen: true,
        children: [
          {
            name: 'test_health.py',
            type: 'file',
            language: 'python',
            isVerifiedProof: false,
            size: '480 B',
            content: `from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    # Note: 0 unit tests found for cache eviction, TTL, or Redis failures`
          }
        ]
      }
    ],
    ciLogs: {
      workflow: '.github/workflows/ci.yml',
      runner: 'GitHub Actions / Ubuntu 22.04 LTS',
      duration: '18s',
      status: 'warning',
      steps: [
        { name: 'Checkout Repository', duration: '0.6s', status: 'success' },
        { name: 'Install dependencies', duration: '4.8s', status: 'success' },
        { name: 'Run basic pytest', duration: '8.2s', status: 'success' },
        { name: 'SkillProof Deep Code Audit', duration: '1.2s', status: 'warning' }
      ],
      rawTerminal: `2026-07-15T11:03:45.010Z [INFO] Checking out commit SHA: 91da07eb4231ac78931405e3234d6738290fae19
2026-07-15T11:03:52.300Z [INFO] Running pytest...
tests/test_health.py::test_health PASSED [100%]
1 passed in 0.04s

----------------------------------------------------------------------
[SKILLPROOF AUDIT WARNING - AUDIT GAP DETECTED]
! Claim on Resume: "Architected distributed caching layers with Redis clustering"
! Reality in Codebase:
  - Last Redis commit was 92 days ago (stale)
  - Redis instance is configured as basic localhost standalone
  - 0 unit tests asserting Redis cache hits, misses, or serialization
  - No Lua scripts for atomic operations
! Verification Status: PARTIAL (45% Confidence)
----------------------------------------------------------------------`
    }
  }
};
