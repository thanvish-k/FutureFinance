# FutureFinance — PERN Stack Decision Intelligence Platform

**An explainable AI-driven financial decision intelligence platform with Monte Carlo scenario simulation, built entirely on the PERN stack (PostgreSQL, Express, React, Node.js) with TypeScript.** FutureFinance is a DBMS-first academic and production project: the web interface is backed by a 3NF normalized local PostgreSQL model, secure REST API, database views, stored procedures/functions, triggers, audit logging, and Monte Carlo stochastic modeling.

---

## ⚡ Architecture Overview

```text
React 18 + Vite + TypeScript (Lucide + Recharts)
                      │
           (HTTP / Bearer JWT / JSON)
                      │
Express + TypeScript REST API (Node.js 24+)
         ├── Monte Carlo Stochastic Simulation Service (Box-Muller)
         ├── Deterministic Explainable AI & Health Engine
         └── Data Repository Layer
                      │
       (pg Pool / Local Connection String)
                      │
Local PostgreSQL 14+ (or Auto-Seeded Local Engine)
         ├── 3NF Tables with ENUMs, Check Constraints & Indexes
         ├── 5 Reporting Views (monthly_financial_summary, etc.)
         ├── Stored Procedures & Aggregate Functions
         └── PL/pgSQL Audit & Validation Triggers
```

---

## 💎 Features

- **End-to-End TypeScript**: Strong static typing across backend API contracts, database queries, and React UI components.
- **Local PostgreSQL Only**: Designed strictly for local database instances (no external or cloud dependencies).
- **Relational DBMS (3NF)**: Keys, check constraints, foreign-key cascade deletes, and composite indexes.
- **Database Triggers & Audit Trail**: Native PostgreSQL triggers automatically log all financial modifications into `audit_logs` as JSONB and enforce validation invariants.
- **Monte Carlo Engine**: Simulates 5,000+ stochastic market trajectories over user-defined horizons, computing P10, P25, Median P50, P75, and P90 percentiles alongside goal achievement probabilities.
- **Explainable Financial Health Diagnostics**: Transparent 100-point composite score with inspectable sub-metrics:
  - Savings Rate (25 pts)
  - Debt Burden Management (25 pts)
  - Emergency Fund Runway (20 pts)
  - Asset Diversification (15 pts)
  - Milestone Goal Trajectory (15 pts)
- **Interactive What-If Sandbox**: Real-time slider simulation of income shifts and expense trimmings with persistent scenario recording.
- **Precision UI (Aesthetic Refresh)**: Built with the `/frontend-design` discipline — obsidian void surfaces (`#070a0f`), hairline ledger borders, tabular numerical typography (`JetBrains Mono` + `Plus Jakarta Sans`), and zero generic template tells.

---

## 🗄️ Database Architecture

The local PostgreSQL scripts are organized in `database/postgres/`:

| Script | Purpose |
|---|---|
| [`database/postgres/schema.sql`](file:///c:/Users/bhanu/Desktop/FutureFinance/database/postgres/schema.sql) | DDL for tables, controlled enum types, check constraints, indexes, and foreign keys |
| [`database/postgres/seed.sql`](file:///c:/Users/bhanu/Desktop/FutureFinance/database/postgres/seed.sql) | 5 representative users, profiles, incomes, expenses, investments, loans, and goals |
| [`database/postgres/views.sql`](file:///c:/Users/bhanu/Desktop/FutureFinance/database/postgres/views.sql) | 5 reporting views (monthly summary, portfolio allocation, goal progress, category summary) |
| [`database/postgres/procedures.sql`](file:///c:/Users/bhanu/Desktop/FutureFinance/database/postgres/procedures.sql) | Functions & procedures for user monthly summaries, goal progress, and expense reporting |
| [`database/postgres/triggers.sql`](file:///c:/Users/bhanu/Desktop/FutureFinance/database/postgres/triggers.sql) | PL/pgSQL triggers for immutable audit logging and target-date validation |
| [`database/postgres/queries.sql`](file:///c:/Users/bhanu/Desktop/FutureFinance/database/postgres/queries.sql) | Evaluation-ready queries: window functions, CTEs, subqueries, and atomic transactions |

---

## 🚀 Quickstart & Execution

### Prerequisites
- Node.js 20+ (v24 installed)
- Local PostgreSQL 14+ (optional for preview; auto-fallback provided)

### 1. Database Setup (Local PostgreSQL)
If you have PostgreSQL running locally:
```powershell
# Create database
psql -U postgres -c "CREATE DATABASE futurefinance;"

# Run scripts in order
psql -U postgres -d futurefinance -f database/postgres/schema.sql
psql -U postgres -d futurefinance -f database/postgres/views.sql
psql -U postgres -d futurefinance -f database/postgres/procedures.sql
psql -U postgres -d futurefinance -f database/postgres/triggers.sql
psql -U postgres -d futurefinance -f database/postgres/seed.sql
```
*(Alternatively, simply run `npm run db:init` inside the `backend/` directory).*

### 2. Backend (Express + TypeScript)
```powershell
cd backend
npm install
# Starts server at http://localhost:8000
npm run dev
```

### 3. Frontend (React + Vite + TypeScript)
```powershell
cd frontend
npm install
# Starts dev server at http://localhost:5173
npm run dev
```

Open `http://localhost:5173`.
- **Default Demo User**: `demo@futurefinance.in`
- **Default Password**: `FutureFinance@123`

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new local user & initialize profile |
| `POST` | `/api/auth/login` | Authenticate user & issue signed JWT |
| `GET` | `/api/auth/me` | Fetch active user context & financial profile |
| `GET` / `POST` | `/api/income` | List or create income transactions |
| `PUT` / `DELETE` | `/api/income/:id` | Update or remove income entry |
| `GET` / `POST` | `/api/expenses` | List or create expense records |
| `PUT` / `DELETE` | `/api/expenses/:id` | Update or remove expense record |
| `GET` / `POST` | `/api/investments` | List or record portfolio holdings |
| `PUT` / `DELETE` | `/api/investments/:id` | Update valuation or remove investment |
| `GET` / `POST` | `/api/goals` | List or register milestone financial goals |
| `PUT` / `DELETE` | `/api/goals/:id` | Update progress or remove goal |
| `GET` | `/api/dashboard` | Aggregated executive metrics, health score, category breakdown |
| `GET` | `/api/financial-health` | Transparent 5-part score breakdown |
| `GET` | `/api/insights` | Deterministic explainable recommendations with metric evidence |
| `POST` | `/api/simulation/run` | Execute Monte Carlo run (percentiles, distribution, goal probability) |
| `GET` | `/api/simulation/:id` | Retrieve historical simulation run |
| `GET` / `POST` | `/api/scenarios` | Retrieve or persist what-if hypotheses |
| `GET` | `/health` | Server health & database connection status |
