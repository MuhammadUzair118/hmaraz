# Hamraz — Agent Command Center

## Startup (auto-read on session init)
Before any task, read `.opencode/constitution.md` then `HAMRAZ_STATUS.md`. These give you the non-negotiable rules and project status.

## Identity
AI-powered Personal Health Intelligence Platform. Not telemedicine.

## Quick Navigation
| File | Purpose |
|------|---------|
| `HAMRAZ_STATUS.md` | Current phase, what's done, what's next |
| `.env` | All keys and config (gitignored) |
| `SECRETS_REFERENCE.md` | Service dependency map, key metadata (gitignored) |
| `packages/database/prisma/schema.prisma` | Data model |
| `apps/web/src/lib/api.ts` | Typed API client |
| `apps/web/src/lib/auth-helpers.ts` | `requireAuth()` pattern |
| `packages/ai/src/services/insights.ts` | AI insight generation |
| `.opencode/playbook.md` | 10 prompt playbook (build, audit, debug, etc.) |
| `.opencode/constitution.md` | Agent Constitution — must-read first every session |
| `AGENTS.md § Prompt Playbook` | Quick-reference index of all prompts |

## Phase Awareness
- **Current phase:** see HAMRAZ_STATUS.md
- Do not start next phase until current phase is complete
- Before modifying anything, check HAMRAZ_STATUS.md for preconditions

## Delegation Rule (for every task)

Before any phase or step:
1. **I clarify** — "I can do this for you" or "You need to do this"
2. **If I need info** — I ask for it explicitly (tokens, URLs, credentials)
3. **If I can do it** — I execute without asking further
4. **If impossible** — I assign it to you with clear copy-paste instructions
5. **Never stuck** — I always end with a clear next action (mine or yours)

| Scenario | I do | You do |
|----------|------|--------|
| Write code, create files, edit configs | ✅ Execute | — |
| Push to GitHub (when I have auth) | ✅ Execute | — |
| Need a token/credential | ❌ Ask you | ✅ Provide via chat |
| Create repo on GitHub, Vercel project | ❌ Assign | ✅ Follow browser steps |
| Run commands in terminal | ✅ Execute | — |
| Something unclear | ❌ Stop and ask | ✅ Decide |

## Immutable Architecture Decisions
| Area | Choice | Why |
|------|--------|-----|
| Auth | Supabase Auth Only | Free, OAuth + email/password, SSR cookies |
| Database | Supabase PostgreSQL + Prisma | Free 500MB, type-safe queries |
| AI (default) | Gemini Free (`gemini-2.5-flash`) | Free, well-supported SDK |
| AI fallback | Smart failover, 5-min cooldown | Auto-recovery |
| Backend | Next.js Route Handlers | Single Vercel deploy |
| Scheduled tasks | Vercel Cron Jobs | Free, serverless |
| Frontend data | Client-side API calls | No SSR for dynamic content |

## Security Rules (NEVER Violate)
1. **Never send PII to AI** — only aggregated stats (avg, min, max) + baselines + goals
2. **Never commit `.env` or any file with credentials**
3. **Never expose internal errors** to the client — return `{ data, error }` consistently
4. **Always log AI calls** to `audit_logs` (HIPAA/GDPR compliance)
5. **Respect `userSettings.dataCollectionEnabled`** — skip users who opted out

## Code Conventions
- **No comments in code** — code should be self-documenting
- `file:line` notation when referencing code (e.g., `src/auth.ts:42`)
- Batch independent tool calls in parallel
- Use `grep` to locate functions, not sequential `read` calls
- Response format: always `{ data, error }` on API routes
- Notifications: always `{ id, userId, type, title, body, read, createdAt }`

## Error Recovery Playbooks

### Prisma client error
Run `npx prisma generate` (client out of sync with schema)

### TypeScript error in `.next/types/`
Skip it — auto-generated, references deleted pages

### AI call fails
Log to `audit_logs`, continue batch, don't block

### Vercel deploy fails
Check build logs — verify env vars are set in Vercel Dashboard

### Migration error
Check `DATABASE_URL` and `DIRECT_URL` are correct

## Trigger Map
| User says | Agent action |
|-----------|-------------|
| "audit" or "code review" | Reverse-engineer architecture, find flaws (quick). Use Prompt 02 for full audit. |
| "optimize" | Run typecheck + lint + build (quick). Use Prompt 04 for deep perf audit. |
| "debug" or "bug" | Trace root cause of failure. Use Prompt 03 for deep investigation. |
| "plan" or "architect" | Challenge assumptions, design architecture first. Use Prompt 08 as tech lead. |
| "deploy" | Verify CI passes, check env vars, confirm Vercel project. Use Prompt 10 for full DevOps. |
| "security audit" | Scan hardcoded keys, review PII (quick). Use Prompt 09 for full OWASP audit. |
| "test" | Run `npm test` across workspaces |
| "migrate" | Run `prisma migrate dev`, verify schema changes |
| "status" | Read and summarize HAMRAZ_STATUS.md |

## Prompt Playbook

Full prompts available in `.opencode/playbook.md`

| # | Role | When to Use |
|---|------|-------------|
| 01 | Startup MVP Builder | Starting a new project from zero |
| 02 | Senior Codebase Auditor | Deep audit of existing code |
| 03 | Production Debugging Monster | Investigating bugs |
| 04 | Performance Optimization Engineer | Speed/memory/scalability optimization |
| 05 | Clean Architecture Rebuilder | Transforming messy code into clean architecture |
| 06 | Startup Backend Architect | Designing production-grade backend |
| 07 | Senior Frontend Engineer | Creating accessible, scalable UI components |
| 08 | AI Technical Lead | Start of any new feature — plan before coding |
| 09 | Production Security Auditor | Security audit before deployment |
| 10 | Senior DevOps & Deployment Engineer | Preparing for production deployment |

---

## Context Budget
- Do not read entire files when a grep will do
- When exploring, prefer sub-agents for multi-step searches
- Keep agent context focused on the current phase's files

## What NOT to Do
- Do not create `.md` documentation unless the user explicitly asks
- Do not add explanatory comments to code
- Do not modify `node_modules/`, `.next/`, `dist/`, `build/`
- Do not change DB schema without first generating Prisma migration
- Do not add telemedicine features back
- Do not commit credential files
- Do not run migrations on production without user confirmation
