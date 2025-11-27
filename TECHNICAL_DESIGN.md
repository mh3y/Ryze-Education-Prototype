
# Ryze Education - Technical Design Specification

## 1. High-Level Architecture

The Ryze Education platform follows a **Multi-Tenant Event-Driven Architecture**. It separates the user-facing LMS from the heavy-lifting AI services using a modular design.

### Core Components

1.  **Frontend Layer (Client)**
    *   **SPA**: React 19 + Vite + TypeScript.
    *   **Routing**: React Router (Hash/History).
    *   **State**: React Context + Hooks.
    *   **Delivery**: CDN (Cloudflare/Vercel Edge).

2.  **API Gateway & Auth Layer**
    *   **Gateway**: Nginx / Cloud Load Balancer.
    *   **Auth Service**: Handles Identity, Tenant resolution, and RBAC (Student/Tutor/Admin).
    *   **Protocols**: REST for CRUD, WebSockets for Real-time AI streams.

3.  **Backend Service Layer (Microservices)**
    *   **LMS Core**: Course hierarchy, enrolment, assignments.
    *   **Ryze AI Engine**: Orchestrator for LLM pipelines (Generation, Marking, Tutor Chat).
    *   **Ingestion Worker**: Async processing of PDFs/Images (OCR -> Vectorize).
    *   **Billing Service**: Stripe integration, subscription management, usage metering.

4.  **Data Layer**
    *   **PostgreSQL**: Relational data (Users, Tenants, Courses, Grades).
    *   **Vector DB (Pinecone/Weaviate)**: Semantic index for Content & Question Bank.
    *   **Redis**: Caching, Rate limiting, Job Queues.
    *   **Object Storage (GCS/S3)**: Raw asset storage (PDFs, user uploads).

5.  **AI Model Layer**
    *   **LLM**: Gemini 2.0 (Primary), GPT-4 (Fallback/Reasoning).
    *   **Vision**: Gemini Vision / Document AI.
    *   **Orchestration**: LangChain / Custom Python Agents.

---

## 2. Folder Structure

```
/ryze-platform
├── /apps
│   ├── /web                # Main React Application (SaaS Dashboard)
│   ├── /marketing          # Public Landing Site
│   └── /mobile             # React Native Student App (Future)
├── /services
│   ├── /auth-service       # Node.js - Identity & Tenancy
│   ├── /core-lms           # Node.js - Courses, Classes, Users
│   ├── /ryze-ai            # Python - LLM Pipelines, Agents
│   ├── /ingestion          # Python - OCR, PDF Parsing, Embedding
│   └── /billing            # Node.js - Stripe, Invoicing
├── /packages
│   ├── /ui                 # Shared React Components (Design System)
│   ├── /api-types          # Shared TypeScript Interfaces (Zod)
│   └── /logger             # Shared Logging Utility
├── /infra
│   ├── /terraform          # IaC definitions
│   ├── /k8s                # Kubernetes Helm Charts
│   └── /db                 # SQL Migration Scripts
└── /data
    └── /prompts            # Versioned LLM System Prompts
```

---

## 3. Backend Microservices

| Service | Stack | Responsibilities |
| :--- | :--- | :--- |
| **Auth Service** | Node.js / Express | User registration, Login, JWT issuance, Tenant context resolution, Permission checks. |
| **Core LMS** | Node.js / NestJS | CRUD for Courses, Lessons, Assignments. Gradebook management. Calendar scheduling. |
| **Ryze AI** | Python / FastAPI | **Question Generator**: RAG-based retrieval & generation.<br>**Marking Engine**: OCR -> Evaluation -> Feedback.<br>**Tutor Bot**: Chat interface. |
| **Ingestion** | Python / Celery | Message queue consumer. PDF parsing, Image OCR, Diagram understanding, Chunking, Embedding. |
| **Billing** | Node.js / Express | Subscription lifecycle (Starter/Pro), Usage metering (AI Tokens, Storage), Invoicing. |

---

## 4. Frontend UI Modules

| Module | Users | Features |
| :--- | :--- | :--- |
| **Student Dashboard** | Student | **Course Viewer**: Video/Text lessons.<br>**Assignment Center**: Upload work, view grades.<br>**Ryze AI Arena**: Practice generator, Chat Tutor.<br>**Progress**: Mastery charts. |
| **Tutor Workspace** | Tutor | **Class Manager**: Student lists, attendance.<br>**Marking Suite**: AI-assisted grading interface.<br>**Ingestion Studio**: Upload resources to Knowledge Base. |
| **Admin Console** | Admin | **Tenant Settings**: Branding, Integrations.<br>**User Management**: Invite/Revoke access.<br>**Billing**: Payment methods, Invoice history. |

---

## 5. Database Schema (SQL)

