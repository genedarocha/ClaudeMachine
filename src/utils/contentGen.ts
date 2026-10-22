// Daily content generation for the site profiles: a topic plan for N days, then full multi-platform
// content in batches. Real LLM calls (generateText in JSON mode, humanizer rules appended). Nothing is
// posted anywhere: entries go to the calendar, and the user posts each one through the platform links.

import { type ApiKeys, type ModelSettings, generateText } from './ai';
import { buildSpecialistPrompt, buildRewritePrompt, checkHumanizer, tidyText, readVoiceSamples } from './humanizer';
import { type SiteProfile } from '../data/siteProfiles';
import { type CalendarEntry, type PlatformKey, type VideoPlan, addDays, getAllEntries, putEntries } from './contentStore';

export interface PlanDay {
  day: number;
  date: string;
  pillar: string;
  topic: string;
  angle: string;
}

export interface SitePlan {
  siteId: string;
  startDate: string;
  days: PlanDay[];
  createdAt: number;
}

export const PLATFORMS: { key: PlatformKey; label: string; short: string }[] = [
  { key: 'linkedin', label: 'LinkedIn (Gene)', short: 'LI' },
  { key: 'linkedinCompany', label: 'LinkedIn company page', short: 'LI Co' },
  { key: 'x', label: 'X', short: 'X' },
  { key: 'facebook', label: 'Facebook page', short: 'FB' },
  { key: 'tiktok', label: 'TikTok', short: 'TT' },
  { key: 'youtube', label: 'YouTube Shorts', short: 'YT' },
  { key: 'substack', label: 'Substack', short: 'SS' },
  { key: 'site', label: 'Website blog', short: 'Site' }
];

// Where to post each piece. LinkedIn and X accept pre-filled text; the others open the right composer.
export function composerUrl(platform: PlatformKey, text: string, profile?: SiteProfile): string {
  const enc = encodeURIComponent;
  switch (platform) {
    case 'linkedin': return `https://www.linkedin.com/feed/?shareActive=true&text=${enc(text.slice(0, 2800))}`;
    case 'linkedinCompany': return profile?.linkedinPageUrl || 'https://www.linkedin.com/feed/';
    case 'x': return `https://x.com/intent/post?text=${enc(text.slice(0, 280))}`;
    case 'facebook': return profile?.facebookPageUrl || 'https://business.facebook.com/latest/composer';
    case 'tiktok': return 'https://www.tiktok.com/tiktokstudio/upload';
    case 'youtube': return 'https://studio.youtube.com';
    case 'substack': return profile?.substackUrl ? `${profile.substackUrl.replace(/\/$/, '')}/publish/post` : 'https://substack.com/notes';
    case 'site': return profile?.siteAdminUrl || profile?.url || '';
  }
}

const profileBlock = (p: SiteProfile) => `Name: ${p.name}
Website: ${p.url}
What it is: ${p.description}
Audience: ${p.audience}
Tone: ${p.tone}
Call to action: ${p.cta}`;

const FACT_RULES = `- Use only facts from the site profile. Never invent statistics, customers, testimonials, partnerships, results, prices or news events.
- No superlatives like "the only", "the first" or "the best" unless the profile says exactly that.
- No medical, legal or financial promises.`;

const PLAN_STORAGE = (siteId: string) => `claude_machine_site_plan_${siteId}`;

export const loadPlan = (siteId: string): SitePlan | null => {
  try {
    const raw = localStorage.getItem(PLAN_STORAGE(siteId));
    return raw ? (JSON.parse(raw) as SitePlan) : null;
  } catch {
    return null;
  }
};

const savePlan = (plan: SitePlan) => {
  try {
    localStorage.setItem(PLAN_STORAGE(plan.siteId), JSON.stringify(plan));
  } catch {
    // Not fatal: the plan is also reflected in the calendar entries.
  }
};

export const clearPlan = (siteId: string) => {
  try {
    localStorage.removeItem(PLAN_STORAGE(siteId));
  } catch {
    // ignore
  }
};

const parseJsonObject = (raw: string): Record<string, unknown> => {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('The model did not return JSON. Try again.');
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new Error('The model returned malformed JSON (often a cut-off response). Try again, or use a model with a bigger output limit.');
  }
};

const maxTokensFor = (settings: ModelSettings) => (settings.provider === 'anthropic' ? 8000 : 16000);

// --- Step 1: topic plan --------------------------------------------------------------------------

