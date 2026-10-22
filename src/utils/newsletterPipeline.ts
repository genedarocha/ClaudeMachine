// Newsletter state + pipeline shared by the Newsletter screen and the Friday auto-draft.
// Friday auto-draft runs when the app is open on a Friday (or that weekend): this is a browser-only app,
// so nothing runs while it's closed. It drafts the issue and puts it on the calendar; it never publishes.

import { type ApiKeys, type ModelSettings, generateGroundedText, generateText, humanizeLongform } from './ai';
import { buildSpecialistPrompt, readVoiceSamples, tidyText } from './humanizer';
import {
  type NewsStory, type NewsletterImage, buildResearchPrompt, parseStories, storiesForPrompt, buildWriteTemplate, parseDraft, issueTitle
} from './newsletter';
import {
  LAST_PUBLISHED_ISSUE, LAST_PUBLISHED_DATE, DEFAULT_BYLINE, DEFAULT_SIGNATURE, LAST_ISSUE_TEXT
} from '../data/newsletterDefaults';
import { type CalendarEntry, getEntry, putEntries, isoDate, addDays } from './contentStore';

export interface NewsletterSetup {
  issueNumber: number;
  issueDate: string;
  from: string;
  to: string;
  ourNews: string;
  podcast: string;
  lastIssue: string;
  lastPublishedDate: string;
  byline: string;
  signature: string;
  includeSources: boolean;
}

export interface NewsletterDraftState {
  subtitle: string;
  body: string;
  images: NewsletterImage[];
  issues: string[];
}

export interface ArchivedIssue {
  number: number;
  date: string;
  title: string;
  article: string;
}

export interface NewsletterState {
  setup: NewsletterSetup;
  stories: NewsStory[];
  draft: NewsletterDraftState | null;
  archive: ArchivedIssue[];
  autoRunFor?: string; // the Friday an auto-draft was last attempted for
}

export const NEWSLETTER_STORAGE_KEY = 'claude_machine_newsletter';
export const NEWSLETTER_EVENT = 'claude-machine-newsletter-updated';

export const todayIso = () => isoDate(new Date());
export const isoDaysAgo = (days: number) => addDays(todayIso(), -days);

export const defaultNewsletterSetup = (): NewsletterSetup => ({
  issueNumber: LAST_PUBLISHED_ISSUE + 1,
  issueDate: todayIso(),
  from: addDays(LAST_PUBLISHED_DATE, 1) > isoDaysAgo(14) ? addDays(LAST_PUBLISHED_DATE, 1) : isoDaysAgo(14),
  to: todayIso(),
  ourNews: '',
  podcast: '',
  lastIssue: LAST_ISSUE_TEXT,
  lastPublishedDate: LAST_PUBLISHED_DATE,
  byline: DEFAULT_BYLINE,
  signature: DEFAULT_SIGNATURE,
  includeSources: true
});

export function loadNewsletterState(): NewsletterState {
  const fallback: NewsletterState = { setup: defaultNewsletterSetup(), stories: [], draft: null, archive: [] };
  try {
    const raw = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as NewsletterState;
    const setup = { ...fallback.setup, ...parsed.setup };
    // A newer issue was published outside this screen (the defaults moved on): start from the defaults'
    // next issue and style reference rather than the stale saved ones.
    if (setup.issueNumber <= LAST_PUBLISHED_ISSUE) {
      const d = defaultNewsletterSetup();
      Object.assign(setup, { issueNumber: d.issueNumber, lastIssue: d.lastIssue, lastPublishedDate: d.lastPublishedDate, from: d.from, to: d.to, ourNews: '', podcast: '' });
      return { ...fallback, archive: parsed.archive || [], setup };
    }
    return { ...fallback, ...parsed, setup };
  } catch {
    return fallback;
  }
}

export function saveNewsletterState(state: NewsletterState, broadcast = false) {
  try {
    localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the screen still works for this session.
  }
  if (broadcast) window.dispatchEvent(new Event(NEWSLETTER_EVENT));
}

// --- Pipeline steps ------------------------------------------------------------------------------

export async function researchStories(setup: NewsletterSetup, keys: ApiKeys, settings: ModelSettings): Promise<NewsStory[]> {
  const result = await generateGroundedText(buildResearchPrompt(setup.from, setup.to), keys, settings);
  const found = parseStories(result.text, result.sources, setup.from, setup.to);
  if (!found.length) throw new Error('No stories came back. Try again or widen the date range.');
  return found;
}

