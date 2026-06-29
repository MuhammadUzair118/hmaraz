# Agent Constitution

Non-negotiable rules for every planning and building session. These apply before and during all work.

## Priority Rules (resolve conflicts in this order)

1. User explicitly saying "skip rules" or "quick fix" overrides everything below
2. "NEVER" rules always win over "SHOULD" rules
3. Later sections override earlier sections
4. If a rule would block a trivial task (1-3 file changes), use Light Mode

## Light Mode

When user says "quick fix", "just do it", "rename", "typo", or task is 1-3 file changes:
- Skip Planning Phase rules (P1-P7)
- Skip Output Format rules (O1-O6) — still show file paths
- Still enforce Security rules (S1-S8) and production quality (B1-B3, B5-B6)

---

## Section 1 — Planning Phase

| # | Type | Rule | Why |
|---|------|------|-----|
| P1 | MUST | Never assume requirements — ask clarifying questions | Wrong assumptions = wasted code |
| P2 | MUST | Output a written plan before any code | Forces alignment before irreversible decisions |
| P3 | MUST | Define the file structure upfront | Prevents messy reorganization later |
| P4 | MUST | Identify all data models and relationships first | Schema changes are expensive after code is written |
| P5 | MUST | List all API endpoints with request/response shape | Prevents frontend/backend contract mismatches |
| P6 | MUST | Identify all external dependencies before starting | Avoids mid-build dependency conflicts |
| P7 | NEVER | Start coding without a confirmed plan | Unplanned code creates technical debt immediately |
| P8 | NEVER | Assume the simplest happy path will be sufficient | Production systems require edge case handling |
| P9 | SHOULD | Flag any architectural risks before building | Early risk identification saves hours of debugging |
| P10 | SHOULD | Suggest better approaches if a superior one exists | The agent is a tech lead, not just a code executor |

## Section 2 — Building Phase

| # | Type | Rule | Why |
|---|------|------|-----|
| B1 | MUST | Write production-ready code, not demo code | Every output must be deployable without rewriting |
| B2 | MUST | Handle all error states explicitly | Silent failures are the hardest bugs to debug |
| B3 | MUST | Add loading, empty, and error states to UI | Users encounter all three — ignoring any breaks UX |
| B4 | MUST | Follow separation of concerns strictly | Mixed concerns = unmaintainable code within weeks |
| B5 | MUST | Use environment variables for all secrets | Hardcoded secrets are a critical security vulnerability |
| B6 | MUST | Validate all inputs — client and server side | Never trust any user input, ever |
| B7 | MUST | Write self-documenting code with clear naming | Code is read 10x more than it is written |
| B8 | NEVER | Use console.log for production error handling | Logs get lost; use structured logging instead |
| B9 | NEVER | Hardcode credentials, URLs, or magic numbers | Makes the codebase brittle and insecure |
| B10 | NEVER | Create duplicate logic in multiple places | DRY principle — one source of truth for each concept |
| B11 | NEVER | Build without considering the mobile/responsive case | Most users are on mobile — responsive is not optional |
| B12 | NEVER | Skip input validation to ship faster | Skipped validation is unacceptable technical debt |
| B13 | NEVER | Add comments to code — code should be self-documenting | Comments rot; let clear naming speak |
| B14 | SHOULD | Build components to be reusable by default | Reusability dramatically speeds up future work |
| B15 | SHOULD | Consider the N+1 query problem in every data fetch | Unnoticed N+1 queries destroy performance at scale |

## Section 3 — Security Rules

| # | Type | Rule | Why |
|---|------|------|-----|
| S1 | MUST | Always use parameterized queries — never string concat SQL | SQL injection is still the #1 exploited vulnerability |
| S2 | MUST | Hash passwords with bcrypt or argon2 — never MD5/SHA1 | Weak hashing = instant credential exposure if breached |
| S3 | MUST | Implement rate limiting on all API endpoints | Brute-force attacks are trivial without rate limits |
| S4 | MUST | Validate and sanitize all user-controlled inputs server-side | Client-side validation can always be bypassed |
| S5 | MUST | Use HTTPS only — never serve sensitive data over HTTP | HTTP traffic is trivially interceptable |
| S6 | NEVER | Store JWT tokens in localStorage | localStorage is XSS-accessible; use httpOnly cookies |
| S7 | NEVER | Expose stack traces or internal errors to API responses | Stack traces reveal exploitable system internals |
| S8 | NEVER | Implement authentication logic from scratch | Use proven libraries — auth bugs are catastrophic |

## Section 4 — Agent Output Format

| # | Type | Rule | Why |
|---|------|------|-----|
| O1 | MUST | Show the file path above every code block | Developer needs to know exactly where to place the file |
| O2 | MUST | Explain every architectural decision made | Blind code copy-paste creates confusion and bugs |
| O3 | MUST | Flag any TODO items or incomplete sections explicitly | Hidden gaps cause production failures |
| O4 | MUST | List all required environment variables | Missing env vars are a common deployment failure point |
| O5 | NEVER | Output partial code without indicating what is missing | Partial code blocks are dangerous when copy-pasted |
| O6 | NEVER | Skip explaining tradeoffs when making major decisions | The developer must understand the why to maintain the code |

## Learned Rules (added from experience)

| # | Rule | Why |
|---|------|-----|
| L1 | When `tsc` errors show `noUncheckedIndexedAccess` violations on array access, use `array[i]!` — the index is always valid when protected by length checks | Array index access returns `T \| undefined` with strict null checks; non-null assertion is the correct fix when logic guarantees existence |
| L2 | When `tsc` shows `json is unknown` on `response.json()`, type as `Record<string, unknown>` and cast nested properties | API responses have no static types; `unknown` forces explicit typing which prevents silent `any` propagation |
| L3 | Next.js `.next/types/` errors referencing deleted pages are false positives — skip them | Auto-generated files don't auto-clean on page deletion |
| L4 | Corrupted `node_modules/next/dist/compiled/` breaks local typecheck — don't debug code for this; deploy on Vercel to verify | Node.js env differences can corrupt compiled deps; Vercel build is the source of truth |
| L5 | When local Next.js install is missing type declarations (e.g., `navigation.d.ts`), create a local `*.d.ts` override file that declares the module with the expected exports | TypeScript respects local declarations; Vercel ignores them and uses its own complete Next.js build |
| L6 | When anomaly severity values cross system boundaries (AI → API → Prisma), ensure all layers use matching enum strings. Fix at the source (`'medium'` → `'moderate'` in the AnomalyService) rather than patching individual consumers | Prisma enum has `MODERATE` not `MEDIUM`; fixing the root type propagates cleanly through `toUpperCase()` mappings everywhere |
| L7 | For real-time anomaly notification, create Notification records **during ingestion** (immediate), not only during cron jobs (6h delay). Filter by severity (`moderate`/`high`) to avoid noise | Users need instant feedback on important anomalies; low-severity can batch |

**After reading this, read `AGENTS.md` for project-specific rules.**

---

## Quick Reference Summary

**Plan first. Build for production. Secure everything. Explain every decision. Never leave gaps silently.**

These rules exist because vibe coding without discipline produces demos, not products. The agent's job is to help build things that actually work in the real world.
