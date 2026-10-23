// Weekly AI Automation Newsletter: prompts, parsing, source checks and LinkedIn-ready formatting.
// The network calls live in ai.ts (generateGroundedText for research, generateText for writing).

import { type GroundedSource } from './ai';
import { NEWSLETTER_TITLE_PREFIX } from '../data/newsletterDefaults';

export interface NewsStory {
  id: string;
  headline: string;
  date: string;
  category: string;
  summary: string;
  whyItMatters: string;
  sources: GroundedSource[];
  // Set locally, not by the model:
  publisherConfirmed: boolean; // at least one cited source's site was among the pages the search tool returned
  inWindow: boolean; // story date falls inside the requested window (2 days' grace)
  selected: boolean;
}

export interface NewsletterImage {
  slot: string; // 'COVER' or the exact ### heading it belongs under
  prompt: string;
  seed: number;
}

export interface NewsletterDraft {
  subtitle: string;
  body: string; // markdown, AI-written part only (our news + recent news)
  images: NewsletterImage[];
}

export const formatLongDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

export const formatRange = (fromIso: string, toIso: string) => {
  const from = new Date(`${fromIso}T12:00:00`);
  const to = new Date(`${toIso}T12:00:00`);
  const sameYear = from.getFullYear() === to.getFullYear();
  const f = from.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }) });
  const t = to.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${f} to ${t}`;
};

// --- Step 1: research ------------------------------------------------------------------------------

export const buildResearchPrompt = (fromIso: string, toIso: string) => `# Task
Use web search to find the most important artificial intelligence news published between ${formatLongDate(fromIso)} and ${formatLongDate(toIso)}.

# Audience
A weekly LinkedIn newsletter for CTOs, engineers, founders, and security and governance people, mostly in the UK.

# Rules
- Search the web. Only include stories you found in search results that were published inside the date window.
- Every story needs at least one credible source: major outlets (Reuters, Bloomberg, FT, BBC, The Guardian, The Verge, TechCrunch, Wired, Ars Technica, The Information, CNBC), official company blogs or press releases, government or regulator sites.
- Cover a spread of themes: frontier labs and models, AI agents and automation, policy and regulation (US, UK, EU, China), chips, compute and data centres, funding and acquisitions, AI security and safety, enterprise adoption. A UK angle is welcome.
- Return 10 to 14 stories, most important first.
- Facts only, with names and numbers exactly as reported. If something is reported but not confirmed, say "reportedly". No rumours presented as fact.
- Use the real article URLs you found. Never invent or guess a URL.

# Output format
Return ONLY a JSON array, no prose before or after:
[{"headline": "[short headline]", "date": "[YYYY-MM-DD published]", "category": "[theme]", "summary": "[3-4 factual sentences]", "whyItMatters": "[1 sentence]", "sources": [{"title": "[publication: article title]", "url": "[article url]"}]}]`;

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
};

// Grounding chunks from Gemini carry the publisher domain as the title and a redirect URL, while OpenAI
// returns real article URLs — collect both forms so either provider can confirm a publisher.
const groundedHosts = (sources: GroundedSource[]) => {
  const hosts = new Set<string>();
  for (const s of sources) {
    const h = hostOf(s.url);
    if (h && !h.includes('vertexaisearch') && !h.includes('google.com')) hosts.add(h);
    const t = s.title.trim().toLowerCase().replace(/^www\./, '');
    if (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(t)) hosts.add(t);
  }
  return hosts;
};

const sameSite = (a: string, b: string) => a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);

export function parseStories(raw: string, grounded: GroundedSource[], fromIso: string, toIso: string): NewsStory[] {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end <= start) throw new Error('The research step did not return a story list. Try again.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new Error('The research step returned malformed JSON. Try again.');
  }
  if (!Array.isArray(parsed)) throw new Error('The research step did not return a list.');

  const hosts = groundedHosts(grounded);
  const from = new Date(`${fromIso}T00:00:00`).getTime() - 2 * 86400000;
  const to = new Date(`${toIso}T23:59:59`).getTime() + 86400000;

  return (parsed as Array<Record<string, unknown>>)
    .filter(s => typeof s.headline === 'string' && typeof s.summary === 'string')
    .map((s, i) => {
      const sources = (Array.isArray(s.sources) ? s.sources : [])
        .filter((x): x is GroundedSource => !!x && typeof (x as GroundedSource).url === 'string')
        .map(x => ({ title: String(x.title || hostOf(x.url)), url: x.url }));
      const publisherConfirmed = sources.some(src => {
        const h = hostOf(src.url);
        return !!h && [...hosts].some(g => sameSite(h, g));
      });
      const time = new Date(`${String(s.date)}T12:00:00`).getTime();
      const inWindow = !Number.isNaN(time) && time >= from && time <= to;
      return {
        id: `story-${i}-${Math.random().toString(36).slice(2, 7)}`,
        headline: String(s.headline),
        date: String(s.date || ''),
        category: String(s.category || ''),
        summary: String(s.summary),
        whyItMatters: String(s.whyItMatters || ''),
        sources,
        publisherConfirmed,
        inWindow,
        selected: publisherConfirmed && inWindow
      };
    });
}

// --- Step 2: writing -------------------------------------------------------------------------------

export const storiesForPrompt = (stories: NewsStory[]) =>
  stories.map((s, i) => `${i + 1}. ${s.headline} (${s.date}, ${s.category})
