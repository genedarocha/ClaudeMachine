// VoxPress Creative Factory v2 — the in-app creative-production studio.
// This is the client-side core of the VoxPress v2 spec: Create / Transform / Adapt, run as a staged
// pipeline (concept → story bible → outline → draft → editorial → export) with human approval at each
// stage, on the user's own AI key. The spec's full production platform (PostgreSQL/FastAPI/marketplace/
// multi-agent) is a separate backend project; see docs/VOXPRESS.md for what is and isn't built here.
//
// Guardrails from the spec that this enforces in the prompts:
// - Human-in-the-loop: nothing proceeds to the next stage without the user approving.
// - Rights: Transform/Adapt require the user to confirm they own or are licensed for the source.
// - No impersonation of living creators; genres/styles only.
// - No fabricated sources, credentials or reviews; label uncertain facts.
// - No fake quality scores.

import { type ApiKeys, type ModelSettings, generateText } from './ai';
import { buildRewritePrompt, checkHumanizer, tidyText, readVoiceSamples } from './humanizer';

export type VoxMode = 'create' | 'transform' | 'adapt';

export interface VoxFormat {
  id: string;
  label: string;
  unit: string; // what a draft unit is called (chapter, scene, episode…)
  outlineLabel: string;
  description: string;
}

export const VOX_FORMATS: VoxFormat[] = [
  { id: 'book-nonfiction', label: 'Non-fiction / how-to book', unit: 'chapter', outlineLabel: 'Chapters', description: 'Guides, handbooks, technical and business books.' },
  { id: 'book-novel', label: 'Novel / fiction book', unit: 'chapter', outlineLabel: 'Chapters', description: 'Novels and long-form fiction.' },
  { id: 'childrens', label: "Children's book", unit: 'spread', outlineLabel: 'Spreads', description: 'Short illustrated children\'s story.' },
  { id: 'screenplay', label: 'Film / short screenplay', unit: 'scene', outlineLabel: 'Scenes', description: 'Feature or short film in screenplay format.' },
  { id: 'tv', label: 'TV pilot / episode', unit: 'scene', outlineLabel: 'Scenes', description: 'A single television episode.' },
  { id: 'stage', label: 'Stage play', unit: 'scene', outlineLabel: 'Scenes', description: 'Theatre manuscript with stage directions.' },
  { id: 'audio', label: 'Audio drama / podcast series', unit: 'episode', outlineLabel: 'Episodes', description: 'Scripted audio with narrator, dialogue and SFX cues.' },
  { id: 'course', label: 'Course / workbook', unit: 'lesson', outlineLabel: 'Lessons', description: 'Structured lessons with exercises.' }
];

export const voxFormat = (id: string) => VOX_FORMATS.find(f => f.id === id) || VOX_FORMATS[0];

export type Stage = 'brief' | 'concept' | 'bible' | 'outline' | 'draft' | 'editorial' | 'export';

export interface OutlineUnit {
  n: number;
  title: string;
  summary: string;
  draft?: string; // generated prose/script for this unit
}

export interface VoxProject {
  id: string;
  name: string;
  mode: VoxMode;
  formatId: string;
  // brief
  idea: string;
  audience: string;
  tone: string;
  lengthHint: string;
  sourceText: string; // for transform/adapt
  transformMode: 'preserve' | 'enhance' | 'transform';
  rightsConfirmed: boolean;
  humanize: boolean;
  // generated
  concept: string;
  bible: string;
  outline: OutlineUnit[];
  editorial: string;
  stage: Stage;
  createdAt: number;
  updatedAt: number;
}

const STORE = 'claude_machine_voxpress';

export const newProject = (): VoxProject => ({
  id: `vox-${Date.now().toString(36)}`,
  name: 'Untitled project',
  mode: 'create',
  formatId: 'book-nonfiction',
  idea: '',
  audience: '',
  tone: '',
  lengthHint: '',
  sourceText: '',
  transformMode: 'enhance',
  rightsConfirmed: false,
  humanize: false,
  concept: '',
  bible: '',
  outline: [],
  editorial: '',
  stage: 'brief',
  createdAt: Date.now(),
  updatedAt: Date.now()
});

export const loadProjects = (): VoxProject[] => {
  try {
    return JSON.parse(localStorage.getItem(STORE) || '[]');
  } catch {
    return [];
  }
};

export const saveProject = (p: VoxProject) => {
  const all = loadProjects().filter(x => x.id !== p.id);
  all.unshift({ ...p, updatedAt: Date.now() });
  try {
    localStorage.setItem(STORE, JSON.stringify(all.slice(0, 30)));
  } catch {
    try { localStorage.setItem(STORE, JSON.stringify(all.slice(0, 5))); } catch { /* full */ }
  }
};

