# AegisSphere – Security Operations Platform

**AegisSphere** is a modern, modular cybersecurity and Security Operations Center (SOC) intelligence platform designed to streamline log analysis, threat detection, and incident response. It solves the challenge of high-volume security telemetry by ingesting multi-format logs, executing a deterministic four-agent detection and MITRE ATT&CK mapping pipeline, and providing security analysts and administrators with actionable forensics, incident lifecycle tracking, binary PDF compliance reporting, and optional AI-assisted advisory analysis.

---

## Key Features

- **Multi-Format Log Ingestion:** Upload and parse raw security logs (`.log`, `.txt`, `.csv`, `.json`) up to 15 MB with path-traversal sanitization and format validation.
- **Deterministic 4-Agent Pipeline:** Coordinated execution flow across specialized agents for log parsing, heuristic classification, MITRE enrichment, and remediation playbook formulation.
- **Heuristic Threat Detection:** Real-time rule matching and burst clustering for SQL Injection, Command Injection (RCE), SSH Brute Force, Cross-Site Scripting (XSS), and Port Scanning.
- **MITRE ATT&CK v14.1 Mapping:** Automatic contextual tagging of detected threats with standard enterprise tactics (Initial Access, Execution, Reconnaissance, Credential Access) and technique IDs (T1190, T1059, T1110, T1595).
- **Threat Forensics & Evidence Breakdown:** Deep inspection modal with explainable confidence scoring, observed telemetry facts, affected resources, and matched indicators.
- **Incident Response Lifecycle:** End-to-end incident management tracking tickets from triage to containment (`Open` → `In Progress` → `Mitigated` → `Closed`).
- **Security Test Lab:** Built-in simulation generator to execute controlled synthetic attack scenarios (SQLi, Brute Force, XSS, Port Scan) for testing pipeline validation.
- **Binary PDF Compliance Reports:** Server-side dynamic PDF generation using PDFKit with executive summaries, threat breakdowns, and audit metrics.
- **Optional Gemini AI Advisory Layer:** On-demand contextual reasoning and SOC investigation checklists powered by Google Gemini, operating strictly as an advisory layer on compact structured evidence.
- **Role-Based Access Control (RBAC):** Server-enforced role separation between **Security Analyst** (isolated personal SOC workspace) and **Administrator** (platform-wide governance console).
- **Multi-Tenant User Isolation:** Strict database query scoping ensuring analysts cannot view, edit, or access another user's logs, threats, incidents, or reports.
- **Admin Governance Console:** Live operational directory, user account management (activate/suspend), aggregated threat matrix, audit logs, and runtime system health probes.
- **Fully Responsive Light-Blue SaaS UI:** Mobile-optimized interface with touch-friendly off-canvas slide-in drawers, responsive KPI grids, and zero horizontal page overflow across all viewports (320px to 1920px+).

---

## Architecture

AegisSphere employs a deterministic, pipeline-driven processing architecture where rule-based agents serve as the authoritative source of truth:

```text
       Security Log File (.log, .txt, .csv, .json)
                          OR
            Security Test Lab Simulation
                          ↓
               [ 1. LogParserAgent ]
         (Tokenization, Normalization & IP Extraction)
                          ↓
            [ 2. ThreatClassifierAgent ]
         (Heuristic Rules, Pattern Matching & Clustering)
                          ↓
          [ 3. ThreatIntelligenceAgent ]
         (MITRE ATT&CK v14.1 Tactics & Technique IDs)
                          ↓
              [ 4. RemediationAgent ]
         (Containment Playbooks & SOC Action Steps)
                          ↓
             [ MongoDB Document Store ]
   (Persisted User Logs, Threats, Incidents & Reports)
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
[ Analyst SOC Workspace ]          [ Admin Console ]
• Ingestion & Forensics            • Multi-Tenant User Directory
• Incident Lifecycle               • Aggregated Threat Matrix
• MITRE Intel Matrix               • Subsystem Health Probes
• Binary PDF Generation            • Immutable Audit Logging
        │
        └─────────────────┬─────────────────┘
                          ↓ (Optional On-Demand)
           [ Google Gemini Advisory Layer ]
      (Contextual Reasoning on Compact Evidence)
```

