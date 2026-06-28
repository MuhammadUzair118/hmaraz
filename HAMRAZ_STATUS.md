# Hamraz — Project Status & Build Plan

> **Last updated:** 2026-06-28  
> **Deployed to production at https://hamraz-web.vercel.app**  
> Phase 8 ✅ | Phase 9 ✅ | Phase 10 ✅ | Phase 11 ✅

---

## Overview

**Hamraz** is an AI-powered Personal Health Intelligence Platform. It monitors the user's body using wearable devices and phone sensors, learns their baseline health patterns, detects anomalies, and provides personalized insights.

**Not** a telemedicine platform. No doctors, hospitals, pharmacies, appointments, or prescriptions.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Built and working |
| 🔧 | In progress |
| ⬜ | Not started |
| ❌ | Removed/deleted |

---

## Phase Progress

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — House Cleaning | ✅ Complete | Delete telemedicine files and references |
| 2 — Prisma Schema | ✅ Complete | Rename User → UserProfile, add user_profiles table |
| 3 — Supabase Auth | ✅ Complete | Switch from custom JWT to Supabase Auth only |
| 4 — AI Agent Package | ✅ Complete | Create `@hamraz/ai` package |
| 5 — API Route Handlers | ✅ Complete | Create all Next.js API route handlers |
| 6 — Connect Frontend | ✅ Complete | Replace mock data with real API calls |
| 7 — New Pages | ✅ Complete | Health Timeline, Trends, Devices |
| 8 — Vercel Cron Jobs | ✅ Complete | Daily summaries, weekly trends, anomaly cleanup |
| 9 — CI & Deployment | ✅ Complete | Vercel setup, CI/CD, repo cleanup, agent files |
| 10 — Production Deploy | ✅ Complete | Deploy, env vars, cron, auth fix, OAuth config |
| 11 — Placeholder Pages | ✅ Complete | Real Notifications & Settings pages built |

---

## ✅ Phase 1 — House Cleaning (Complete)

### Deleted directories
| Path | Reason |
|------|--------|
| `apps/appointments-service/` | Telemedicine — removed |
| `apps/medicine-service/` | Telemedicine — removed |
| `apps/web/src/app/medicines/` | Telemedicine page — removed |
| `apps/web/src/app/doctors/` | Telemedicine page — removed |

### Edited files
| File | Change |
|------|--------|
| `apps/web/src/components/BottomNav.tsx` | Removed "Meds" and "Doctors" nav items |
| `apps/web/src/app/page.tsx` | Removed medicine card, appointment card, "Book Doctor" and "Medicines" quick actions |
| `apps/web/src/lib/api.ts` | Removed doctors, appointments, medicines API methods |
| `apps/web/src/app/onboarding/page.tsx` | Removed "Manage medications" and "Connect with doctors" goal options |
| `apps/web/src/app/layout.tsx` | Removed "telemedicine" from description |

---

## ✅ Phase 2 — Prisma Schema Update (Complete)

### Changes made
| Change | Details |
|--------|---------|
| `User` → `UserProfile` | Renamed model, removed `password` field, removed `@default(cuid())` from `id` |
| Table name | `users` → `user_profiles` |
| All relations | 16 model relations updated from `User` → `UserProfile` |
| `packages/types` | `User` interface → `UserProfile`, removed `DashboardData` and `AuthResponse` interfaces |
| Database pushed | `prisma db push` applied to Supabase — `user_profiles` table created |

### Current database tables (Supabase)

