## Andrii Slipchenko

Full-stack engineer building production AI systems. 6+ years on Ruby on Rails, now on TypeScript / NestJS. I design schemas like systems have to live for five years, not five months — auditability, idempotency, tenant isolation, and webhook safety on day one, not v2.

Based in Kyiv 🇺🇦. Open to **mid to seniour engineering roles**, full-time or contract.

---

### What I build well

**Multi-tenant systems with real isolation.** Global vs tenant-scoped content layers, audience filtering by domain / region / plan tier / allowlist, fork-with-lineage instead of copy-on-write. Tenant boundaries enforced at query time, not as an afterthought.

**LLM systems treated as production dependencies.** RAG over pgvector, provider-agnostic SDK layers (OpenAI / Anthropic) bounded by `provider × model × dim` instead of free-form JSON. Every prompt + response captured for replay. Tokens, latency, cost, and tool-call rounds flow through the same observability path as the rest of the stack.

**Block-based / pipeline architectures.** Composable units (analysis blocks, scraper steps, draft → translate → review → apply pipelines) with progressive hydration, dependency-aware short-circuit, per-unit retry with backoff, and immutable layout snapshots so historical output survives template edits.

**Idempotency that actually holds.** SHA-256 idempotency keys with dedup windows. Unique constraints on `(subscription, period, reason)` so a webhook retry can't double-grant credits. The kind of bug you only fix after it bites you in production — designed in upfront.

**Tamper-evident audit trails.** Hash-chained event logs (`prevHash → hash`), per-entity deltas with significance scoring, soft-delete + audit log on every mutable entity, optimistic concurrency via `version` columns.

**Real billing surfaces.** Paddle (B2B SaaS) and Telegram Stars (consumer) lifecycles end-to-end: plan catalogs with snapshots at assignment time so historical state survives catalog edits, credit buckets, trials, scheduled plan changes, refunds. Invoice payload uniqueness, charge IDs tracked from both provider sides.

**Auth + session models for messy real-world flows.** Provider-agnostic sessions (web / Telegram / guest), cross-device login challenges (QR-style approve-from-phone), guest-to-user conversion that preserves history, refresh + access token hashes with separate expiries.

**Engagement signals that don't lie.** Watch sessions split into `activeSeconds` / `pageVisibleSeconds` / `tabFocusedSeconds` as separate counters — distinguishing "tab in background" from "tab focused but idle" from "user actually interacting." The distinction you wish you'd made before launching, not after.

**Privacy as a first-class scope.** Per-feature visibility (history / activity / reactions / profile) with PRIVATE / FRIENDS / PUBLIC evaluated at query time, not bolted on. GDPR-mature data modeling.

**Custom agent / scraper infrastructure.** Parent-child run trees with discovered-link state machines, depth-limited crawling, dedupe at multiple levels, configurable selectors and field mappings per scope without code changes.

### Stack

- **Backend** — TypeScript · NestJS · Prisma · PostgreSQL + pgvector · Better Auth · OpenAI / Anthropic SDKs · Paddle · Telegram Bot API · Playwright · Cloudflare R2
- **Frontend** — Next.js · React · Tailwind · Angular (legacy)
- **Previous** — Ruby on Rails (6+ years on production systems)

### How I work

I prefer narrow, well-typed contracts over flexible JSON. When flexibility is required — block configs, embedding vectors, plan limits, scraper selectors — it's bounded by a schema, not free-form.

I write migrations like they're permanent. I add the unique constraint before the bug, not after. I assume webhooks will retry, jobs will run twice, and clients will replay requests — and design accordingly.

### Where this shows up

Most of the patterns above come from **[Radar Verdict](https://radarverdict.com)** — a multi-tenant B2B SaaS for compliance and supplier risk, currently my main focus. Consumer-side patterns (Telegram auth, Stars billing, agent infra, watch-session signals) come from a separate platform.

### Reach me

- LinkedIn — [andrii-s-284690117](https://www.linkedin.com/in/andrii-s-284690117/)
- Radar — [radarverdict.com](https://radarverdict.com)
