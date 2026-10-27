// VoxPins: Pinterest pin research → sellable PDF product pipeline.
//
// REAL vs MANUAL — read before extending:
// - All research, pin-idea, PDF-outline and listing-copy generation are REAL LLM calls via
//   generateText() using the user's own BYOK key. Nothing here fakes a model response.
// - PinClicks (https://www.pinclicks.com) is a third-party Pinterest keyword/pin research tool; we
//   link out to it so the user can pull real search-volume data. We do NOT call it or scrape it —
//   there is no Pinterest API wired in here, and we never claim live Pinterest numbers we don't have.
// - "Export PDF" uses the browser's own print-to-PDF (window.print on a formatted page); "Download"
//   writes a real .md / .json file from the Blob API. Both are genuine local file operations.

import { type ApiKeys, type ModelSettings, generateText } from './ai';

export interface PinResearchInput {
  niche: string;          // e.g. "cozy home office setups"
  audience: string;       // e.g. "remote workers, women 25-45"
  goal: string;           // e.g. "sell a printable planner on Etsy"
  season?: string;        // optional seasonal angle, e.g. "autumn / back to work"
  boardName?: string;     // the Pinterest board the pins live on, e.g. "Voxstar"
  destinationUrl?: string;// where every pin points — your PDF / sales page on your site
}

export interface PinIdea {
  id: string;
  title: string;          // the pin title / hook
  overlayText: string;    // big text to put ON the image
  description: string;    // the pin description (SEO)
  format: string;         // e.g. "Static graphic", "Idea pin (multi-page)", "Infographic", "Video pin"
  keywords: string[];     // target search terms
  boardIdea: string;      // which board it belongs on
  destinationUrl: string; // the link this pin drives traffic to (your PDF / sales page)
}

export interface PdfProduct {
  title: string;
  subtitle: string;
  intro: string;
  sections: { heading: string; body: string }[];
  pins: PinIdea[];
}

// ---- Prompt builders ---------------------------------------------------------

const GUARDRAILS = `You are a careful Pinterest marketing strategist.
Rules:
- Be specific and practical. No fluff, no hype, no "game-changer" filler.
- Do NOT invent exact Pinterest search-volume numbers or impression stats; if a number matters,
  say "check in PinClicks" rather than fabricating a figure.
- Never suggest copying another creator's images, brand or copyrighted characters. Original work only.
- Follow Pinterest's spam policy: no misleading claims, no clickbait that the destination can't deliver.`;

export function buildResearchPrompt(input: PinResearchInput): string {
  return `${GUARDRAILS}

# Task
Research the BEST types of Pinterest pins to create for the brief below, so the user can later package the
best-performing angles into a PDF product to sell.

# Brief
- Niche / topic: ${input.niche}
- Target audience: ${input.audience}
- Goal: ${input.goal}
- Pinterest board: ${input.boardName || 'Voxstar'}
- Every pin points to: ${input.destinationUrl || '(a PDF / sales page on the user\'s own site — URL not set yet)'}
${input.season ? `- Seasonal angle: ${input.season}` : ''}

# Produce (Markdown, with these exact headings)
## Who is pinning this & what they want
## Winning pin formats for this niche
(For each: format name, why it works here, effort to make, and a realistic example title.)
## 10 high-intent keyword themes to target
(Plain phrases a real person would search. Note: tell the user to verify volume/competition in PinClicks.)
## Content angles that convert to a sale
(Angles that lead the pinner from the pin, to the "${input.boardName || 'Voxstar'}" board, to the PDF, to buying.)
## How to set up the "${input.boardName || 'Voxstar'}" board
(Board name, description and 3-5 sub-topics, all pointing traffic to the destination link.)
## What to avoid in this niche
## Fastest path to a first sellable PDF
Keep it tight and usable.`;
}