| Table | Source | Purpose |
|-------|--------|---------|
| `user_profiles` | Prisma | App user data (name, email, onboarding, etc.) |
| `auth.users` | Supabase Auth | Authentication (Supabase-managed) |
| `vital_records` | Prisma | Health vital readings |
| `vital_baselines` | Prisma | Per-user per-metric baselines |
| `wearable_devices` | Prisma | Connected wearable devices |
| `wearable_sync_logs` | Prisma | Wearable sync history |
| `phone_sensor_data` | Prisma | Phone sensor readings |
| `emergency_contacts` | Prisma | Emergency contacts |
| `emergency_alerts` | Prisma | SOS alerts |
| `notifications` | Prisma | User notifications |
| `notification_preferences` | Prisma | Notification channel preferences |
| `conversations` | Prisma | AI chat conversations |
| `messages` | Prisma | Chat messages |
| `health_metrics` | Prisma | Daily health aggregates |
| `anomaly_detections` | Prisma | Detected anomalies |
| `ai_insights` | Prisma | AI-generated insights |
| `daily_summaries` | Prisma | Daily health summaries |
| `analytics` | Prisma | Period-based analytics |
| `sync_logs` | Prisma | Sync logging |
| `audit_logs` | Prisma | Security audit trail |
| `user_settings` | Prisma | User preferences |
| `_prisma_migrations` | Prisma | Migration tracking |

---

## ✅ Phase 3 — Supabase Auth (Complete)

### New files created
| File | Purpose |
|------|---------|
| `apps/web/src/lib/supabase.ts` | 3 Supabase client variants: browser, server, middleware |
| `apps/web/src/lib/auth-helpers.ts` | `requireAuth()`, `getOrCreateProfile()`, `unauthorized()` |
| `apps/web/src/app/api/auth/user/route.ts` | Auto-creates `user_profiles` record on first sign-in |
| `apps/web/src/app/api/health/route.ts` | Health check endpoint |
| `apps/web/src/middleware.ts` | Edge middleware — session check + redirect |

### Updated files
| File | Change |
|------|--------|
| `apps/web/src/app/signin/page.tsx` | Uses `supabase.auth.signInWithPassword()` instead of custom JWT |
| `apps/web/src/app/signup/page.tsx` | Uses `supabase.auth.signUp()` instead of custom JWT |
| `apps/web/src/app/auth/callback/route.ts` | Simplified — exchange code, redirect to `/` |
| `apps/web/src/app/page.tsx` | Uses `supabase.auth.getSession()` for auth check |
| `packages/utils/src/index.ts` | Removed JWT, bcrypt, Express middleware (signJwt, verifyJwt, hashPassword, comparePassword, authenticate, validate) |
| `packages/utils/package.json` | Removed `jsonwebtoken`, `bcryptjs` dependencies |

### Deleted files
| File | Reason |
|------|--------|
| `apps/web/src/lib/auth.ts` | Replaced by Supabase Auth |
| `apps/web/src/app/auth/sync/page.tsx` | No longer needed (Supabase handles session creation) |

### Auth flow
```
Email/Password:
  User fills signin form → supabase.auth.signInWithPassword()
  → Supabase sets session cookie → redirect to /
  → Dashboard calls GET /api/auth/user
  → Creates user_profile if first visit
  → Returns user data with onboardingCompleted flag

Google OAuth:
  User clicks Google → Supabase OAuth URL → Google consent
  → Redirect to /auth/callback → exchange code → session cookie
  → Redirect to / → GET /api/auth/user → same flow as above

Session persistence:
  middleware.ts checks cookie on every page navigation
  If expired → auto-refresh via Supabase
  If invalid → redirect to /signin
```

---

## ✅ Phase 4 — `@hamraz/ai` Package (Complete)

### New package created