> **Note:** The 4-agent pipeline operates deterministically and remains the sole source of truth for threat detection. Google Gemini is utilized strictly as an advisory assistant for investigation summaries and remediation context.

---

## Threat Detection Capabilities

The `ThreatClassifierAgent` evaluates extracted telemetry against deterministic heuristic signatures, regex patterns, and time-window frequency clustering:

| Attack Category | MITRE Technique | Description & Signatures Evaluated |
| :--- | :--- | :--- |
| **SQL Injection (SQLi)** | `T1190` | `UNION SELECT`, `OR 1=1`, `' OR ''='`, `INFORMATION_SCHEMA`, sleep/benchmark injection payloads. |
| **Command Injection (RCE)** | `T1059` | Shell command chaining (`/bin/sh`, `; cat /etc/passwd`, `curl \| bash`, `nc -e`, `powershell.exe`). |
| **SSH / Auth Brute Force** | `T1110` | Repeated authentication failure clustering, dictionary spray bursts, and high-frequency failed logins from a single source IP. |
| **Cross-Site Scripting (XSS)** | `T1059.007` | Malicious client-side script tags (`<script>`, `onerror=`, `javascript:`, `eval()`). |
| **Network Port Scanning** | `T1595` | Sequential port probes across standard service ports (e.g., 21, 22, 23, 25, 80, 443, 3306, 8080). |
| **Security Scanner Activity** | `T1595` | Automated reconnaissance tools (e.g., `Nmap`, `Nikto`, `sqlmap`, `Masscan`, `Acunetix`). |

---

## Four-Agent Pipeline

### 1. Log Parser Agent (`LogParserAgent.js`)
- Ingests raw text from Linux syslog, auth.log, Apache/Nginx web logs, CSV exports, and structured JSON/JSONL.
- Tokenizes and extracts fields: `sourceIp`, `destinationIp`, `sourcePort`, `destinationPort`, `protocol`, `username`, `action`, `status`, `endpoint`, `userAgent`, and timestamps.
- Sanitizes missing fields without inventing synthetic values.

### 2. Threat Classifier Agent (`ThreatClassifierAgent.js`)
- Executes multi-event correlation, IP frequency grouping, and heuristic pattern recognition.
- Assigns severity ratings (`Critical`, `High`, `Medium`, `Low`) based on impact, frequency, and targeted resources.
- Calculates transparent, evidence-backed confidence scores with explainable rationale strings.

### 3. Threat Intelligence Agent (`ThreatIntelligenceAgent.js`)
- Correlates classified threats with curated MITRE ATT&CK Enterprise Matrix v14.1 records.
- Tags threats with tactic names (`Initial Access`, `Execution`, `Credential Access`, `Reconnaissance`), technique IDs, and standard mitigation guidelines.

### 4. Remediation Agent (`RemediationAgent.js`)
- Generates prescriptive, safe containment directives (e.g., edge WAF block rules, host network quarantine, fail2ban configuration).
- Produces step-by-step SOC operator investigation checklists tailored to the specific attack vector.

---

## AI-Assisted Security Analysis (Google Gemini)

AegisSphere includes an optional, contextual AI advisory layer integrated via `@google/genai`:

- **Advisory Role:** Gemini does **not** classify, detect, or decide whether a threat exists. It receives verified threat evidence from the deterministic pipeline and generates natural-language investigation narratives.
- **Compact Evidence Packaging:** Only structured metadata (threat type, severity, MITRE ID, matched indicators, and log format) is transmitted; raw 15 MB log streams are never sent.
- **Safe Fallback:** If `GEMINI_API_KEY` is not configured, the entire core platform continues operating normally without disruption.
- **Security:** The Gemini API key is strictly maintained on the backend server and is never exposed to the client browser.

---

## Platform Security & Governance