export function buildPinIdeasPrompt(input: PinResearchInput, count: number, researchNotes: string): string {
  return `${GUARDRAILS}

# Task
Generate ${count} concrete, ready-to-design Pinterest pin ideas for this brief.

# Brief
- Niche: ${input.niche}
- Audience: ${input.audience}
- Goal: ${input.goal}
- Board these pins live on: ${input.boardName || 'Voxstar'}
- Every pin links to: ${input.destinationUrl || '(the user\'s PDF / sales page — URL not set yet)'}
${input.season ? `- Season: ${input.season}` : ''}

# Research context
${researchNotes ? researchNotes.slice(0, 4000) : '(no prior research — use your own judgement)'}

# Output
Return ONLY a JSON object, no prose, no code fences, shaped exactly:
{"pins":[{"title":"","overlayText":"","description":"","format":"","keywords":["",""],"boardIdea":"","destinationUrl":""}]}
Where:
- title: the pin's hook (under 100 chars).
- overlayText: 3-6 words of bold text to place on the image.
- description: 1-2 sentences, keyword-rich but natural (Pinterest SEO), nudging toward the destination link.
- format: one of Static graphic / Infographic / Idea pin (multi-page) / Video pin / Checklist / Before-after.
- keywords: 2-4 search phrases.
- boardIdea: a sub-topic within the "${input.boardName || 'Voxstar'}" board this pin belongs on.
- destinationUrl: ${input.destinationUrl ? `exactly "${input.destinationUrl}"` : 'leave as empty string if no URL was given'}.
Return exactly ${count} pins.`;
}

export function buildPdfOutlinePrompt(input: PinResearchInput, pins: PinIdea[]): string {
  const pinList = pins.map((p, i) => `${i + 1}. ${p.title} [${p.format}] — ${p.overlayText}`).join('\n');
  return `${GUARDRAILS}

# Task
Turn these chosen pin ideas into the outline of a SELLABLE digital PDF product (a "pin pack" / mini-guide)
the user can sell on Etsy or their own site.

# Brief
- Niche: ${input.niche}
- Audience: ${input.audience}
- Goal / product: ${input.goal}
- Pinterest board: ${input.boardName || 'Voxstar'}
- Pins drive traffic to: ${input.destinationUrl || '(a PDF / sales page on the user\'s own site)'}

# Chosen pins
${pinList}

# Output
Return ONLY a JSON object, no prose, no code fences, shaped exactly:
{"title":"","subtitle":"","intro":"","sections":[{"heading":"","body":""}]}
- title: a sellable product name.
- subtitle: one line that states the promise.
- intro: a short welcome/how-to-use paragraph.
- sections: 4-7 sections that teach the buyer how to use these pins (strategy, design tips, posting
  cadence, keyword use, tracking). Each body 2-4 sentences. Do not just repeat the pin list.`;
}

export function buildListingPrompt(product: PdfProduct, input: PinResearchInput): string {
  return `${GUARDRAILS}

# Task
Write marketplace listing copy to SELL this PDF product.

# Product
- Title: ${product.title}
- Promise: ${product.subtitle}
- Niche: ${input.niche}, Audience: ${input.audience}

# Produce (Markdown)
## Etsy title
(140 chars max, front-loaded with the main keyword.)
## 13 Etsy tags
(comma separated, each ≤ 20 chars.)
## Etsy / shop description
(scannable, benefits first, short paragraphs + bullets, 1 clear call to action.)
## Suggested price range
(a range in GBP and USD, with a one-line reason — do not overpromise earnings.)
## 3 promo pin titles
(pins that advertise the product itself.)`;
}

// ---- Runners -----------------------------------------------------------------

function parseJsonLoose<T>(raw: string): T {
  let s = raw.trim();
  // strip ```json ... ``` fences if the model added them
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  // fall back to the first {...} block
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first > 0 || last < s.length - 1) s = s.slice(first, last + 1);
  return JSON.parse(s) as T;
}

export async function runResearch(input: PinResearchInput, keys: ApiKeys, settings: ModelSettings): Promise<string> {
  return generateText(buildResearchPrompt(input), keys, settings, 3000, 0.7);
}

export async function runPinIdeas(
  input: PinResearchInput, count: number, researchNotes: string, keys: ApiKeys, settings: ModelSettings
): Promise<PinIdea[]> {
  const raw = await generateText(buildPinIdeasPrompt(input, count, researchNotes), keys, settings, 3000, 0.8, { json: true });
  const parsed = parseJsonLoose<{ pins: Omit<PinIdea, 'id'>[] }>(raw);
  return (parsed.pins || []).map((p, i) => ({
    id: `pin-${Date.now()}-${i}`,
    title: p.title || '',
    overlayText: p.overlayText || '',
    description: p.description || '',
    format: p.format || 'Static graphic',
    keywords: Array.isArray(p.keywords) ? p.keywords : [],
    boardIdea: p.boardIdea || '',
    destinationUrl: p.destinationUrl || input.destinationUrl || ''
  }));
}

export async function runPdfOutline(
  input: PinResearchInput, pins: PinIdea[], keys: ApiKeys, settings: ModelSettings
): Promise<PdfProduct> {
  const raw = await generateText(buildPdfOutlinePrompt(input, pins), keys, settings, 3000, 0.7, { json: true });
  const parsed = parseJsonLoose<Omit<PdfProduct, 'pins'>>(raw);
  return {
    title: parsed.title || 'Pinterest Pin Pack',
    subtitle: parsed.subtitle || '',
    intro: parsed.intro || '',
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    pins
  };
}