```
packages/ai/
├── package.json
└── src/
    ├── index.ts                      — Barrel exports
    ├── config.ts                     — Priority, defaults, cooldown, pipeline settings
    ├── types.ts                      — All types: VitalRecord, Baseline, Anomaly, Insight, Message, etc.
    ├── providers/
    │   ├── base.ts                   — Abstract AIProvider class
    │   ├── factory.ts                — createProviderSuite() builder
    │   ├── health.ts                 — ProviderHealthRegistry (cooldown, fail-count, health checks)
    │   ├── registry.ts               — ProviderRegistry (priority-ordered, availability)
    │   ├── fallback.ts               — FallbackProvider (auto-failover across providers)
    │   ├── gemini.ts                 — GeminiProvider (SDK, streaming, health check)
    │   ├── deepseek.ts               — DeepSeekProvider (REST, streaming, health check)
    │   ├── qwen.ts                   — QwenProvider (DashScope REST, streaming, health check)
    │   └── ollama.ts                 — OllamaProvider (local REST, streaming, health check)
    ├── pipeline/
    │   ├── validate.ts               — Zod schema + metric range per vital type
    │   ├── normalize.ts              — Unit conversion (F→C, lbs→kg, inches→cm, etc.)
    │   ├── deduplicate.ts            — Time-window dedup (60s default)
    │   └── impute.ts                 — Linear interpolation for gaps <5min
    ├── services/
    │   ├── chat.ts                   — ChatService (streaming + non-streaming)
    │   ├── insights.ts               — InsightsService (daily/weekly/monthly generation)
    │   ├── anomaly.ts                — AnomalyService (statistical z-score + AI explanation)
    │   ├── baseline.ts               — BaselineService (mean/stdDev/min/max computation)
    │   └── ingest.ts                 — IngestService (full pipeline: validate→normalize→dedup→impute→baseline→detect)
    ├── prompts/
    │   ├── system-prompt.ts          — Hamraz AI system persona
    │   ├── insight-prompt.ts         — Daily/weekly/monthly insight generation prompts
    │   └── anomaly-prompt.ts         — Anomaly explanation prompt
    └── mock/
        ├── chat.ts                   — Mock SSE streaming + complete responses
        ├── insights.ts               — Mock daily/weekly/monthly insights
        └── anomaly.ts                — Mock anomaly detection results and explanations
```

### Design decisions (all implemented)
- All providers implement `AIProvider` abstract class (swappable)
- Default provider: Gemini Free API (`gemini-2.5-flash`) via `@google/generative-ai` SDK
- Smart fallback: `FallbackProvider` iterates available providers; `ProviderHealthRegistry` applies 5-min cooldown after 3 consecutive failures
- Frontend should show `"Using backup AI service"` — never exposes internal provider errors
- `@hamraz/ai` is a workspace package extractable to its own Vercel service later
- New dependency: `@google/generative-ai@^0.21.0`, `zod@^3.23.0`
- Compiles cleanly (`tsc --noEmit --strict` passes)

---

## ✅ Phase 5 — API Route Handlers (Complete)

All 34 route handler files created under `apps/web/src/app/api/`:

| Route Group | Endpoints | Status |
|-------------|-----------|--------|
| `api/health/route.ts` | `GET /` | ✅ Built |
| `api/auth/user/route.ts` | `GET /` | ✅ Built |
| `api/auth/signup/route.ts` | `POST /` | ✅ Built |
| `api/auth/signin/route.ts` | `POST /` | ✅ Built |
| `api/auth/refresh/route.ts` | `POST /` | ✅ Built |
| `api/users/me/route.ts` | `GET, PUT /` | ✅ Built |
| `api/users/[id]/route.ts` | `DELETE /` | ✅ Built |
| `api/vitals/route.ts` | `POST /` | ✅ Built |
| `api/vitals/latest/all/route.ts` | `GET /` | ✅ Built |
| `api/vitals/latest/[metric]/route.ts` | `GET /` | ✅ Built |
| `api/vitals/history/[metric]/route.ts` | `GET /` | ✅ Built |
| `api/vitals/baselines/route.ts` | `GET /` | ✅ Built |
| `api/vitals/baseline/route.ts` | `POST /` | ✅ Built |
| `api/devices/route.ts` | `GET, POST /` | ✅ Built |
| `api/devices/[id]/route.ts` | `DELETE /` | ✅ Built |
| `api/devices/sensors/route.ts` | `POST /` | ✅ Built |
| `api/safety/sos/route.ts` | `POST /` | ✅ Built |
| `api/safety/contacts/route.ts` | `GET, POST /` | ✅ Built |
| `api/safety/contacts/[id]/route.ts` | `PUT, DELETE /` | ✅ Built |
| `api/safety/alerts/route.ts` | `GET /` | ✅ Built |
| `api/notifications/route.ts` | `GET /` | ✅ Built |
| `api/notifications/[id]/read/route.ts` | `PUT /` | ✅ Built |
| `api/notifications/read-all/route.ts` | `PUT /` | ✅ Built |
| `api/notifications/preferences/route.ts` | `GET, PUT /` | ✅ Built |
| `api/insights/route.ts` | `GET /` | ✅ Built |
| `api/insights/daily-summary/route.ts` | `GET /` | ✅ Built |
| `api/insights/[id]/route.ts` | `GET /` | ✅ Built |
| `api/insights/[id]/dismiss/route.ts` | `PUT /` | ✅ Built |
| `api/settings/route.ts` | `GET, PUT /` | ✅ Built |
| `api/agent/chat/route.ts` | `POST /` | ✅ Built |
| `api/agent/insights/route.ts` | `POST /` | ✅ Built |
| `api/agent/analyze-anomaly/route.ts` | `POST /` | ✅ Built |
| `api/agent/compute-baseline/route.ts` | `POST /` | ✅ Built |
| `api/agent/ingest-vital/route.ts` | `POST /` | ✅ Built |