```sql
-- TENANCY & IDENTITY
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    subscription_tier VARCHAR(50),
    config JSONB
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('student', 'tutor', 'admin')),
    password_hash VARCHAR,
    metadata JSONB
);

-- COURSES & LEARNING
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    title VARCHAR(255),
    subject VARCHAR(100),
    grade_level VARCHAR(50)
);

CREATE TABLE assignments (
    id UUID PRIMARY KEY,
    course_id UUID REFERENCES courses(id),
    title VARCHAR(255),
    due_at TIMESTAMPTZ,
    rubric_config JSONB
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id),
    student_id UUID REFERENCES users(id),
    content_url TEXT,
    status VARCHAR(50), -- 'submitted', 'marking', 'graded'
    ai_marking_data JSONB
);

-- AI & CONTENT
CREATE TABLE knowledge_assets (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    file_name VARCHAR(255),
    gcs_path TEXT,
    processing_status VARCHAR(50),
    vector_ids TEXT[]
);

CREATE TABLE questions (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    stem TEXT,
    question_type VARCHAR(50),
    difficulty INTEGER,
    topic_tags TEXT[],
    embedding VECTOR(1536)
);

CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    feature VARCHAR(100), -- 'generation', 'marking'
    tokens_input INTEGER,
    tokens_output INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. AI Pipelines

### 6.1. Content Ingestion Pipeline
**Input:** PDF Textbook / Exam Paper
1.  **Router**: Determine file type (Native PDF vs Scanned Image).
2.  **Extraction**:
    *   *Text*: `pdfplumber` or `PyMuPDF`.
    *   *Visuals*: Pass page images to **Gemini Vision** or **Document AI** to describe diagrams/graphs.
3.  **Semantic Chunking**: Split text into logical units (e.g., "Concept Definition", "Example Problem").
4.  **Embedding**: Generate vectors using `text-embedding-3-large` or `Gecko`.
5.  **Storage**: Upsert vectors to Pinecone with metadata (Source ID, Page #).

### 6.2. Question Generation Pipeline
**Input:** Topic: "Calculus", Difficulty: "Hard"
1.  **Retrieval**: Query Vector DB for 3-5 "Gold Standard" examples of Hard Calculus questions.
2.  **Drafting**: LLM Agent generates 3 candidate questions using Few-Shot prompting with retrieved examples.
3.  **Critique (Judge Model)**: A separate LLM call reviews candidates for:
    *   Solvability
    *   Ambiguity
    *   Alignment to curriculum
4.  **Refinement**: If Judge score < Threshold, regenerates specific candidates.
5.  **Output**: Structured JSON (Stem, Options, Solution, Marking Guide).

### 6.3. Automated Marking Pipeline
**Input:** Student handwritten image
1.  **OCR/Vision**: Convert handwriting to LaTeX/Text. Identify diagrams drawn by student.
2.  **Reasoning Trace**: LLM performs Chain-of-Thought to solve the problem itself.
3.  **Comparison**: Compare Student steps vs. Model steps + Official Solution.
4.  **Rubric Application**: Assign partial marks based on key milestones (e.g., "Correct formula used", "Correct substitution").
5.  **Feedback Generation**: Draft supportive feedback focusing on the *first* error point.

---

## 7. API Endpoints

### Auth
*   `POST /api/v1/auth/login`
*   `POST /api/v1/auth/refresh`

### LMS
*   `GET /api/v1/courses`
*   `GET /api/v1/courses/:id/assignments`
*   `POST /api/v1/assignments/:id/submit`

### Ryze AI
*   `POST /api/v1/ai/ingest` (Upload file -> Trigger Pipeline)
*   `POST /api/v1/ai/generate` (Prompt -> Question JSON)
*   `POST /api/v1/ai/chat` (Message -> Stream Response)
*   `GET /api/v1/ai/usage` (Tenant metering)

---

## 8. LLM System Prompts

**Question Generator System Prompt:**
> "You are a Senior Curriculum Designer. Your task is to create exam-style mathematics questions.
>
> Context:
> {retrieved_examples}
>
> Task:
> Generate a {difficulty} question on {topic}.
> Ensure the numbers are clean integers where possible.
> Output STRICT JSON with keys: 'stem', 'solution_steps', 'final_answer', 'tags'."

**Judge Model System Prompt:**
> "You are an Academic Auditor. Review the following generated question.
> Check for:
> 1. Is the question solvable?
> 2. Is the wording unambiguous?
> 3. Does it match the requested difficulty?
>
> Return a JSON with 'score' (0-100) and 'critique_notes'."

---

## 9. Tech Stack Justification

*   **React + Vite**: High-performance frontend, fast HMR, huge ecosystem.
*   **Node.js (LMS)**: JSON-heavy workload, shared TypeScript types with frontend.
*   **Python (AI)**: Native support for PyTorch, LangChain, and Data Science libraries.
*   **PostgreSQL**: Robust relational data integrity for billing and grades.
*   **Pinecone**: Managed vector search eliminates infra maintenance for AI memory.
*   **Gemini 2.0**: Large context window (1M+) allows feeding entire textbook chapters for superior RAG performance compared to smaller context models.
