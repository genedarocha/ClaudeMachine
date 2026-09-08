# Project Context — Claude Machine

_Last analyzed: 2026-09-06. Written after a full read-through of the repo (not inferred)._

## What this is

"Claude Machine" is a single-page web app (React 19 + Vite + TypeScript) billed in `index.html` as an "AI Business Specialist Suite." It ships as one repo with two mostly-independent parts:

1. **The web app** (repo root, `src/`) — a dashboard of 105 pre-written prompt templates ("specialists": copywriting, sales, email marketing, social, strategy, ops, etc.) that a user fills in and runs against an LLM of their choice (Gemini, OpenAI, or Anthropic), using their own API key entered client-side. Includes a "Dynamic Specialist Generator" that asks an LLM to invent new specialist templates on the fly, a run history log, and several extra full-screen tools (Voxstar Connect, Wiredvibe Studio, Daily Idea Studio, Daily Autopilot Studio) that role-play a social-media/content-automation product.
2. **Automation 1** (`automation1-Video-Content/`) — a standalone Python CLI project (zipped up and also bundled into the web app's `public/` folder as a downloadable asset + PDF field guide) that is meant to pull video ideas from a CSV/SQLite queue, write scripts via 4 different LLM providers, render video, and auto-post to 6 social platforms once a day.

Both are for the same owner/brand: **Gene Da Rocha**, **Voxstar Ltd**, product brands **Wiredvibeapp** (wiredvibe.ai), **AIToolboard**, **ATL-Trust**. Mandatory hashtag set embedded throughout: `#voxstar #voxstar.ai #wiredvibeapp #atltrust #aitoolboard`.

## Origin

Built with **Google Antigravity** per the user's framing. This shows in the code: extremely consistent scaffolding across every component (same glassmorphic dark UI, same inline `<style>` block pattern, same emoji-laden `console.log`/UI copy, same "Screen Usage Guide" onboarding banner repeated on nearly every view), high volume of boilerplate (2,300+ lines of specialist prompt data, 2,200+ lines in one component), and a recurring pattern of **plausible-looking features that are fully simulated** rather than wired to real backends (see ARCHITECTURE.md and DECISIONS.md).

## Current state, in one paragraph

The core "run a specialist prompt against an LLM" loop is **real** — `SpecialistRunner`/`SpecialistGenerator` call real `fetch()`-based streaming clients for Gemini/OpenAI/Anthropic in `src/utils/ai.ts`, gated by a BYOK (bring-your-own-key) settings modal, with graceful "Demo Mode" fallback when no key is set. Everything else that looks like a working product — Voxstar Connect's MCP hub, the Daily Idea/Autopilot studios, the Wiredvibe player, and the entire Python `Automation 1` video/social pipeline — is **UI/CLI scaffolding with no real backend wired in**: `setTimeout`-based fake async calls, hardcoded canned responses, and (in the Python engine) social-publishing functions that never make an HTTP request at all. See `ROADMAP.md` for what it would take to close that gap, and the audit in the Phase 3 report for severity ranking.

## Who's using this / why it matters

Solo-founder tooling for Gene Da Rocha's own marketing operations (content generation + multi-channel publishing for his own brands). No evidence of other users, a backend service, or a deployed production URL — this is local-first, browser-only, single-tenant.

## Key files to know

| Concern | File |
|---|---|
| App shell, routing (view-state switch), all top-level UI wiring | `src/App.tsx` |
| The 105 built-in prompt templates | `src/data/specialists.ts` |
| Real LLM streaming clients (Gemini/OpenAI/Anthropic) + mock fallback | `src/utils/ai.ts` |
| API key + model settings (stored in `localStorage`, plaintext) | `src/components/SettingsModal.tsx` |
| Actually-functional run screen | `src/components/SpecialistRunner.tsx` |
| Fully-simulated "social automation" screens | `VoxstarAutomation.tsx`, `DailyIdeaStudio.tsx`, `DailyAutopilotStudio.tsx`, `WiredvibeStudio.tsx` |
| Python video/social pipeline orchestrator | `automation1-Video-Content/loop_engine.py` |
| Python "posts to 6 platforms" — currently all fake | `automation1-Video-Content/social_publishers.py` |