### Design patterns used
- `requireAuth()` from `@/lib/auth-helpers` for authentication
- Prisma (`@hamraz/database`) for database access
- `@hamraz/utils` (`normalizeVitalValue`) for vital normalization
- `@hamraz/ai` services (`ChatService`, `InsightsService`, `AnomalyService`, `BaselineService`, `IngestService`) for AI features
- Consistent `{ data, error }` response format everywhere
- Zod validation on POST/PUT bodies where applicable
- 400 for validation, 401 for unauth, 403 for forbidden, 404 for not found, 503 for AI unavailable

---

## ✅ Phase 6 — Connect Frontend to Real APIs (Complete)

| Page | Target | Status |
|------|--------|--------|
| Dashboard | `GET /api/vitals/latest/all` + `GET /api/insights?limit=1` + `GET /api/notifications?unreadOnly=true` | ✅ |
| Chat | `POST /api/agent/chat` (non-streaming) with conversation persistence | ✅ |
| Vitals | `GET /api/vitals/latest/all` + `GET /api/vitals/history/[metric]` with period selector + metric selector | ✅ |
| SOS | `GET /api/safety/contacts` + `POST /api/safety/sos` with `navigator.geolocation` | ✅ |
| Profile | `GET /api/users/me` + real `supabase.auth.signOut()` + menu links to placeholder pages | ✅ |
| Onboarding | Save to `PUT /api/users/me` on completion + `localStorage` partial save | ✅ |

### Placeholder pages
| Page | Route | Status |
|------|-------|--------|
| Notifications | `/notifications` | ⬜ still placeholder |
| Settings | `/settings` | ⬜ still placeholder |
| Devices | `/devices` | ✅ replaced with real implementation |

---

## ✅ Phase 7 — New Pages (Complete)

| Page | Route | Description | Status |
|------|-------|-------------|--------|
| Health Timeline | `/timeline` | Chronological feed of vitals, anomalies, insights with filter tabs + load more | ✅ |
| Trends | `/trends` | 7d/30d dual-period charts with avg/min/max stats + vs-previous comparison | ✅ |
| Device Connection | `/devices` | List connected devices, add (modal form), disconnect with real API | ✅ |

### New API routes created
| Route | Method | Purpose |
|-------|--------|---------|
| `api/anomalies/route.ts` | GET | List anomaly detections with `?severity=&metric=` filters |
| `api/analytics/route.ts` | GET | Get period-based analytics with `?period=&metric=` filters |

### Other changes
- BottomNav: 4 tabs (Home, Vitals, Trends, Chat)
- Vitals page: "View Health Timeline" link added
- API client: `anomalies.list()` + `analytics.get()` added

---

## ✅ Phase 8 — Vercel Cron Jobs (Complete)