export async function runListingCopy(product: PdfProduct, input: PinResearchInput, keys: ApiKeys, settings: ModelSettings): Promise<string> {
  return generateText(buildListingPrompt(product, input), keys, settings, 2500, 0.7);
}

// ---- Export helpers ----------------------------------------------------------

export function productToMarkdown(product: PdfProduct, input: PinResearchInput): string {
  const lines: string[] = [];
  lines.push(`# ${product.title}`);
  if (product.subtitle) lines.push(`\n_${product.subtitle}_`);
  lines.push(`\n> Niche: ${input.niche} · Audience: ${input.audience}\n`);
  if (product.intro) lines.push(`${product.intro}\n`);
  product.sections.forEach(s => {
    lines.push(`\n## ${s.heading}\n`);
    lines.push(s.body);
  });
  lines.push(`\n## The Pins\n`);
  product.pins.forEach((p, i) => {
    lines.push(`\n### ${i + 1}. ${p.title}`);
    lines.push(`- **Overlay text:** ${p.overlayText}`);
    lines.push(`- **Format:** ${p.format}`);
    lines.push(`- **Description:** ${p.description}`);
    lines.push(`- **Keywords:** ${p.keywords.join(', ')}`);
    lines.push(`- **Board:** ${input.boardName || 'Voxstar'} › ${p.boardIdea}`);
    if (p.destinationUrl) lines.push(`- **Links to:** ${p.destinationUrl}`);
  });
  lines.push(`\n---\n_Created with VoxPins · Claude Machine_`);
  return lines.join('\n');
}

export function downloadFile(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Open a print-ready window the user can "Save as PDF" from their browser print dialog.
export function printProductAsPdf(product: PdfProduct, input: PinResearchInput) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sections = product.sections.map(s => `<section><h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p></section>`).join('');
  const pins = product.pins.map((p, i) => `
    <div class="pin">
      <h3>${i + 1}. ${esc(p.title)}</h3>
      <p class="overlay">${esc(p.overlayText)}</p>
      <p><strong>Format:</strong> ${esc(p.format)}</p>
      <p>${esc(p.description)}</p>
      <p class="kw"><strong>Keywords:</strong> ${esc(p.keywords.join(', '))}</p>
      <p class="kw"><strong>Board:</strong> ${esc(input.boardName || 'Voxstar')} &rsaquo; ${esc(p.boardIdea)}</p>
      ${p.destinationUrl ? `<p class="kw"><strong>Links to:</strong> ${esc(p.destinationUrl)}</p>` : ''}
    </div>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(product.title)}</title>
  <style>
    body{font-family:Georgia,'Times New Roman',serif;color:#1a1a2e;max-width:720px;margin:40px auto;padding:0 24px;line-height:1.5;}
    h1{font-size:30px;margin-bottom:4px;} .sub{color:#b4257a;font-style:italic;font-size:17px;margin-top:0;}
    .meta{color:#666;font-size:13px;border-bottom:2px solid #eee;padding-bottom:12px;margin-bottom:20px;}
    h2{color:#b4257a;font-size:20px;margin-top:26px;} h3{font-size:16px;margin-bottom:2px;}
    .pin{border:1px solid #eee;border-radius:8px;padding:12px 16px;margin:12px 0;page-break-inside:avoid;}
    .overlay{font-weight:bold;font-size:18px;color:#1a1a2e;margin:4px 0;} .kw{font-size:13px;color:#555;}
    footer{margin-top:40px;color:#999;font-size:12px;text-align:center;}
    @media print{body{margin:0;}}
  </style></head><body>
  <h1>${esc(product.title)}</h1>
  <p class="sub">${esc(product.subtitle)}</p>
  <p class="meta">Niche: ${esc(input.niche)} · Audience: ${esc(input.audience)} · Board: ${esc(input.boardName || 'Voxstar')}${input.destinationUrl ? ` · Pins link to: ${esc(input.destinationUrl)}` : ''}</p>
  <p>${esc(product.intro)}</p>
  ${sections}
  <h2>The Pins</h2>
  ${pins}
  <footer>Created with VoxPins · Claude Machine</footer>
  <script>window.onload=function(){setTimeout(function(){window.print();},300);};</script>
  </body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}

export const PINCLICKS_URL = 'https://www.pinclicks.com/?ref=dave';
