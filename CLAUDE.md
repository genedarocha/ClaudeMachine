# CLAUDE.md — Claude Machine

Guidance for Claude Code sessions working in this repo. See `PROJECT-CONTEXT.md`, `ARCHITECTURE.md`, `DECISIONS.md`, and `ROADMAP.md` for the full picture — read those before making non-trivial changes rather than re-deriving them from scratch.

## Purpose
A React/Vite web app of 105 AI prompt "specialists" for business content generation (BYOK: user's own Gemini/OpenAI/Anthropic key), plus a separate, standalone Python "Automation 1" project that's meant to write, render, and auto-publish daily short-form video across 6 social platforms. Built for solo-founder Gene Da Rocha / Voxstar Ltd (Wiredvibeapp, AIToolboard, ATL-Trust brands).

## Architecture (see ARCHITECTURE.md for detail)
- Web app: React 19 + TypeScript + Vite, no backend, no router/state library, `localStorage` for all persistence, one big JS bundle. Real LLM calls live in `src/utils/ai.ts`; everything else in `src/components/` is either presentational or a real consumer of `ai.ts` (`SpecialistRunner`, `SpecialistGenerator`) or a **fully simulated mockup with no backend** (`VoxstarAutomation`, `DailyIdeaStudio`, `DailyAutopilotStudio`, `WiredvibeStudio`) — know which is which before touching one.
- Python engine (`automation1-Video-Content/`): `loop_engine.py` orchestrates ingestion (SQLite/CSV) → LLM synthesis (real, per-provider) → video render (mostly simulated) → 6-platform social publish (**100% simulated, no real HTTP call exists**). Do not describe this pipeline as "working" or "posting" without checking the current state of `social_publishers.py` and `video_engines.py` first — this has changed before and may change again as it gets built out.

## Coding conventions observed in this repo
- Components are self-contained: TSX + an inline `<style>{`...`}`}` block at the bottom of the same file, using CSS custom properties from `src/index.css`. Follow this pattern for new components rather than introducing Tailwind/CSS modules/styled-components.
- No test framework is set up (JS or Python). If you add meaningful new logic (not pure UI), propose adding tests rather than silently skipping them — but don't introduce a test framework unprompted for a trivial change.
- TypeScript: `type` imports (`import { type X }`) used consistently for type-only imports — match this style.
- Python: plain functions + light classes (`BaseVideoEngine`, `SocialPublishersHub`), `os.getenv()` for config, no framework. Keep new Python code dependency-light and consistent with this style unless there's a real reason to add a framework.

## Testing requirements
- `npm run build` (runs `tsc -b && vite build`) must stay clean — it does today. Run it before considering any JS/TS change done.
- `npm run lint` (oxlint) should stay at zero new warnings.
- No Python test suite exists; there is nothing to run today. If you add real (non-simulated) integrations to the Python side, add tests for them rather than leaving the project permanently untested.

## Security requirements
- Never commit real API keys/secrets. `config.env` (the real, filled-in version of `automation1-Video-Content/config.env.example`) is **not currently gitignored** — add it to `.gitignore` before anyone populates it with real credentials, and check `git status` for it before any commit in that directory.
- The web app stores API keys in `localStorage` in plaintext by design (client-only architecture, see DECISIONS.md) — this is a known, accepted tradeoff for a single-user local tool, not something to silently "fix" by adding a backend without discussing it first.
- If you touch `social_publishers.py`, `video_engines.py`, or any of the simulated front-end screens to wire in real functionality: do not let a failed/unauthenticated call silently report success. That pattern already exists in this codebase (see DECISIONS.md — "silent fallback-on-error") and is flagged as a real risk in the audit; don't extend it into newly-real integrations.

## Git rules
- This repo's `.gitignore` excludes `node_modules`, `dist`, `*.db`/`*.sqlite*`, editor dirs — but currently does **not** exclude any `.env` pattern. Treat that as a gap to fix, not a signal that env files are safe to commit.
- Follow the global git safety rules already in effect for this session (no force-push, no `--no-verify`, confirm before destructive ops, new commits rather than amends unless asked).

## Deployment requirements
- No deployment pipeline exists (no CI config found, no hosting config). `dist/` is present in the working tree from a manual local build — treat it as a build artifact, not a source of truth, and don't hand-edit it.
- The Python project has no deployment story beyond "run manually on a machine with `config.env` populated" — see ROADMAP.md Gap 3 (no real scheduler wired in despite config implying a daily cron).

## Important constraints
- Don't conflate the front-end's "Daily Autopilot"/"Voxstar Connect" screens with the Python `Automation 1` engine — they look like they do the same job but are separate, disconnected codebases (see ARCHITECTURE.md, "How the two halves relate"). A fix in one does not affect the other.
- Before claiming any "automation," "publishing," or "rendering" feature works, check whether the specific function involved actually performs I/O (`fetch`/`requests.post` to a real external host) or just `setTimeout`/`sleep` + a canned return value. This codebase mixes both patterns heavily and they're visually indistinguishable from the UI/log output alone.

## Definition of done
- Code builds clean (`npm run build`) and lints clean (`npm run lint`) for JS/TS changes.
- No secrets committed; `.gitignore` updated if a new credential-bearing file type is introduced.
- Any change to a previously-simulated integration (Gap 1/2 in ROADMAP.md) either makes it genuinely real end-to-end (real request, real response handling, real error surfaced on failure) or is clearly still labeled as a mock in code/UI — no silent middle state.
- Documentation (`PROJECT-CONTEXT.md`/`ARCHITECTURE.md`/`DECISIONS.md`/`ROADMAP.md`) updated when a change alters the facts they record (e.g., a Gap in ROADMAP.md gets closed, a Decision changes).
