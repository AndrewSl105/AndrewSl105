## Andrii Slipchenko

**Product engineer.** Full-stack, system design, agentic development.

I've spent seven years taking web products from zero to one: scoping the first version, designing the system, writing both sides, and reading the analytics after release. Today AI agents write most of my code. They work inside the specs, contracts and test gates I set up, and I build the orchestrators that run them.

Kyiv, Ukraine · remote · open to senior product, full-stack and AI engineering roles, full-time or contract.

[andrii.tech](https://andrii.tech) · [LinkedIn](https://www.linkedin.com/in/andrii-s-284690117/) · a.slipchenko@pm.me

---

### What I'm building

**[FleetPocket](https://github.com/AndrewSl105/fleetpocket)** is a self-hosted orchestrator that runs Claude Code and Codex against your GitHub repositories from your phone.
- You describe a change in Telegram. The agent works in an isolated container with no credentials, and you get a pull request back.
- It is written in Go and TypeScript and is restart-safe, with an OpenAPI contract enforced in CI.
- Eight of its merged pull requests were opened by its own agent.

**[Radar Verdict](https://radarverdict.com)** is B2B pre-purchase intelligence for importers and sourcing teams.
- Paste a product link and get a risk verdict a compliance team can defend.
- It is built on immutable evidence snapshots, a pipeline of composable analysis blocks, RAG over pgvector, and credit billing on an append-only ledger.

**[Vatary Desk](https://vatarydesk.com)** is one workspace for pages, tables, boards, files and diagrams, with an AI that works on them.
- Five services in TypeScript, Go and Python, connected by protobuf contracts.
- A Go gateway for every model call, with fallbacks and per-call cost.
- 1,178 test files.

### How I ship with agents

```
spec → decompose along contracts → isolated agents → tests and CI gates → small reviewed PRs → metrics
                                                                                                 ↓
                                                                                  what I learn feeds the next spec
```

I own the spec, the decomposition and the checks. Agents do the typing.

### Experience

| | |
|---|---|
| **Radar Verdict** · Product engineer | Dec 2025 – now |
| **Vatary Desk** · Founder | now |
| **Raccoon Gang** · Software engineer | Aug 2023 – Dec 2025 |
| **Aimprosoft** · Software engineer | Nov 2019 – Aug 2023 |

At Raccoon Gang I rewrote a legacy database schema and shipped a zero-downtime migration that cut feature development cost about 4×. At Aimprosoft I shipped a Slack-style real-time chat product.

### Stack

- **Core:** TypeScript · React · Node / NestJS · PostgreSQL
- **Regular:** Go · Next.js · Prisma · Docker · Python
- **Earlier work:** Ruby on Rails · Angular
- **AI and agents:** Claude Code · Claude Agent SDK · Codex · MCP · OpenAI / Anthropic SDKs · RAG (pgvector)