export const deleteProject = (id: string) => {
  try { localStorage.setItem(STORE, JSON.stringify(loadProjects().filter(p => p.id !== id))); } catch { /* ignore */ }
};

// Condensed VoxPress operating rules, prepended to every stage prompt.
const SYSTEM = `You are VoxPress, Voxstar's AI publishing and creative-production studio. You produce professionally structured creative work, not generic AI filler. Operating rules:
- Work like a real studio: clear structure, consistent characters/world, publication-quality prose or script formatting.
- Never impersonate the distinctive style of a living, named author. Use genres and high-level styles only (noir, hard sci-fi, Victorian gothic, etc.).
- Never fabricate sources, statistics, credentials, quotes or reviews. If a fact needs checking, mark it [CHECK: ...].
- Never claim a work is production-ready; it is an AI-assisted draft for human review.
- For a Transform/Adapt job, only improve or adapt the material the user supplied and is authorised to use; do not invent new source facts.`;

const FORMAT_RULES: Record<string, string> = {
  screenplay: 'Use standard screenplay format: scene headings (INT./EXT. LOCATION – TIME), action in present tense, CHARACTER cues above dialogue, (parentheticals) sparingly, transitions like CUT TO: where useful.',
  tv: 'Use standard screenplay format with teaser/act structure where appropriate.',
  stage: 'Use stage-play format: ACT/SCENE headings, [stage directions in brackets/italics], CHARACTER NAME: dialogue, entrances and exits, light/sound cues.',
  audio: 'Use audio-script format: NARRATOR and CHARACTER cues, [SFX: ...], [MUSIC: ...], (emotion) directions, scene transitions.',
  childrens: 'Keep language simple and warm for young readers; one clear idea per spread; note [ILLUSTRATION: ...] for each spread.',
  course: 'Each lesson: learning objective, explanation, a worked example, a short exercise, and a one-line summary.'
};
const fmtRule = (id: string) => FORMAT_RULES[id] || 'Write in clean, well-structured prose with clear chapter/section headings.';

const briefBlock = (p: VoxProject) => {
  const f = voxFormat(p.formatId);
  const base = `Format: ${f.label}
Audience: ${p.audience || 'general'}
Tone: ${p.tone || 'appropriate to the format'}
Target length: ${p.lengthHint || 'sensible for the format'}`;
  if (p.mode === 'create') return `Idea:\n${p.idea}\n\n${base}`;
  return `Mode: ${p.mode} (${p.transformMode})
Target format: ${f.label}
The user has confirmed they own or are licensed to use the source material below.
${base}

Source material (user-supplied):
"""
${p.sourceText.slice(0, 24000)}
"""
${p.idea ? `\nAdditional direction: ${p.idea}` : ''}`;
};

const extractJson = (raw: string) => {
  const s = raw.indexOf('{');
  const e = raw.lastIndexOf('}');
  if (s === -1 || e <= s) throw new Error('The model did not return the expected JSON. Try the stage again.');
  try { return JSON.parse(raw.slice(s, e + 1)); } catch { throw new Error('The model returned malformed JSON (often a cut-off). Try again.'); }
};

const maxTokens = (settings: ModelSettings) => (settings.provider === 'anthropic' ? 8000 : 16000);

// --- Stage runners -------------------------------------------------------------------------------

export async function runConcept(p: VoxProject, keys: ApiKeys, settings: ModelSettings): Promise<string> {
  const prompt = `${SYSTEM}

# Task
Develop the concept for this project. ${p.mode === 'create' ? 'Shape the idea into a strong, specific concept.' : 'Base the concept strictly on the supplied source.'}

${briefBlock(p)}

# Output (markdown)
## Working title
## Logline (one sentence)
## Genre / subgenre
## Audience
## Themes (3-5 bullets)
## Tone
## Why it works (2-3 sentences)`;
  return generateText(prompt, keys, settings, 4000, 0.8);
}

export async function runBible(p: VoxProject, keys: ApiKeys, settings: ModelSettings): Promise<string> {
  const fiction = ['book-novel', 'childrens', 'screenplay', 'tv', 'stage', 'audio'].includes(p.formatId);
  const prompt = `${SYSTEM}

# Task
Write the Story Bible (the source of truth every later stage reads from).

# Concept so far
${p.concept}

${briefBlock(p)}

# Output (markdown)
## Premise
## Setting & world rules
${fiction ? `## Characters
For each main character: name, role, goal, motivation, flaw, arc. 3-6 characters.
## Relationships & conflict` : `## Key arguments / throughlines
## Reader takeaways`}
## Structure overview (acts or parts)
## Ending / resolution
## Continuity notes (names, dates, terminology to keep consistent)`;
  return generateText(prompt, keys, settings, maxTokens(settings), 0.8);
}