${s.summary}
Why it matters: ${s.whyItMatters}
Sources: ${s.sources.map(x => x.title).join('; ')}`).join('\n\n');

// A structured template ({{placeholders}} become <tags>); buildSpecialistPrompt appends the humanizer rules.
// Format: Gene's newsletter, restyled after Future Tools (welcome hook, a POV lead story, bold lead-ins,
// tool spotlights, quick hits, podcast slot, friendly wrap), keeping Gene's own brand sections.
export const buildWriteTemplate = (issueNumber: number, fromIso: string, toIso: string) => `# Task
Write issue #${issueNumber} of Gene Da Rocha's weekly LinkedIn newsletter "AI AND AUTOMATION", with the same structure and voice as the last issue.

# Audience
About 860 subscribers: CTOs, engineers, founders, security and AI-governance people, mostly in the UK. Busy people who skim, so every section must be easy to scan.

# Rules
## Structure: use these exact ## headings, in this order
- "## WELCOME BACK": a 4-6 sentence hook built on the single most surprising or funny story of the week, ending with a wry one-line kicker. Then a line with only "Gene".
- "## GENE'S TAKE": one "### [headline phrased as a question]" on the most important story. 2-3 short paragraphs on what happened. Then the line "A few things make this more interesting than it looks:" followed by 3-5 bullet points. Then a paragraph starting "**My POV:**" with Gene's practitioner view (AI architecture, AI security, zero-trust, sovereign AI, automation) and one practical lesson for readers. Then a line with only "Gene".
- "## FIRST, SOME GOOD NEWS FROM OUR SIDE OF THE FENCE": one short paragraph per item in the Voxstar news, each starting with the bold site name and a colon (e.g. "**AIToolboard.com:** ..."). Only facts from the Voxstar news. If it says "None provided", leave this section out.
- "## THE BIG STORIES": first a line with exactly "${formatRange(fromIso, toIso)}". Then 4-6 stories, each "### [punchy headline]" followed by 2-3 short paragraphs that each start with a bold lead-in chosen from "**What happened:**", "**What changed:**", "**The numbers:**", "**Why it matters:**", "**Also:**", and always finishing with "**The bigger picture:**". End each story with a line "Via [publication names]".
- "## TOOLS WORTH TRYING": 1-2 things from the stories that readers can actually use now. Each: "### [action headline, e.g. 'Test DeepSeek's new faster model']", 1-2 sentences, the line "How you can use it:", 2-4 bullets, then "Pricing: [only if stated in the stories, otherwise 'see the provider's site']". If nothing in the stories is usable, leave this section out. Finish the section with the line "Looking for more? Browse the directory at [AIToolboard.com](https://aitoolboard.com)."
- "## QUICK HITS": 5-8 one-line bullets for the remaining stories, each starting with the **bold company or person name**.
- "## THIS WEEK ON THE PODCAST": only if the podcast notes aren't "None provided". "### [episode title]", 1-2 sentences, then the link from the notes as "[Listen and read the full article](url)".
- "## THAT'S A WRAP": 2-3 friendly sentences inviting readers to forward the issue and reply with what they want covered, ending "See you next week." Then a line with only "Gene".
## Facts
- Use ONLY facts in the stories below. Do not add any number, name, date or quote that isn't there.
- Keep "reportedly" wherever a story uses it.
- No links except the AIToolboard.com line and the podcast link. Sources are listed separately.
## Voice
- Match the last issue: direct, slightly wry, confident, British spelling, short paragraphs, short sentences mixed with longer ones.
- Write like a person talking to readers he knows ("Honestly, that was the warm-up act."), not a news agency.

