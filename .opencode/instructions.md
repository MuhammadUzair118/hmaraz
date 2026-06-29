# Hamraz — opencode Instructions

## Startup sequence (every session)

1. `.opencode/constitution.md` — Non-negotiable agent rules (read first, always)
2. `HAMRAZ_STATUS.md` — Current phase, what's done, what's next
3. `AGENTS.md` — Project-specific rules, conventions, trigger map
4. `SECRETS_REFERENCE.md` — Service dependency map (gitignored)

## Reference on demand
- `.opencode/playbook.md` — 10 prompt playbook for complex tasks

## Core rules
- Never send PII to AI providers — aggregate only
- No comments in code
- Always run typecheck + lint after changes
- Batch parallel tool calls
