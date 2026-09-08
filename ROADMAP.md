# Roadmap — Claude Machine

_A punch list derived from the Phase 1/3 discovery + audit (2026-09-06), organized by what's real vs. what needs to be built. Not started — nothing here should be implemented without the project owner picking priorities first (see the Phase 4 report delivered alongside this doc)._

## What's genuinely done and usable today
- Specialist dashboard: browse/search/filter 105 prompt templates across 11 categories. ✅
- Run a specialist against a real Gemini or OpenAI key, streamed, with markdown rendering and run history. ✅ (Anthropic path exists but is expected to fail from the browser due to CORS — untested/unconfirmed working.)
- Generate a brand-new custom specialist from a text description via a real LLM call, deploy it to the dashboard, persisted in `localStorage`. ✅
- Settings/API key management UI. ✅
- Clean production build (`npm run build` succeeds, minimal lint warnings). ✅

## Gap 1 — Automation 1's video rendering is fake
`SundanceEngine` and `GeminiVeoEngine` never call any real API; they always return the same public Google sample MP4. `LT25Engine` only works if a local render server happens to be running on `localhost:7860`.
**To close:** pick real integrations (or explicitly cut Sundance/Veo from the README's claims until built), wire actual HTTP calls with real request/response shapes, add render-status polling since video generation is typically async/job-based, not synchronous.

## Gap 2 — Automation 1's social publishing is 100% simulated
None of the 6 `publish_to_*` methods in `social_publishers.py` make an HTTP request. This is the single biggest gap between what the README promises ("6-Channel Automated Social Syndication") and what exists.
**To close, per platform:** X.com (Twitter API v2 media upload + tweet), YouTube (Data API v3 OAuth + resumable upload), LinkedIn Personal + Company (UGC Post API, needs separate OAuth tokens as already stubbed in config), Facebook Page (Graph API video upload), TikTok (Content Posting API, needs app review/approval from TikTok). Each is a real OAuth + upload integration project on its own — treat as N separate workstreams, not one.

## Gap 3 — No real scheduling
`schedule` is a listed dependency but unused; `DAILY_RUN_TIME`/`LOOP_INTERVAL_HOURS` are unused config. There is no cron, no daemon, no CI job — "autonomous daily" currently means "someone runs a script by hand."
**To close:** either wire the `schedule` library into a long-running process, or (more robust) drop it and use OS/CI-level cron (system cron, GitHub Actions scheduled workflow, or a small hosted worker) invoking `automation_<provider>.py` on a timer, with locking to avoid overlapping runs.

## Gap 4 — Front-end "automation" screens are disconnected mockups
`VoxstarAutomation.tsx`, `DailyIdeaStudio.tsx`, `DailyAutopilotStudio.tsx`, `WiredvibeStudio.tsx` are UI concepts with no backend. Decide, per screen:
- Cut it (if it was exploratory and isn't the product direction), or
- Wire it to something real — likely the same social-platform integrations from Gap 2, plus whatever "MCP server" `VoxstarAutomation` is meant to talk to (currently just a URL string field with no protocol implementation on the client).

## Gap 5 — Silent-fallback error handling needs to become honest error handling
Across both the JS and Python LLM call sites, failures are swallowed and replaced with canned content that's indistinguishable from a real result. Before any of Gaps 1–4 are wired to real, paying-audience distribution, this needs to become: surface real failures, retry with backoff where sensible, and never auto-publish a fabricated fallback under a "success" status.

## Gap 6 — Security/config hygiene (see full audit for severity)
- API keys in `localStorage` in plaintext (web app).
- `SettingsModal.tsx` tells users their keys are "encrypted" in local storage — they are not (plain JSON). Fix the claim or fix the storage; don't leave the mismatch.
- Real social/LLM credentials, once configured, will live in `automation1-Video-Content/config.env` — confirm it's gitignored (currently only `*.db`/`*.sqlite*` are ignored; `config.env` itself is *not* in `.gitignore` and should be added before anyone fills it in with real secrets).
- No automated tests anywhere in the repo (JS or Python) — nothing to prevent regressions when the gaps above get worked on.

## Gap 8 — `DailyAutopilotStudio.tsx` is visually broken today
Uses Tailwind utility classes with no Tailwind installed and no matching plain-CSS rules in `index.css` — this is the one place in the app that's a real, currently-visible UI bug rather than an "unwired backend" gap. Cheapest fix: rewrite its markup to the same inline-`<style>` convention every other component uses.

## Gap 7 — Performance/scale, only relevant once this has more than a handful of users
- Single 517 KB JS bundle, no code splitting — fine today, worth revisiting with `React.lazy()` per view if the app grows.
- SQLite + CSV queue has no concurrency story — fine for one operator, would need real locking/queueing (or a hosted DB) for multi-operator or server-triggered runs.

## Suggested sequencing (not a commitment — for discussion)
1. Security hygiene (Gap 6) — cheap, prevents future incidents, do it regardless of what's built next.
2. Decide scope: is Automation 1's social publishing actually the priority, or was it a proof-of-concept that's now superseded by the front-end specialist suite? This determines whether Gaps 1–4 are worth building at all.
3. If yes — pick one platform end-to-end (e.g., X.com, simplest API) and get one real, honest publish working before fanning out to the other 5.
4. Only then: scheduling (Gap 3), then the rest of the platforms (Gap 2), then video engines (Gap 1).