### Architecture
- Queue-based: `processBatch()` with 5 concurrent workers + 200ms stagger (respects Gemini 60 req/min limit)
- Job lock via `CronJob` model (`status: "idle" | "running" | "completed"`) — prevents overlapping runs
- Per-user try/catch — one user failure never blocks others
- AI calls never receive PII — only Prisma `VitalRecord[]` + `Baseline[]` (no name, email, DOB, location)
- All AI calls logged to `audit_logs` (HIPAA/GDPR compliance)
- Filters by `dataCollectionEnabled` — respects user consent

### What was built

| File | Purpose |
|------|---------|
| `packages/database/prisma/schema.prisma` | Added `CronJob` model + `notifiedAt` on `AnomalyDetection` |
| `.../cron/_cron-auth.ts` | Verifies `x-cron-secret` header matches `CRON_SECRET` |
| `.../cron/_cron-queue.ts` | `acquireJobLock()`, `completeJobLock()`, `processBatch()` (5 concurrent, 200ms stagger), `getConsentedUserIds()` |
| `.../cron/daily-summary/route.ts` | Daily at 08:00 — aggregates 24h vitals → AI insight → `DailySummary` + `Notification` |
| `.../cron/weekly-trend/route.ts` | Monday 08:00 — aggregates 7d vitals → AI insight → `AIInsight` (WEEKLY_TREND) + `Notification` |
| `.../cron/anomaly-cleanup/route.ts` | Every 6 hours — finds un-notified anomalies → AI explanation → `Notification` + sets `notifiedAt` |

### Pending (manual — DB unreachable from local network)
| Step | Details |
|------|---------|
| Apply migration | Run `npx prisma migrate dev` from environment with DB access (Vercel deploy will auto-apply) |
| Set env vars | `CRON_SECRET`, `DATABASE_POOL_CONNECTIONS=20` in Vercel Dashboard |

---

## ✅ Phase 9 — CI & Deployment (Complete)

### Tasks completed

| Task | Details |
|------|---------|
| Agent files created | `AGENTS.md`, `SECRETS_REFERENCE.md` (gitignored), `.opencode/instructions.md` |
| `.gitignore` hardened | Added `.vercel`, `__pycache__/`, `.env.production`, `SECRETS_REFERENCE.md`, more |
| Old microservices deleted | `apps/api`, `apps/*-service` (6 Express), `apps/ai-agent-service` (Python) |
| Compiled JS artifacts cleaned | `packages/*/src/` — deleted all `.js`, `.d.ts`, `.js.map`, `.d.ts.map` |
| Legacy scripts deleted | `run_migration.js`, `check_db.js`, `test_db.js`, `start_services.ps1`, `scripts/` |
| Infrastructure files deleted | `docker-compose.yml`, `Dockerfile.*`, `render.yaml`, `init-scripts/` |
| `apps/web/package.json` fixed | Added `@hamraz/*` workspace deps |
| Root `package.json` fixed | Removed broken `dev:api`, `infra:*`, `db:seed` scripts |
| Root `tsconfig.json` fixed | Removed `rootDir` mismatch that blocked `tsc` |
| `ci.yml` upgraded | Added `prisma generate`, fixed build scope, removed prettier swallow |
| `vercel.json` created | Build config + 3 cron schedules (Phase 8-ready) |
| `.env.example` updated | Added `NEXT_PUBLIC_SUPABASE_*`, `CRON_SECRET`, `DATABASE_POOL_CONNECTIONS` |

### Remaining manual steps
| Step | Details |
|------|---------|
| Vercel project | Connect GitHub repo, configure env vars in Dashboard |
| Supabase final config | Verify Google OAuth redirect URIs, enable RLS |

---

## 🔐 Important Keys

| Key | Value | Location |
|-----|-------|----------|
| Supabase URL | `[REDACTED - see .env]` | `.env` |
| Supabase Anon Key | `[REDACTED - see .env]` | `.env` |
| Supabase Service Role Key | `[REDACTED - see .env]` | `.env` |
| Gemini API Key | `[REDACTED - see .env]` | `.env` |
| DB Direct URL | `[REDACTED - see .env]` | `.env` |
| DB Pooler URL | `[REDACTED - see .env]` | `.env` |
| Google OAuth | **Enabled** in Supabase Auth settings | Supabase Dashboard |