export async function writeNewsletterDraft(
  setup: NewsletterSetup,
  selected: NewsStory[],
  keys: ApiKeys,
  settings: ModelSettings,
  onHumanizing?: (raw: NewsletterDraftState) => void
): Promise<{ draft: NewsletterDraftState; rewriteError?: string }> {
  if (!selected.length) throw new Error('Tick at least one story to write about.');
  const voice = readVoiceSamples();
  const prompt = buildSpecialistPrompt(
    buildWriteTemplate(setup.issueNumber, setup.from, setup.to),
    {
      lastIssue: setup.lastIssue.slice(0, 12000),
      ourNews: setup.ourNews.trim() || 'None provided',
      podcast: setup.podcast.trim() || 'None provided',
      stories: storiesForPrompt(selected)
    },
    voice
  );
  const raw = await generateText(prompt, keys, settings, settings.provider === 'anthropic' ? 8000 : 16000, 0.7);
  const parsed = parseDraft(raw);
  onHumanizing?.({ ...parsed, body: tidyText(parsed.body, 'longform'), issues: [] });
  const human = await humanizeLongform(parsed.body, keys, settings, voice);
  return { draft: { ...parsed, body: human.text, issues: human.issues }, rewriteError: human.rewriteError };
}

// --- Calendar ------------------------------------------------------------------------------------

export const newsletterEntryId = (issueNumber: number) => `newsletter-${issueNumber}`;

// Fridays on or after `fromIso`.
export const nextFriday = (fromIso: string) => {
  const d = new Date(`${fromIso}T12:00:00`);
  const diff = (5 - d.getDay() + 7) % 7;
  return addDays(fromIso, diff);
};

export async function upsertNewsletterEntry(issueNumber: number, date: string, title: string, patch: Partial<CalendarEntry> = {}) {
  const id = newsletterEntryId(issueNumber);
  const existing = await getEntry(id);
  const now = Date.now();
  await putEntries([{
    id,
    date,
    siteId: 'newsletter',
    kind: 'newsletter',
    title,
    posts: {},
    status: 'draft',
    postedUrls: {},
    link: '#/newsletter',
    createdAt: now,
    ...(existing || {}),
    ...patch,
    updatedAt: now
  } as CalendarEntry]);
}

// Puts the published issue and the next 7 Fridays' slots on the calendar (about 50 days ahead).
// Existing entries are left alone, so this is safe to run on every app start.
export async function seedNewsletterCalendar() {
  const state = loadNewsletterState();
  if (!(await getEntry(newsletterEntryId(LAST_PUBLISHED_ISSUE)))) {
    await upsertNewsletterEntry(LAST_PUBLISHED_ISSUE, LAST_PUBLISHED_DATE, issueTitle(LAST_PUBLISHED_ISSUE, 'The Fortnight the Agents Covered Their Tracks'), { status: 'approved' });
  }
  // The next issue goes on the first Friday at least 5 days after the last one.
  let friday = nextFriday(addDays(state.setup.lastPublishedDate, 5));
  for (let n = state.setup.issueNumber; n < state.setup.issueNumber + 7; n++) {
    if (!(await getEntry(newsletterEntryId(n)))) {
      await upsertNewsletterEntry(n, friday, `Newsletter #${n} (drafts automatically when the app is opened that Friday)`);
    }
    friday = addDays(friday, 7);
  }
}

export type AutoDraftResult =
  | { status: 'skipped'; reason: string }
  | { status: 'drafted'; issueNumber: number; stories: number }
  | { status: 'failed'; error: string };

// Runs the whole pipeline unattended on Fridays (and that weekend) when this week's issue hasn't been
// drafted yet. Uses every story that passed the source and date checks. Never publishes.
export async function autoDraftIfFriday(keys: ApiKeys, settings: ModelSettings): Promise<AutoDraftResult> {
  const today = todayIso();
  const weekday = new Date(`${today}T12:00:00`).getDay();
  if (![5, 6, 0].includes(weekday)) return { status: 'skipped', reason: 'Not Friday' };
  if (settings.provider !== 'gemini' && settings.provider !== 'openai') return { status: 'skipped', reason: 'Needs Gemini or OpenAI' };
  if (!keys[settings.provider]) return { status: 'skipped', reason: 'No API key' };

  const state = loadNewsletterState();
  const friday = addDays(today, -((weekday + 2) % 7)); // this week's Friday
  if (state.autoRunFor === friday) return { status: 'skipped', reason: 'Already attempted this week' };
  if (state.draft) return { status: 'skipped', reason: 'A draft already exists' };
  if (addDays(state.setup.lastPublishedDate, 5) > friday) return { status: 'skipped', reason: 'Last issue went out this week' };

  saveNewsletterState({ ...state, autoRunFor: friday });
  const setup: NewsletterSetup = { ...state.setup, issueDate: friday, from: addDays(state.setup.lastPublishedDate, 1), to: today };
  try {
    const stories = await researchStories(setup, keys, settings);
    const selected = stories.filter(s => s.selected);
    if (!selected.length) throw new Error('No stories passed the source checks. Open the newsletter screen to review them.');
    const { draft } = await writeNewsletterDraft(setup, selected, keys, settings);
    saveNewsletterState({ ...loadNewsletterState(), setup, stories, draft, autoRunFor: friday }, true);
    await upsertNewsletterEntry(setup.issueNumber, friday, issueTitle(setup.issueNumber, draft.subtitle), { status: 'draft', posts: { linkedin: draft.body } });
    return { status: 'drafted', issueNumber: setup.issueNumber, stories: selected.length };
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : String(err) };
  }
}