export async function generatePlan(profile: SiteProfile, startDate: string, days: number, keys: ApiKeys, settings: ModelSettings): Promise<SitePlan> {
  const template = `# Task
Plan ${days} days of social media content for this website, one topic per day.

# Site profile
{{profile}}

# Rules
- Rotate through these content themes so no theme repeats two days running: {{pillars}}.
- Every topic must be specific (a single idea someone can post about), not a broad category.
- No two days may cover the same idea.
- Mix formats across the plan: practical tips, explanations, behind the scenes, myths, stories, questions to the audience, and soft promotion of the site (at most one day in five).
${FACT_RULES}

# Output format
Return ONLY a JSON object: {"days": [{"day": 1, "pillar": "[theme]", "topic": "[specific topic]", "angle": "[one sentence: the point or hook of the post]"}]} with exactly ${days} items, day 1 to ${days}.`;
  const prompt = buildSpecialistPrompt(template, { profile: profileBlock(profile), pillars: profile.pillars }, '');
  const raw = await generateText(prompt, keys, settings, maxTokensFor(settings), 0.8, { json: true });
  const parsed = parseJsonObject(raw);
  const list = Array.isArray(parsed.days) ? (parsed.days as Array<Record<string, unknown>>) : [];
  if (list.length < days * 0.8) throw new Error(`The plan came back with ${list.length} of ${days} days. Try again.`);
  const plan: SitePlan = {
    siteId: profile.id,
    startDate,
    createdAt: Date.now(),
    days: list.slice(0, days).map((d, i) => ({
      day: i + 1,
      date: addDays(startDate, i),
      pillar: String(d.pillar || ''),
      topic: String(d.topic || ''),
      angle: String(d.angle || '')
    }))
  };
  savePlan(plan);
  return plan;
}

// --- Step 2: daily content -----------------------------------------------------------------------

const batchTemplate = (count: number) => `# Task
Write ${count} days of ready-to-post content for this website. Each day has one topic; write every format below for it.

# Site profile
{{profile}}

# Days to write
{{days}}

# Rules
## Formats for each day
- linkedin: a post by founder Gene Da Rocha in the first person ("I"), 120-200 words, short paragraphs, mention the site at most once, 2-3 hashtags on the last line.
- linkedinCompany: the brand's own page post ("we"), 60-120 words, ending with the call to action and the website, 3 hashtags.
- x: one post, at most 260 characters including the website, 0-2 hashtags.
- facebook: 50-110 words, friendly, ending with the call to action and the website.
- tiktok: a caption of at most 150 characters plus 3-5 hashtags.
- youtubeTitle: a YouTube Shorts title of at most 70 characters, no ALL CAPS.
- youtubeDescription: 2-3 sentences, then the website, then 3 hashtags.
- video: a 30-45 second vertical (9:16) short video for TikTok, YouTube Shorts and Reels:
  - hook: what is said and shown in the first 2 seconds.
  - voiceover: 70-110 words, spoken naturally.
  - scenes: 4-6 scenes, each with "visual" (what's on screen) and "onScreenText" (at most 7 words).
  - aiVideoPrompt: one paragraph a creator can paste into an AI video generator (Veo, Sora, Runway, Kling): vertical 9:16, subject, setting, camera movement, lighting, style. No real people, no logos, no text in the video.
- articleTitle and articleBody: a short post for the website blog and Substack, 200-350 words in markdown (## subheadings allowed), ending with the call to action.
## Facts
${FACT_RULES}
## Variety
- Each day must open differently. Don't start two posts the same way, and don't reuse phrases across days.

# Output format
Return ONLY a JSON object:
{"days": [{"day": [day number], "title": "[short internal title]", "linkedin": "", "linkedinCompany": "", "x": "", "facebook": "", "tiktok": "", "youtubeTitle": "", "youtubeDescription": "", "video": {"hook": "", "voiceover": "", "scenes": [{"visual": "", "onScreenText": ""}], "aiVideoPrompt": ""}, "articleTitle": "", "articleBody": ""}]}`;

const str = (v: unknown) => (typeof v === 'string' ? v : '');