### ✅ Phase 9 cleanup
All legacy files with hardcoded DB passwords have been deleted. `.env` is properly gitignored.

---

## 📁 Current Directory Structure

```
Hamraz/
├── .env                          # All keys (DO NOT COMMIT)
├── .env.example
├── .github/workflows/ci.yml      # ✅ Upgraded
├── .gitignore                    # ✅ Hardened
├── .opencode/instructions.md     # ✅ opencode session loader
├── AGENTS.md                     # ✅ Agent command center
├── HAMRAZ_STATUS.md              # THIS FILE — keep updated
├── SECRETS_REFERENCE.md          # ✅ Service map (gitignored, DO NOT COMMIT)
├── vercel.json                   # ✅ Build config + cron schedules
├── package.json                  # ✅ Fixed scripts
├── tsconfig.json                 # ✅ rootDir fixed
├── apps/
│   └── web/                      # ★ Only app — Next.js 16 (Phase 1-7 complete)
│       ├── src/
│       │   ├── app/
│       │   │   ├── api/          # 34 API route handlers [✅]
│       │   │   ├── auth/callback/route.ts
│       │   │   ├── chat/page.tsx
│       │   │   ├── devices/page.tsx
│       │   │   ├── notifications/page.tsx  [⬜ placeholder]
│       │   │   ├── onboarding/page.tsx
│       │   │   ├── profile/page.tsx
│       │   │   ├── settings/page.tsx       [⬜ placeholder]
│       │   │   ├── signin/page.tsx
│       │   │   ├── signup/page.tsx
│       │   │   ├── sos/page.tsx
│       │   │   ├── timeline/page.tsx
│       │   │   ├── trends/page.tsx
│       │   │   ├── vitals/page.tsx
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   ├── lib/
│       │   │   ├── api.ts
│       │   │   ├── auth-helpers.ts
│       │   │   └── supabase.ts
│       │   └── middleware.ts
│       └── package.json         # ✅ @hamraz/* deps added
├── packages/
│   ├── ai/                      # @hamraz/ai — AI agent package
│   ├── config/
│   ├── database/                # Prisma schema + client
│   ├── logger/
│   ├── types/
│   └── utils/
└── node_modules/
```

---

## 🧠 Architecture Decisions (Immutable)

| Decision | Choice | Reason |
|----------|--------|--------|
| Auth | Supabase Auth Only | Free, built-in OAuth + email/password, SSR cookies |
| Database | Supabase PostgreSQL | Free tier 500MB, already set up |
| AI Provider (default) | Gemini Free API | `gemini-2.5-flash`, free, well-supported SDK |
| AI Provider fallback | Smart fallback with 5-min cooldown | Unhealthy providers skipped, auto-recovery |
| AI module | `@hamraz/ai` package | Extractable to separate service later |
| Backend API | Next.js Route Handlers | Single Vercel deployment |
| User profile | `user_profiles` table | Separate from `auth.users`, Prisma-managed |
| Session | Supabase SSR cookies | Secure httpOnly, auto-refresh via middleware |
| Scheduled tasks | Vercel Cron Jobs | Free, serverless |
| Frontend data | API calls from client components | No SSR data fetching for dynamic content |
| UI Framework | Tailwind CSS | Already set up, consistent design system |

---

## 📝 How to Update This File

When a phase or feature is completed, update this file by:

1. Changing the status indicator: `⬜` → `✅` (or `⬜` → `🔧` for in-progress)
2. Updating "Last updated" date at the top
3. Adding the completed items under the appropriate phase section
4. Never remove architecture decisions or important keys

---

## 🏁 Getting Started for a New Agent

This project has been **deployed to production** at https://hamraz-web.vercel.app.

1. **Read this file first** — understand what's built and what's not
2. **Read the `.env` file** — for all keys and configuration (local only)
3. **Read the Prisma schema** (`packages/database/prisma/schema.prisma`) — for the data model
4. **Vercel production URL**: https://hamraz-web.vercel.app
5. **Vercel project**: `hamraz-web` under team `muhammad-uzair-s-projects2`
6. **GitHub repo**: `MuhammadUzair118/hmaraz`