# Output format
- First line: SUBTITLE: [3-6 word subtitle for this issue]
- Then the markdown body, starting with "## WELCOME BACK".
- Then a line containing only ===IMAGES===
- Then exactly 4 lines, each "[slot] | [image description]": the first slot is COVER, then the exact text of the GENE'S TAKE ### headline, then the exact text of two THE BIG STORIES ### headlines (without the ###).
- Image descriptions: a striking editorial illustration of the theme. No real people, no faces of public figures, no logos, no brand names, no text or lettering in the image.

# Last issue (style and structure reference)
{{lastIssue}}

# Voxstar news from Gene
{{ourNews}}

# Podcast episode to feature
{{podcast}}

# Stories to cover
{{stories}}`;

const IMAGE_STYLE = 'clean modern 3D render, soft studio lighting, white, silver and steel-blue palette, high detail, editorial magazine illustration, professional and tasteful, suitable for a business publication, objects and abstract technology rather than human bodies';

export function parseDraft(raw: string): NewsletterDraft {
  const [main, imagePart = ''] = raw.split(/^\s*===IMAGES===\s*$/m);
  const subtitleMatch = main.match(/^\s*SUBTITLE:\s*(.+)$/m);
  const subtitle = subtitleMatch ? subtitleMatch[1].trim().replace(/^["*]+|["*]+$/g, '') : '';
  const body = main.replace(/^\s*SUBTITLE:.*$/m, '').trim();
  if (!/^##\s/m.test(body)) throw new Error('The draft came back without the expected sections. Try again.');
  const images = imagePart
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.includes('|'))
    .slice(0, 4)
    .map((l, i) => {
      const [slot, ...rest] = l.split('|');
      return { slot: slot.trim().replace(/^#+\s*/, ''), prompt: rest.join('|').trim(), seed: Math.floor(Math.random() * 1e6) + i };
    })
    .filter(img => img.prompt);
  return { subtitle, body, images };
}

// Free AI image generation via Pollinations (no key, no account). The URL is the image; changing the
// seed gives a new variation. The free tier adds a small pollinations.ai watermark (nologo is ignored
// without a paid key) and allows about one image per 45 seconds per IP.
export const imageUrl = (img: NewsletterImage) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(`${img.prompt}. ${IMAGE_STYLE}`)}?width=1280&height=720&nologo=true&seed=${img.seed}`;

// --- Assembly + LinkedIn formatting ---------------------------------------------------------------

export const issueTitle = (issueNumber: number, subtitle: string) =>
  `Newsletter #${issueNumber} — ${NEWSLETTER_TITLE_PREFIX}${subtitle ? ` ${subtitle}` : ''}`;

export function sourcesMarkdown(stories: NewsStory[]): string {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const s of stories) {
    for (const src of s.sources) {
      if (seen.has(src.url)) continue;
      seen.add(src.url);
      lines.push(`- [${src.title.replace(/[[\]]/g, '')}](${src.url})`);
    }
  }
  return lines.length ? `## SOURCES\n${lines.join('\n')}` : '';
}

export function assembleArticle(opts: {
  byline: string;
  issueDateIso: string;
  body: string;
  sources: string;
  signature: string;
}): string {
  return [
    opts.byline,
    formatLongDate(opts.issueDateIso),
    opts.body,
    opts.sources,
    opts.signature
  ].filter(Boolean).join('\n\n');
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const inline = (s: string) =>
  escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');

// Images use crossorigin="anonymous" to match the image panel, so the browser reuses one cached
// download instead of asking the rate-limited image service twice.
// Minimal markdown → HTML for the preview and the LinkedIn clipboard (headings, paragraphs, bold,
// italics, links, bullet lists). Everything is escaped first, so model output can't inject markup.
export function markdownToHtml(md: string, imagesByHeading: Record<string, string> = {}): string {
  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(inline).join('<br>')}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list.length) out.push(`<ul>${list.map(li => `<li>${inline(li)}</li>`).join('')}</ul>`);
    list = [];
  };
  for (const rawLine of md.split('\n')) {
    const line = rawLine.trimEnd();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushPara();
      flushList();
      const level = Math.min(heading[1].length + 1, 4);
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      const img = imagesByHeading[heading[2].trim().toLowerCase()];
      if (img) out.push(`<p><img src="${escapeHtml(img)}" alt="" crossorigin="anonymous" style="max-width:100%;border-radius:8px"></p>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^\s*[-*]\s+/, ''));
      continue;
    }
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return out.join('\n');
}

// Plain-text version for the clipboard fallback and for editors that ignore HTML.
export const markdownToPlain = (md: string) =>
  md
    .replace(/^#{1,4}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1 ($2)');