function toEntry(profile: SiteProfile, planDay: PlanDay, d: Record<string, unknown>): CalendarEntry {
  const tidy = (t: string) => tidyText(t, 'longform');
  const v = (d.video || {}) as Record<string, unknown>;
  const video: VideoPlan = {
    hook: tidy(str(v.hook)),
    voiceover: tidy(str(v.voiceover)),
    scenes: (Array.isArray(v.scenes) ? v.scenes : []).map((s: Record<string, unknown>) => ({ visual: str(s.visual), onScreenText: str(s.onScreenText) })),
    aiVideoPrompt: str(v.aiVideoPrompt)
  };
  const article = { title: tidy(str(d.articleTitle)), body: tidy(str(d.articleBody)) };
  const articleText = article.title ? `${article.title}\n\n${article.body}` : article.body;
  const posts: Partial<Record<PlatformKey, string>> = {
    linkedin: tidy(str(d.linkedin)),
    linkedinCompany: tidy(str(d.linkedinCompany)),
    x: tidy(str(d.x)),
    facebook: tidy(str(d.facebook)),
    tiktok: tidy(str(d.tiktok)),
    youtube: [tidy(str(d.youtubeTitle)), tidy(str(d.youtubeDescription))].filter(Boolean).join('\n\n'),
    substack: articleText,
    site: articleText
  };
  const humanizerFlags: CalendarEntry['humanizerFlags'] = {};
  for (const [k, text] of Object.entries(posts)) {
    if (k === 'site' || !text) continue; // site duplicates substack
    const issues = checkHumanizer(text, 'longform');
    if (issues.length) humanizerFlags[k as PlatformKey] = issues;
  }
  const videoIssues = checkHumanizer(`${video.hook}\n${video.voiceover}`, 'longform');
  if (videoIssues.length) humanizerFlags.video = videoIssues;
  const now = Date.now();
  return {
    id: `${profile.id}-${planDay.date}`,
    date: planDay.date,
    siteId: profile.id,
    kind: 'daily',
    title: str(d.title) || planDay.topic,
    pillar: planDay.pillar,
    posts,
    video,
    article,
    status: 'draft',
    postedUrls: {},
    humanizerFlags,
    createdAt: now,
    updatedAt: now
  };
}

export interface GenerateProgress {
  done: number;
  total: number;
  message: string;
}

// Generates content for every plan day that doesn't have a calendar entry yet, so an interrupted run
// resumes where it stopped. Each batch is saved as soon as it arrives.
export async function generateContent(
  profile: SiteProfile,
  plan: SitePlan,
  keys: ApiKeys,
  settings: ModelSettings,
  onProgress: (p: GenerateProgress) => void,
  shouldStop: () => boolean,
  batchSize = 5
): Promise<number> {
  const existing = new Set((await getAllEntries()).filter(e => e.siteId === profile.id).map(e => e.id));
  const todo = plan.days.filter(d => !existing.has(`${profile.id}-${d.date}`));
  const total = plan.days.length;
  let done = total - todo.length;
  onProgress({ done, total, message: todo.length ? `Writing ${todo.length} days…` : 'All days already written.' });
  const voice = readVoiceSamples();

  for (let i = 0; i < todo.length; i += batchSize) {
    if (shouldStop()) break;
    const batch = todo.slice(i, i + batchSize);
    const daysText = batch.map(d => `Day ${d.day} (${d.date}) | theme: ${d.pillar} | topic: ${d.topic} | angle: ${d.angle}`).join('\n');
    const prompt = buildSpecialistPrompt(batchTemplate(batch.length), { profile: profileBlock(profile), days: daysText }, voice);
    onProgress({ done, total, message: `Writing days ${batch[0].day}-${batch[batch.length - 1].day} of ${total}…` });
    const raw = await generateText(prompt, keys, settings, maxTokensFor(settings), 0.85, { json: true });
    const parsed = parseJsonObject(raw);
    const list = Array.isArray(parsed.days) ? (parsed.days as Array<Record<string, unknown>>) : [];
    const entries: CalendarEntry[] = [];
    for (const planDay of batch) {
      const d = list.find(x => Number(x.day) === planDay.day) ?? list[batch.indexOf(planDay)];
      if (d) entries.push(toEntry(profile, planDay, d));
    }
    await putEntries(entries);
    done += entries.length;
    const missing = batch.length - entries.length;
    onProgress({ done, total, message: missing ? `${missing} day(s) in this batch came back empty; they'll be retried on the next run.` : `Saved ${done} of ${total} days.` });
  }
  return done;
}

// Rewrites one flagged piece with the humanizer (used from the calendar).
export async function rehumanize(text: string, issues: string[], keys: ApiKeys, settings: ModelSettings): Promise<string> {
  const out = tidyText(await generateText(buildRewritePrompt(text, issues, readVoiceSamples()), keys, settings, 4000, 0.8), 'longform');
  if (!out) throw new Error('The rewrite came back empty.');
  return out;
}

export const entriesToCsv = (entries: CalendarEntry[], siteName: (id: string) => string) => {
  const cols = ['date', 'site', 'title', 'status', ...PLATFORMS.map(p => p.key), 'videoHook', 'videoVoiceover', 'aiVideoPrompt'];
  const esc = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
  const rows = entries.map(e => [
    e.date, siteName(e.siteId), e.title, e.status,
    ...PLATFORMS.map(p => e.posts[p.key] || ''),
    e.video?.hook || '', e.video?.voiceover || '', e.video?.aiVideoPrompt || ''
  ].map(esc).join(','));
  return [cols.join(','), ...rows].join('\n');
};