Do NOT:
- Modify the auth system (`auth-helpers.ts`, `supabase.ts`, `middleware.ts`) without updating this file
- Change the database schema without updating this file
- Add telemedicine features back
- Commit `.env` or any file containing secrets

---

## 📋 Production Deployment Log

> **Last updated:** 2026-06-28
> **Commit:** `6a39912` — Fix auth callback: upsert UserProfile after OAuth

### Phase 10 — Vercel Deploy & Go Live

#### Sequence of Events

| # | Step | Who | Details |
|---|------|-----|---------|
| 1 | **Git cleanup** | Agent | Removed all compiled `.js`/`.d.ts`/`.js.map`/`.d.ts.map` artifacts from repo |
| 2 | **`.gitignore` updated** | Agent | Added `*.js.map`, `*.d.ts.map` patterns |
| 3 | **Git push** | Agent | Initial 3 commits: setup, redact keys, agent files |
| 4 | **GitHub Actions cron workflows created** | Agent | 3 `.yml` files: daily-summary (08:00), weekly-trend (Mon 08:00), anomaly-cleanup (every 6h) |
| 5 | **Vercel cron removed** | Agent | Deleted crons section from `vercel.json` (Hobby plan limitation) |
| 6 | **GitHub PAT set up** | User+Agent | Classic PAT with `repo`+`workflow` scope |
| 7 | **First Vercel deploy attempt — FAILED** | User | `next.config.js` compiled artifacts conflict — `__esModule` + `default` keys error |
| 8 | **Compiled JS deleted** | Agent | Removed all 216 compiled files from `apps/web/src/` |
| 9 | **Git push** | Agent | Commit `d242a68` — "Remove compiled JS artifacts" |
| 10 | **Second deploy — FAILED** | User | TypeScript error: `.map()` type inference on `analyze-anomaly/route.ts:32` |
| 11 | **`toVitalMetric()` mapping created** | Agent | Added `packages/ai/src/mapping.ts` — maps Prisma enum to AI VitalMetric |
| 12 | **8 route files updated** | Agent | Replaced `as import('...').VitalMetric` with `toVitalMetric()` calls |
| 13 | **Git push** | Agent | Commit `a82e2bd` — "Add toVitalMetric() mapping function" |
| 14 | **Third deploy — FAILED** | User | Still same `.map()` error — root cause deeper |
| 15 | **Root `tsconfig.json` fixed** | Agent | Changed `module: "commonjs"` → `"esnext"`, `moduleResolution: "node"` → `"bundler"`, added `@hamraz/ai` to `paths` |
| 16 | **`postinstall` added** | Agent | `packages/database/package.json` — `"postinstall": "prisma generate"` |
| 17 | **Explicit type annotations added** | Agent | `VitalRecord[]` + `Baseline[]` on all 8 `.map()` calls |
| 18 | **Git push** | Agent | Commit `d95a2fa` — "Fix TS build" |
| 19 | **Fourth deploy — FAILED** | User | New error: `packages/utils/src/index.ts:9` — conversions type mismatch |
| 20 | **Conversions type fixed** | Agent | Changed `Record<string, Record<string, number>>` → `Record<string, Record<string, number \| ((v: number) => number)>>` |
| 21 | **Git push** | Agent | Commit `4150b8c` — "Fix conversions type annotation" |
| 22 | **Fifth deploy — FAILED** | User | Runtime error on `/signin/page` — `NEXT_PUBLIC_SUPABASE_URL` empty during build |
| 23 | **Vercel env vars added (2)** | User+Agent | User added `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` via Dashboard |
| 24 | **Sixth deploy — FAILED** | User | Same Supabase error — env vars not picked up (Dashboard page error) |
| 25 | **Vercel CLI installed** | Agent | `npm install -g vercel` |
| 26 | **Vercel authenticated** | User+Agent | User clicked Allow 3x; token `vcp_8jX4...` generated |
| 27 | **Project linked** | Agent | `vercel link --project hmaraz-web` |
| 28 | **All env vars added via CLI** | Agent | 7 vars total: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `GEMINI_API_KEY`, `CRON_SECRET`, `DATABASE_POOL_CONNECTIONS` |
| 29 | **Seventh deploy — SUCCESS** | Agent | Build passed, TypeScript clean, 49/49 pages generated |
| 30 | **Production URL** | Auto | `https://hmaraz-web.vercel.app` |
| 31 | **Prisma migration** | Agent | `npx prisma migrate deploy` — "No pending migrations" (already applied) |
| 32 | **Supabase OAuth redirect added** | User | Added `https://hmaraz-web.vercel.app/auth/callback` |
| 33 | **GitHub secrets added (4)** | User | `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `CRON_SECRET`, `VERCEL_DEPLOYMENT_URL` |
| 34 | **Google sign-in — FAILED** | User | Redirected to `localhost` — Supabase Site URL still set to localhost |
| 35 | **Supabase Site URL fixed** | User | Changed to `https://hmaraz-web.vercel.app` |
| 36 | **Auth callback fixed** | Agent | Added `UserProfile` upsert after `exchangeCodeForSession` — creates Prisma profile on first Google OAuth login |
| 37 | **`SUPABASE_SERVICE_ROLE_KEY` added** | Agent | Added to Vercel production env via CLI |
| 38 | **Git push** | Agent | Commit `6a39912` — "Fix auth callback: upsert UserProfile after OAuth" |
| 39 | **Eighth deploy — SUCCESS** | Agent | Build passed, 49/49 pages, all env vars configured |
| 40 | **Project renamed** | Agent | `hmaraz-web` → `hamraz-web` (misspelling fix) |
| 41 | **New domain added** | Agent | `hamraz-web.vercel.app` via Vercel API |
| 42 | **Ninth deploy — SUCCESS** | Agent | Aliased to `https://hamraz-web.vercel.app` |
| 43 | **Supabase redirects updated** | User | Changed to `hamraz-web.vercel.app` |

