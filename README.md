## Andrii Slipchenko

Full-stack engineer building production AI systems for compliance and supplier risk. 6+ years on Ruby on Rails, now on TypeScript / NestJS. Currently architecting **[Radar](https://radarverdict.com)** — a B2B SaaS that catches supplier and product risks for importers before they cost money.

Based in Kyiv 🇺🇦. Open to **senior / staff engineering roles**, full-time or contract, in AI-heavy B2B SaaS.

---

### Currently building — Radar Verdict

A multi-tenant compliance platform. Paste a product URL → category detection → risk pack → verdict (Go / Review / Fail) with a full evidence trail you can hand to an auditor.

What that involved designing end-to-end:

- **Multi-tenant from day one.** Global vs team-scoped content (taxonomies, risk packs, categories) with audience filtering by domain / region / plan tier / team allowlist. Tenants can fork platform-owned content into their own taxonomy with version-pinned lineage — drift is detected, not auto-merged.
- **Tamper-evident evidence trail.** Hash-chained snapshot history (`prevHash` → `hash`), per-snapshot deltas with significance scoring, immutable layout snapshots captured at analysis time so reports survive template edits.
- **Block-based analysis engine.** Composable `PROMPT / TABLE / SCORECARD / DECISION / SIMULATOR` blocks with progressive hydration, dependency-aware short-circuit (`SKIPPED` when a parent risk key is missing), and per-block retry with backoff. Every prompt and response captured as `llmInput` for replay and debugging.
- **Idempotency + optimistic concurrency.** SHA-256 idempotency keys on analysis submission (5-minute dedup window). `version` column on every mutable entity. The credit ledger has a unique constraint on `(subscription, period, reason)` so a Paddle webhook retry can't double-grant — the kind of bug you only fix after it bites you in production, designed in upfront.
- **RAG over pgvector.** Embedding layer across snapshots, risk keys, suppliers, categories, work items. Status lifecycle (`PENDING / READY / STALE`), provider-agnostic (OpenAI + Anthropic), bounded by a `provider × model × dim` triple instead of free-form JSON.
- **Real billing surface.** Paddle integration with plan catalog, plan snapshots at assignment time (price/features/limits frozen so historical state survives catalog edits), credit buckets (`ALLOWANCE / PURCHASED / ADJUSTMENT`), trials, scheduled plan changes, refund tracking.
- **Workflow primitives.** Process templates → work items → evidence slots → decisions with voting, kanban columns, external integration links (Jira / Trello / Slack / Notion / Sheets) with sync state per provider.
- **i18n that doesn't lie to the LLM.** Canonical text columns stay authoritative for analysis; `*I18n` JSON overlays serve the UI with locale fallback. The model never sees a translated risk definition by accident.

### Stack

- **Backend** — TypeScript · NestJS · Prisma · PostgreSQL + pgvector · Better Auth · OpenAI / Anthropic SDKs · Paddle · Cloudflare R2
- **Frontend** — Next.js · React · Tailwind · Angular (legacy)
- **Previous** — Ruby on Rails (6+ years on production systems)
- **Cross-cutting** — background job queues, webhook deduplication, soft-delete + audit log on every entity, optimistic concurrency, idempotent mutations

### How I work

I design schemas like the system has to live for five years, not five months. Auditability, idempotency, tenant isolation, and webhook safety are not v2 features — they are cheap on day one and brutally expensive after the first incident.

I prefer narrow, well-typed contracts over flexible JSON. When flexibility is required (block configs, embedding vectors, plan limits), it's bounded by a schema, not free-form.

I instrument the LLM layer like any other dependency. Every prompt + response is captured. Costs, retries, and confidence flow through the same observability path as the rest of the stack.

### Reach me

- LinkedIn — [andrii-s-284690117](https://www.linkedin.com/in/andrii-s-284690117/)
- Radar — [radarverdict.com](https://radarverdict.com)
