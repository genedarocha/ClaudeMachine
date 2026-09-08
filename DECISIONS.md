# Decisions — Claude Machine

_A log of the significant technical decisions already baked into this codebase, as observed by reading it — not a record of decisions made in a Claude Code session. Recorded so future sessions don't second-guess or accidentally re-litigate settled tradeoffs without knowing why they exist. Add new entries (dated) as real decisions get made going forward._

---

### Client-side-only, BYOK (bring your own key) architecture
The app never talks to a backend it controls. Users paste their own Gemini/OpenAI/Anthropic API key into `SettingsModal`, and `src/utils/ai.ts` calls the provider's API directly from the browser via `fetch()`.
**Why (inferred):** zero hosting cost, zero backend to build/maintain, ships as a static site. Reasonable for a solo-founder internal tool.
**Consequence:** API keys sit in `localStorage` in plaintext, per-origin. Anthropic calls are documented in-code as likely to fail from a browser due to CORS (no proxy exists to work around this) — Gemini is explicitly recommended in the UI as the practical choice.
**Note — false claim in the UI:** `SettingsModal.tsx`'s own help copy tells the user their keys are "encrypted" in local browser storage. This is not true — they are stored as plain JSON via `localStorage.setItem`, trivially readable via devtools or any injected script. Either implement real encryption (a WebCrypto-wrapped key, unlocked by a passphrase the user supplies) or correct the copy to state the plaintext reality — don't leave a user-facing security claim that doesn't match the code.

### "Demo Mode" as a first-class provider, not a dev-only flag
`ModelSettings.provider` includes `'mock'` alongside the 3 real providers, and it's the default on first load. `runMockStream()` produces a fully-formatted fake markdown report with real streaming animation.
**Why (inferred):** lets a user (or a buyer evaluating the product) try every screen with zero setup and no API cost.
**Consequence:** the seam between "this is really talking to an LLM" and "this is a canned string" is invisible in the UI — same loading states, same streaming animation, same output formatting. This pattern reappears (without an explicit mode toggle) in the fully-simulated screens (see next entry) and in the Python automation engine's silent fallback-on-error behavior — it's a repeated house style, not a one-off.

### Several full screens are built as pure front-end simulations with no real backend
`VoxstarAutomation.tsx`, `DailyIdeaStudio.tsx`, `DailyAutopilotStudio.tsx`, `WiredvibeStudio.tsx`, and the Python `social_publishers.py` all follow the same shape: real-looking async operations (`setTimeout`/`sleep`) that always "succeed" and return plausible fabricated IDs/URLs/scores.
**Why (inferred):** these represent product ideas/mockups built ahead of the real integration work — a common Antigravity-style output (fast, consistent-looking scaffolding across many screens) that demos well but has no wired backend yet.
**Consequence:** treat every "success" message from these screens as **not evidence of anything actually happening**. Nothing was posted to X/YouTube/LinkedIn/Facebook/TikTok/Instagram by this code, ever, regardless of what the UI says. See ROADMAP.md.

### No routing library, no state library
`App.tsx` owns a single `currentView` string and switches on it; all cross-cutting state (keys, settings, specialists, history) lives in `App.tsx` `useState` and is threaded through props.
**Why (inferred):** app is shallow (one level of navigation, no deep-linkable URLs needed) — pulling in React Router/Redux would be over-engineering for the current surface area.
**Consequence:** fine at current size; would need revisiting if the view count or state complexity grows much further (currently ~9 top-level views).

### Every component ships its own inline `<style>` block
No CSS modules, no Tailwind, no styled-components — global `index.css` defines design tokens (CSS custom properties), and each component appends a `<style>{`...`}`} block with scoped-by-convention class names.
**Why (inferred):** keeps each component self-contained for fast Antigravity-style generation; avoids a build-tool dependency for styling.
**Consequence:** no style scoping guarantees (relies on naming discipline), and it inflates component file sizes substantially (e.g., `VoxstarAutomation.tsx` is 2,214 lines, much of it CSS).

### Single JS bundle, no code splitting
`vite.config.ts` has no manual chunking or `React.lazy()` usage anywhere in `App.tsx`; all 9 views ship in one ~517 KB bundle loaded on first paint.
**Why (inferred):** simplicity; app has no route-based deep links to split around.
**Consequence:** acceptable for an internal tool with a handful of users, but is the first thing to fix if this becomes a product with real traffic (see ROADMAP.md).

### SQLite + CSV as the automation queue's storage (Python side)
`database.py` treats the CSV as the seed/import format and SQLite as the source of truth once synced, with an `export_db_to_csv()` escape hatch back to CSV.
**Why (inferred):** zero-ops persistence for a single-operator local tool; CSV as the human-editable authoring surface.
**Consequence:** fine for one operator on one machine; would not survive concurrent runners or a move to a server without real migration/locking work.

### Silent fallback-on-error is the house error-handling style
Both `ai.ts`'s `generateNewSpecialist`/stream functions (implicitly, via `onError` callbacks that surface to the UI) and every `automation_<provider>.py` synthesizer catch broad `Exception` and substitute hardcoded content, printing/logging a warning but not distinguishing "no key," "rate limited," "network down," and "malformed response" from each other.
**Why (inferred):** keeps the demo always "working" end-to-end even when a real integration hiccups.
**Consequence:** in the Python engine this is actively dangerous for an "autonomous daily" system — see audit CRITICAL findings — because it can silently publish (or claim to publish) fabricated content indistinguishable from a real AI-generated run.
