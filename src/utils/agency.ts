// The Agency: 282 specialist agent prompts from https://github.com/msitarzewski/agency-agents (MIT),
// snapshotted into public/agency-agents by scripts/sync-agency-agents.mjs. The index is small and loaded
// once; each agent's full prompt is fetched only when it's opened or run.

import { type ApiKeys, type ModelSettings, runSpecialistStream, humanizeLongform } from './ai';
import { buildSpecialistPrompt, compileTagged, readVoiceSamples, tidyText } from './humanizer';
import { type SiteProfile } from '../data/siteProfiles';

export interface AgencyAgent {
  id: string;
  name: string;
  description: string;
  emoji: string;
  vibe: string;
  division: string;
  divisionLabel: string;
  color: string;
  source: string;
}

export interface AgencyIndex {
  source: string;
  license: string;
  commit: string;
  syncedAt: string;
  count: number;
  agents: AgencyAgent[];
}

// Agents most relevant to Gene's content and revenue work, shown first.
export const RECOMMENDED_AGENT_IDS = [
  'marketing__marketing-linkedin-content-creator',
  'marketing__marketing-social-media-strategist',
  'marketing__marketing-tiktok-strategist',
  'marketing__marketing-short-video-editing-coach',
  'marketing__marketing-twitter-engager',
  'marketing__marketing-content-creator',
  'marketing__marketing-multi-platform-publisher',
  'marketing__marketing-seo-specialist',
  'marketing__marketing-aeo-foundations',
  'marketing__marketing-ai-citation-strategist',
  'marketing__marketing-growth-hacker',
  'marketing__marketing-email-strategist',
  'marketing__marketing-podcast-strategist',
  'marketing__marketing-carousel-growth-engine',
  'sales__sales-offer-lead-gen-strategist',
  'sales__sales-outbound-strategist',
  'sales__sales-proposal-strategist',
  'paid-media__paid-media-paid-social-strategist',
  'paid-media__paid-media-creative-strategist',
  'product__product-trend-researcher',
  'product__product-feedback-synthesizer'
];

let indexPromise: Promise<AgencyIndex> | null = null;

export function loadAgencyIndex(): Promise<AgencyIndex> {
  indexPromise ??= fetch('/agency-agents/index.json').then(r => {
    if (!r.ok) throw new Error(`Could not load the agent library (${r.status}).`);
    return r.json() as Promise<AgencyIndex>;
  }).catch(err => {
    indexPromise = null; // allow a retry
    throw err;
  });
  return indexPromise;
}

const promptCache = new Map<string, string>();

export async function loadAgentPrompt(id: string): Promise<string> {
  const cached = promptCache.get(id);
  if (cached) return cached;
  const res = await fetch(`/agency-agents/${encodeURIComponent(id)}.md`);
  if (!res.ok) throw new Error(`Could not load this agent's instructions (${res.status}).`);
  const text = await res.text();
  promptCache.set(id, text);
  return text;
}

export const siteContext = (p: SiteProfile) => `Brand: ${p.name} (${p.url})
What it is: ${p.description}
Audience: ${p.audience}
Tone: ${p.tone}
Call to action: ${p.cta}
Only state facts about the brand that appear above.`;

export interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  task: string;
  provider: ModelSettings['provider'];
  model: string;
  siteId?: string;
  output: string;
  issues: string[] | null;
  at: number;
}

const RUNS_KEY = 'claude_machine_agent_runs';

export const loadAgentRuns = (): AgentRun[] => {
  try {
    return JSON.parse(localStorage.getItem(RUNS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveAgentRun = (run: AgentRun) => {
  const runs = [run, ...loadAgentRuns().filter(r => r.id !== run.id)].slice(0, 40);
  try {
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
  } catch {
    // storage full: keep fewer
    try { localStorage.setItem(RUNS_KEY, JSON.stringify(runs.slice(0, 10))); } catch { /* give up */ }
  }
};

// Runs an agent: its own instructions become the role, then optional brand context and the task.
// With humanize on, the humanizer's writing rules are appended and the result goes through the
// humanizer's check-and-rewrite pass.
export async function runAgent(opts: {
  agent: AgencyAgent;
  task: string;
  context: string;
  humanize: boolean;
  keys: ApiKeys;
  settings: ModelSettings;
  onChunk: (t: string) => void;
}): Promise<{ text: string; issues: string[] | null; rewriteError?: string }> {
  const agentPrompt = await loadAgentPrompt(opts.agent.id);
  const template = `# Your role
{{agentPrompt}}

# Context
{{context}}

# Task
{{task}}

# Output
- Deliver the finished work, ready to use. No questions back unless the task is impossible without an answer.`;
  const values = { agentPrompt, context: opts.context.trim() || 'None provided', task: opts.task.trim() };
  const voice = readVoiceSamples();
  const prompt = opts.humanize ? buildSpecialistPrompt(template, values, voice) : compileTagged(template, values);

  const fullText = await new Promise<string>((resolve, reject) => {
    runSpecialistStream(
      { id: opts.agent.id, name: opts.agent.name, category: opts.agent.divisionLabel, number: '#AG', icon: opts.agent.emoji, description: opts.agent.description, promptTemplate: prompt, inputs: [] },
      {},
      opts.keys,
      opts.settings,
      opts.onChunk,
      resolve,
      err => reject(new Error(err)),
      '',
      { raw: true }
    ).catch(reject);
  });

  if (!opts.humanize || opts.settings.provider === 'mock') return { text: fullText, issues: null };
  const result = await humanizeLongform(fullText, opts.keys, opts.settings, voice);
  return { text: tidyText(result.text, 'longform'), issues: result.issues, rewriteError: result.rewriteError };
}