#### Vercel Env Vars Configured

| Variable | Source | Environment |
|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env` line 40 | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env` line 41 | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` line 6 | Production |
| `DATABASE_URL` | `.env` line 9 | Production |
| `DIRECT_URL` | `.env` line 10 | Production |
| `GEMINI_API_KEY` | `.env` line 24 | Production |
| `CRON_SECRET` | `Hamraz24864@` | Production |
| `DATABASE_POOL_CONNECTIONS` | `20` | Production |

#### GitHub Secrets Configured

| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | `vcp_8jX4...` |
| `VERCEL_ORG_ID` | `team_K6El4p7Cj8oU5ICqjyvXZpoR` |
| `VERCEL_PROJECT_ID` | `prj_6hp8Pin9Fd0A9Kw4PUMtKOujhUg8` |
| `CRON_SECRET` | `Hamraz24864@` |
| `VERCEL_DEPLOYMENT_URL` | `https://hmaraz-web.vercel.app` → needs update to `https://hamraz-web.vercel.app` |

#### Known Issues (Non-Blocking)

| Issue | Status | Notes |
|-------|--------|-------|
| `middleware.ts` deprecation | ✅ Fixed | Renamed to `proxy.ts`, export `proxy` instead of `middleware` |
| `VERCEL_DEPLOYMENT_URL` GitHub secret | ⬜ Needs update | Still points to `hmaraz-web.vercel.app` — update to `hamraz-web.vercel.app` |
| GitHub Actions cron | ⬜ Not tested | Workflows created but need trigger verification |
| Google OAuth end-to-end | ✅ Tested | Working — direct login without password |
| Email/password signup | ⬜ Not tested | `SUPABASE_SERVICE_ROLE_KEY` now set |
| `/notifications` page | ✅ Built | Real UI with All/Unread filter, mark read, mark all read |
| `/settings` page | ✅ Built | Real UI with theme, units, AI provider, data privacy, sync toggles |