- **Authentication:** Stateless JSON Web Token (JWT) verification via HTTP `Authorization: Bearer <token>` headers.
- **Password Security:** Salted password hashing utilizing `bcryptjs` (cost factor 10).
- **Server-Side RBAC:** Middleware enforcement (`roleMiddleware.js`) preventing unauthorized access to `/api/admin/*` routes.
- **Data Isolation & IDOR Protection:** All database operations on logs, threats, incidents, and reports are strictly scoped to `req.user._id` for analysts.
- **HTTP Protection:** Secure response headers managed via `helmet`.
- **CORS Hardening:** Strict origin whitelisting configured in `server.js`.
- **Rate Limiting:** Granular request limiters on API endpoints (`apiLimiter`, `authLimiter`, `uploadLimiter`, `aiLimiter`, `attackTestLimiter`).
- **Input & Upload Sanitization:** Path traversal prevention, extension whitelisting, and strict 15 MB file size enforcement via Multer.
- **Audit Logging:** Immutable administrative audit logging for logins, status changes, and diagnostic queries.

---

## Supported Log Formats

| Format | Extension | Typical Sources |
| :--- | :--- | :--- |
| **Raw Server Log** | `.log` | Linux `/var/log/auth.log`, syslog, Apache `access.log`, Nginx `access.log` |
| **Plain Text Log** | `.txt` | Exported firewall streams, custom application security dumps |
| **Structured CSV** | `.csv` | Network sensor captures, SIEM table exports, firewall CSV logs |
| **JSON / JSONL** | `.json` | Cloud audit trails, structured application telemetry, event streams |

*Maximum allowed file size per upload: **15 MB**.*

---

## Tech Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios
- **Data Visualization:** Recharts
- **Iconography:** Lucide React, React Icons
- **Animation:** Framer Motion
- **Styling:** Custom Light-Blue SaaS CSS Design System (Zero Tailwind dependency)

### Backend
- **Runtime:** Node.js
- **Web Framework:** Express 5
- **File Ingestion:** Multer
- **Report Generation:** PDFKit
- **Security:** Helmet, CORS, bcryptjs, jsonwebtoken, express-rate-limit
- **AI SDK:** `@google/genai` (Google Gen AI SDK)
- **Environment Config:** dotenv

### Database
- **Database:** MongoDB
- **Object Modeling:** Mongoose 9

---

## Project Structure

```text
AegisSphere/
├── backend/
│   ├── scripts/
│   │   └── createAdmin.js           # CLI script to provision Admin accounts
│   ├── src/
│   │   ├── agents/                  # 4-Agent pipeline implementation
│   │   │   ├── AgentOrchestrator.js
│   │   │   ├── LogParserAgent.js
│   │   │   ├── ThreatClassifierAgent.js
│   │   │   ├── ThreatIntelligenceAgent.js
│   │   │   └── RemediationAgent.js
│   │   ├── config/                  # Database and Multer storage configuration
│   │   ├── controllers/             # API request handlers (Admin, Auth, Logs, etc.)
│   │   ├── middleware/              # Auth, RBAC, and rate-limiting middleware
│   │   ├── models/                  # Mongoose schemas (User, Log, Threat, Incident, etc.)
│   │   ├── routes/                  # Express route definitions
│   │   ├── services/                # Gemini AI and PDFKit report services
│   │   ├── tests/                   # Comprehensive automated test suites
│   │   └── server.js                # Express entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI, Layout, Admin, and Landing components
│   │   ├── context/                 # AuthContext & state providers
│   │   ├── pages/                   # Application views (Dashboard, Incidents, Admin, etc.)
│   │   │   └── admin/               # Admin Console pages
│   │   ├── services/                # API client integration
│   │   ├── styles/                  # Cohesive CSS styling system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** v6.0 or higher (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Vansh-7454/aegissphere-ai-security-copilot.git
cd aegissphere-ai-security-copilot
```

---

### 2. Backend Setup

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your settings:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/aegissphere
   JWT_SECRET=YourSuperSecretKey123!
   GEMINI_API_KEY=your_optional_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

4. *(Optional)* Provision an Administrator account via CLI:
   ```bash
   npm run create-admin -- --email admin@aegissphere.io --password AdminSecret123! --name "Lead Administrator"
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Backend server runs on `http://127.0.0.1:5000`.*

---

### 3. Frontend Setup

1. Open a new terminal, navigate to the frontend directory, and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend application runs on `http://localhost:5173`.*

---

### 4. Running Automated Verification Suite

To verify all 25 backend test vectors, run the automated test suite:

```bash
cd backend
node src/tests/comprehensive_admin_test.js
```

To verify the frontend production build:

```bash
cd frontend
npm run build
```

---

## License

This project is licensed under the [ISC License](LICENSE).
