# Hamraz — Agent Command Center

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

## Phase Awareness
- **Current phase:** see HAMRAZ_STATUS.md
- Do not start next phase until current phase is complete
- Before modifying anything, check HAMRAZ_STATUS.md for preconditions

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
| "optimize" | Run typecheck + lint + build, check for dead code |
| "deploy" | Verify CI passes, check env vars, confirm Vercel project |
| "security audit" | Scan for hardcoded keys, review PII handling in AI calls |
| "test" | Run `npm test` across workspaces |
| "migrate" | Run `prisma migrate dev`, verify schema changes |
| "status" | Read and summarize HAMRAZ_STATUS.md |

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
