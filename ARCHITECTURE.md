# Architecture — Claude Machine

_Reflects the codebase as of 2026-09-06. Two independent systems live in one repo; they do not share code or a build pipeline._

## 1. Web app (`/`, `src/`)

### Stack
- **React 19.2**, **TypeScript ~6.0**, **Vite 8**, plain CSS (no Tailwind/CSS-in-JS lib — every component ships its own `<style>` block inline in the TSX file).
- `lucide-react` for icons. No router library — navigation is a single `currentView` string in `App.tsx` state, switched via conditional rendering.
- No state management library — everything is `useState`/`useEffect` in `App.tsx`, passed down via props. No context, no Redux/Zustand.
- No backend of any kind. No server, no API routes, no database on the JS side. `automation_videos.db` (SQLite) at the repo root belongs to the Python project, not the web app.
- Persistence = `localStorage` only, under these keys: `claude_machine_api_keys`, `claude_machine_settings`, `claude_machine_custom_specialists`, `claude_machine_history`, `voxstar_secret_key`.
- Build output: single JS bundle, ~517 KB minified (~144 KB gzip) — no code splitting, no lazy-loaded routes, despite ~15,000 lines of component code being loaded on first paint.

### Runtime data flow (the one real feature)
```
User picks a Specialist card (src/data/specialists.ts)
  → SpecialistRunner renders its `inputs[]` as a form
  → compilePrompt() fills {{placeholders}} in the specialist's promptTemplate
  → runSpecialistStream() in src/utils/ai.ts:
      - settings.provider === 'mock'  → runMockStream() (typewriter-animated canned text)
      - 'gemini'   → fetch() streamGenerateContent, hand-rolled SSE/JSON-array parser
      - 'openai'   → fetch() chat/completions with stream:true, SSE parser
      - 'anthropic'→ fetch() messages with stream:true (author's own code flags this will
                     likely fail from a browser due to Anthropic's CORS policy — no proxy exists)
  → chunks stream into React state → rendered by a hand-rolled markdown-subset renderer
    (SafeMarkdown in SpecialistRunner.tsx — handles #headers, **bold**, `code`, ``` blocks,
    -/* lists, > [!NOTE] callouts; not a real markdown parser)
  → on completion, run is appended to history and persisted to localStorage
```
API keys are typed into `SettingsModal`, held in React state, and written to `localStorage` in plaintext (see DECISIONS.md / audit — this is a real risk on a shared machine, mitigated only by being fully client-side/no server to leak from).

### Simulated screens (no real backend call anywhere in these files)
- `VoxstarAutomation.tsx` (2,214 lines) — "MCP connector" that only stores a string in `localStorage`; Ideation Coach, Post Grader, StorySafe editor, Carousel generator, and Calendar bulk-edit all use `setTimeout` + hardcoded response strings.
- `DailyIdeaStudio.tsx`, `DailyAutopilotStudio.tsx`, `WiredvibeStudio.tsx` — same pattern (`setTimeout`/`setInterval` for fake "processing," zero `fetch`/API calls). These are the frontend's own re-imagining of what the Python `Automation 1` engine does, but neither is wired to the other or to any real service.
- `DailyAutopilotStudio.tsx` has an additional, real (non-simulation) bug: it uses Tailwind utility classes (`grid-cols-12`, `bg-slate-900/60`, `lg:col-span-5`, etc.) but Tailwind is not installed anywhere in this project (not in `package.json`, no `tailwind.config`) and `index.css` defines no matching rules. Large sections of this one screen render unstyled/misaligned in the browser today — this is a genuine visual defect, not just an "unwired backend" issue.

### Component inventory
| File | Lines | Real I/O? |
|---|---|---|
| `App.tsx` | 1,182 | shell/routing + localStorage |
| `data/specialists.ts` | 2,311 | static data |
| `utils/ai.ts` | 514 | **yes** — real fetch to 3 LLM providers |
| `components/SpecialistRunner.tsx` | 674 | **yes** — calls ai.ts |
| `components/SpecialistGenerator.tsx` | 522 | **yes** — calls ai.ts |
| `components/SettingsModal.tsx` | 514 | localStorage only |
| `components/VoxstarAutomation.tsx` | 2,214 | no — simulated |
| `components/DailyAutopilotStudio.tsx` | 754 | no — simulated |
| `components/DailyIdeaStudio.tsx` | 573 | no — simulated |
| `components/WiredvibeStudio.tsx` | 259 | no — simulated |
| `components/SpecialistCard.tsx` | 196 | presentational |
| `components/SystemGuideModal.tsx` | 188 | static help content |
| `components/FieldHelpTooltip.tsx` | 117 | presentational |
| `components/ScreenHelpBanner.tsx` | 94 | presentational |

### Build & tooling
- `npm run dev` → Vite dev server. `npm run build` → `tsc -b && vite build`. `npm run lint` → `oxlint` (config: `react`, `typescript`, `oxc` plugins; type-aware linting is **not** enabled — see `.oxlintrc.json`'s own comment about `oxlint-tsgolint`). `npm run preview`.
- Build currently succeeds clean (verified 2026-09-06): 96 modules, ~96ms, one non-fatal chunk-size warning. `oxlint` currently reports 2 warnings only (unused catch-block bindings in `ai.ts`).
- `dist/` is committed-looking (present in working tree) and contains a stale-vs-source build artifact plus copies of the PDF/zip assets — not something Vite would regenerate identically without a rebuild step in CI (there is no CI).

## 2. Automation 1 (`automation1-Video-Content/`)

Pure Python, no web framework, run manually via `setup_and_run.sh` or `python automation_<provider>.py`.

```
CSV (video_ideas_queue.csv) ──sync_csv_to_db()──▶ SQLite (automation_videos.db)
                                                      │
                                          get_next_pending_idea()
                                                      ▼
                                        LoopEngine.run_single_loop()
                                                      │
                     ┌────────────────────────────────┼───────────────────────────────┐
                     ▼                                ▼                               ▼
      ai_synthesizer(idea) — one of:      video_engines.get_engine_by_name()   social_publishers
      gemini/claude/chatgpt/grok           LT25 / Sundance / GeminiVeo         .syndicate_all()
      → real fetch() to provider API,      → LT25 tries a real local           → 6 methods, ALL
        JSON-schema prompt, falls back       endpoint then falls back to a       simulated: sleep()
        to a hardcoded canned dict on         public sample MP4; Sundance/       + fabricated
        any error/missing key                 GeminiVeo NEVER call anything      post IDs/URLs,
                                               real — sleep() + same sample       no HTTP call ever
                                               MP4 always                        made
                     └────────────────────────────────┼───────────────────────────────┘
                                                      ▼
                                    update_queue_item() + log_publish_result()
                                          (writes back to SQLite)
```

- **Database**: two tables, `video_queue` (the work items/state machine: pending→rendering→published/failed) and `publish_logs` (per-platform audit trail, FK to `video_queue`). Schema is sane; no migrations tooling, just `CREATE TABLE IF NOT EXISTS` run on every call.
- **Config**: `config.env.example` documents every env var (LLM keys, video engine keys, 6 platforms' social credentials, `DATABASE_PATH`, `CSV_QUEUE_PATH`, `DAILY_RUN_TIME`, `LOOP_INTERVAL_HOURS`, `AUTO_RETRY_FAILED`, `MAX_CRITIQUE_LOOPS`). Several of these (`DAILY_RUN_TIME`, `LOOP_INTERVAL_HOURS`, `AUTO_RETRY_FAILED`, `MAX_CRITIQUE_LOOPS`) are **not read anywhere in the code** — dead configuration. `schedule` is a declared pip dependency and is never imported — there is no actual scheduler; "daily" is aspirational.
- **Error handling**: one broad `try/except Exception` per LLM call, silently falling back to canned content on any failure (bad key, timeout, rate limit, malformed JSON — all treated identically, all reported as if things worked).
- **Tests**: none.

## How the two halves relate
They don't, at runtime. The web app bundles the Python project's zip + PDF as static downloads (`public/automation1-Video-Content.zip`, `public/Automation1-Daily-Video-Content-FieldGuide.pdf`) and the `automation1_guide.html` at the repo root is a print-styled marketing/field-guide document for it — but there is no code path connecting the React app to the Python scripts. They are packaged together for distribution/sale, not integrated as one system.