export async function runOutline(p: VoxProject, keys: ApiKeys, settings: ModelSettings): Promise<OutlineUnit[]> {
  const f = voxFormat(p.formatId);
  const prompt = `${SYSTEM}

# Task
Break the project into ${f.outlineLabel.toLowerCase()} based on the Story Bible. Each unit must advance the work and read from the bible for consistency.

# Story Bible
${p.bible}

${briefBlock(p)}

# Output
Return ONLY JSON: {"units": [{"n": 1, "title": "...", "summary": "2-3 sentences on what happens / is covered"}]}
Choose a sensible number of ${f.outlineLabel.toLowerCase()} for the target length (${p.lengthHint || 'typical for the format'}).`;
  const raw = await generateText(prompt, keys, settings, maxTokens(settings), 0.8, { json: true });
  const parsed = extractJson(raw);
  const units = Array.isArray(parsed.units) ? parsed.units : [];
  if (!units.length) throw new Error('The outline came back empty. Try again.');
  return units.map((u: Record<string, unknown>, i: number) => ({ n: Number(u.n) || i + 1, title: String(u.title || `${f.outlineLabel.slice(0, -1)} ${i + 1}`), summary: String(u.summary || '') }));
}

export async function runDraftUnit(p: VoxProject, unit: OutlineUnit, keys: ApiKeys, settings: ModelSettings): Promise<string> {
  const f = voxFormat(p.formatId);
  const prevTitles = p.outline.filter(u => u.n < unit.n).map(u => `${u.n}. ${u.title}`).join('\n') || 'none';
  const prompt = `${SYSTEM}

# Task
Write ${f.unit} ${unit.n}: "${unit.title}" in full. ${fmtRule(p.formatId)}
Stay consistent with the Story Bible. Do not summarise; write the actual ${f.unit}.

# Story Bible
${p.bible.slice(0, 8000)}

# This ${f.unit}
${unit.summary}

# Earlier ${f.outlineLabel.toLowerCase()} (for continuity, do not repeat)
${prevTitles}

${p.mode !== 'create' ? `# Source material the user is authorised to use\n"""\n${p.sourceText.slice(0, 12000)}\n"""\n` : ''}
# Output
The full ${f.unit}, starting with a heading. ${p.formatId === 'course' ? '' : 'Prose/script only, no author notes.'}`;
  let text = await generateText(prompt, keys, settings, maxTokens(settings), 0.85);
  text = tidyText(text, 'longform');
  if (p.humanize && settings.provider !== 'mock') {
    const issues = checkHumanizer(text, 'longform');
    if (issues.length) {
      const rewritten = tidyText(await generateText(buildRewritePrompt(text, issues, readVoiceSamples()), keys, settings, maxTokens(settings), 0.8), 'longform');
      if (rewritten && rewritten.length > text.length * 0.6) text = rewritten;
    }
  }
  return text;
}

export async function runEditorial(p: VoxProject, keys: ApiKeys, settings: ModelSettings): Promise<string> {
  const draftSample = p.outline.filter(u => u.draft).map(u => `## ${u.title}\n${(u.draft || '').slice(0, 2500)}`).join('\n\n').slice(0, 30000);
  const prompt = `${SYSTEM}

# Task
Give an honest editorial review of the draft so far. Be specific and useful; do not invent praise and do not give a fake percentage score.

# Draft (excerpts)
${draftSample || '(no drafted units yet)'}

# Output (markdown)
## Strengths
## Issues to fix (most important first)
## Continuity flags (names/dates/terms that may conflict)
## Facts to verify ([CHECK] items found)
## Suggested next steps`;
  return generateText(prompt, keys, settings, maxTokens(settings), 0.4);
}

// --- Export --------------------------------------------------------------------------------------

export function projectToMarkdown(p: VoxProject): string {
  const f = voxFormat(p.formatId);
  const parts = [
    `# ${p.name}`,
    `_${f.label} · ${p.mode} · AI-assisted draft (VoxPress). Review before use._`,
    '',
    p.concept ? `---\n\n## Concept\n\n${p.concept}` : '',
    p.bible ? `---\n\n## Story Bible\n\n${p.bible}` : '',
    '---',
    '## Manuscript',
    ...p.outline.map(u => `\n### ${u.n}. ${u.title}\n\n${u.draft || `_(not drafted yet)_\n\n${u.summary}`}`),
    p.editorial ? `\n---\n\n## Editorial review\n\n${p.editorial}` : ''
  ];
  return parts.filter(Boolean).join('\n\n');
}

export const STAGE_ORDER: Stage[] = ['brief', 'concept', 'bible', 'outline', 'draft', 'editorial', 'export'];
