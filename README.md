## Andrii Slipchenko

Full-stack engineer building production AI systems. 6+ years on Ruby on Rails, now on TypeScript / NestJS. I design schemas like systems have to live for five years, not five months — auditability, idempotency, tenant isolation, and webhook safety on day one, not v2.

Based in Kyiv 🇺🇦. Open to **mid to senior**, full-time or contract.

---

### 🎯 Currently building — Radar Verdict

A multi-tenant compliance platform for importers and procurement teams. Paste a product URL → category detection → risk pack → verdict (Go / Review / Fail) with a tamper-evident evidence trail you can hand to an auditor.

**Live:** [radarverdict.com](https://radarverdict.com)

- **Multi-tenant content layer.** Global vs team-scoped taxonomies, risk packs, and categories with audience filtering by domain / region / plan tier / team allowlist. Tenants can fork platform-owned content into their private taxonomy with version-pinned lineage — drift is detected, not auto-merged.
- **Tamper-evident evidence trail.** Hash-chained snapshot history (`prevHash → hash`), per-snapshot deltas with significance scoring, immutable layout snapshots captured at analysis time so reports survive template edits.
- **Block-based analysis engine.** Composable PROMPT / TABLE / SCORECARD / DECISION / SIMULATOR blocks with progressive hydration, dependency-aware short-circuit (`SKIPPED` when a parent risk key is missing), per-block retry with backoff. Every prompt + response captured as `llmInput` for replay.
- **Idempotency that actually holds.** SHA-256 idempotency keys on analysis submission with 5-minute dedup window. Credit ledger has a unique constraint on `(subscription, period, reason)` so a Paddle webhook retry can't double-grant — the kind of bug you only fix after it bites you in production, designed in upfront.
- **RAG over pgvector.** Embedding layer across snapshots, risk keys, suppliers, categories, work items. Provider-agnostic (OpenAI + Anthropic), bounded by `provider × model × dim` instead of free-form JSON.
- **Real billing surface.** Paddle integration with plan catalog, plan snapshots at assignment time (price/features/limits frozen so historical state survives catalog edits), credit buckets, trials, scheduled plan changes, refund tracking.
- **Workflow primitives.** Process templates → work items → evidence slots → decisions with voting, kanban columns, external integration links (Jira / Trello / Slack / Notion / Sheets) with per-provider sync state.

### 🎬 Also building — KinoGodzilla

A consumer media-discovery platform with a Telegram-first UX. The sandbox for parts of product engineering B2B work doesn't usually let you touch: agent infrastructure, social graph, real engagement signals, conversational AI.

- **Custom scraper / agent engine.** Parent-child run tree with discovered-link state machine (`DISCOVERED → QUEUED → RUNNING → SUCCESS / FAILED / DUPLICATE`), depth-limited crawling, dedupe at run-item and link levels, per-run console with leveled logs. Selectors and field mappings configurable per agent + per scope (list / detail / shared) without code changes.
- **Content draft pipeline.** Scraped → mapped → translated (per-locale provenance: provider, model, source locale) → reviewed → applied to live content. Translation status tracked per draft × locale, never silently overwriting canonical text.
- **Telegram-first auth.** Provider-agnostic sessions (Telegram / web / guest) with cross-device login challenges (QR-style approve-from-phone flow), guest-to-user conversion that preserves history, refresh + access token hashes with separate expiries.
- **Telegram Stars billing.** Full payment lifecycle (PENDING / PAID / FAILED / REFUNDED / EXPIRED), invoice payload uniqueness, charge ID tracking from both Telegram and provider sides, referral conversion pipeline with reward-on-qualification.
- **Engagement signals that don't lie.** WatchSession tracks `activeSeconds`, `pageVisibleSeconds`, and `tabFocusedSeconds` as separate counters — distinguishing "tab in background" from "tab focused but idle" from "user actually interacting." The kind of distinction you wish you'd made before launching, not after.
- **Conversational AI with intent extraction.** Bot conversations classified into typed intents (`NOTIFY_WHEN_AVAILABLE` / `FIND_SIMILAR` / `RECOMMEND_FOR_TONIGHT` / `ORDER_CONTENT` / …) with confidence scores. AI orchestration log captures tokens, latency, cost, and tool-call rounds per request — the LLM is treated as a dependency with the same observability as the rest of the stack.
- **Privacy as a first-class scope.** Per-feature privacy settings (watch history, watchlist, reactions, reviews, boards, profile) with PRIVATE / FRIENDS / PUBLIC scopes evaluated at query time. Friend graph with bidirectional state machine. Activity feed denormalized per viewer for fan-out-on-write.

---

### Stack

- **Backend** — TypeScript · NestJS · Prisma · PostgreSQL + pgvector · Better Auth · OpenAI / Anthropic SDKs · Paddle · Telegram Bot API · Playwright · Cloudflare R2
- **Frontend** — Next.js · React · Tailwind · Angular (legacy)
- **Previous** — Ruby on Rails (6+ years on production systems)
- **Cross-cutting** — background job queues, webhook deduplication, soft-delete + audit log on every entity, optimistic concurrency, idempotent mutations, per-tenant isolation

### How I work

I design schemas like the system has to live for five years, not five months. Auditability, idempotency, tenant isolation, and webhook safety are not v2 features — they are cheap on day one and brutally expensive after the first incident.

I prefer narrow, well-typed contracts over flexible JSON. When flexibility is required — block configs, embedding vectors, plan limits, scraper selectors — it's bounded by a schema, not free-form.

I instrument the LLM layer like any other dependency. Every prompt + response, every token, every retry flows through the same observability path as the rest of the stack.

### Reach me

- LinkedIn — [andrii-s-284690117](https://www.linkedin.com/in/andrii-s-284690117/)
- Radar — [radarverdict.com](https://radarverdict.com)
