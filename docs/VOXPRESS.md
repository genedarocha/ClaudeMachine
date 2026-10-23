# VoxPress Creative Factory v2 — what was built, and what the full spec needs

The VoxPress v2 master specification describes a **standalone production platform** (PostgreSQL + FastAPI + Celery workers, a monorepo, object storage, a marketplace, multi-agent orchestration, 150+ automated tests, CI/CD, admin dashboards). Claude Machine is a **browser-only React/Vite app with no backend**, so it cannot *be* that platform. The full build is a separate Voxstar project.

What is built here is the **client-side creative core** of the spec: the part that turns an idea or a document into a structured creative work, running on your own AI key, in staged steps you approve.

## Built now (works today, in the app)

The **VoxPress Creative Factory v2** sidebar screen:

- **Three modes** (spec §4, §8–11): **Create** (from an idea), **Transform** (improve your document), **Adapt** (your work into another format).
- **Formats** (spec §4): non-fiction/how-to book, novel, children's book, film/short screenplay, TV pilot, stage play, audio drama/podcast, course/workbook — each with the right output format (screenplay slug lines, stage directions, audio SFX cues, lesson structure).
- **Staged pipeline with human approval** (spec §3, §42, §108): Brief → Concept → **Story Bible** (the source of truth, spec §5–6) → Outline → **Draft** (each chapter/scene generated on its own, spec §20) → **Editorial review** (spec §21) → Export. Nothing advances until you run and approve each stage.
- **Rights gate** (spec §24): Transform/Adapt require you to confirm you own or are licensed for the source. No imitation of living authors; genres/styles only.
- **Honesty rules** (spec §91, §107, §109): drafts are labelled AI-assisted (not production-ready); no fabricated sources (facts needing checks are marked `[CHECK: …]`); no fake percentage scores; editorial review is specific, not flattery.
- **Export** (spec §68): full manuscript as Markdown (open in Word/Docs/Scrivener), and a portable `.voxpress.json` project file (spec §69).
- **AI provider abstraction** (spec §56): runs on Claude, Gemini, ChatGPT or Grok via the app's existing layer. Optional humanizer pass on drafts.
- Projects are stored in your browser (localStorage), like the rest of this app.

## Not built here — needs the separate backend platform

These require a server, a database and object storage, which this browser app doesn't have:

- Deterministic **PDF / EPUB / KDP generation and QA** (spec §29–34) — the app exports Markdown; packaging to print-ready PDF/EPUB is roadmap.
- **Document import** of PDF/DOCX/EPUB (spec §25) — for now, paste source text; binary import needs server parsing.
- **Marketplace, authors, royalties, orders, subscriptions** (spec §44–47).
- **Job queue, PostgreSQL, object storage, admin dashboard, observability** (spec §51–53, §65, §94).
- **Multi-agent orchestrator with sandboxing** (spec §40–41) — this build uses a single staged pipeline, not autonomous agents.
- **Auth, organisations, RBAC, the 150+ test suite, CI/CD** (spec §59, §76).

## V1 → V2 note

There was no prior "VoxPress Book Factory" implementation in this repository to migrate — the earlier Podcast/Content studios are unrelated. So there is nothing to deprecate or migrate from; this is the first VoxPress implementation, built as the v2 core from the start. If a separate V1 Book Factory codebase exists elsewhere, migrate it into the standalone platform project, not into this app.

## If you want the full platform

It's a real, separate build (backend + database + storage + the publishing/QA engines). That's the right home for PDF/EPUB/KDP, the marketplace and multi-agent orchestration. Say the word and I'll scope that as its own repository; it should not be bolted onto this browser app.
