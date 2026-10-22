// Advisor: a local health check of how the machine is being used (no AI call, always free and instant)
// plus an AI-written strategy review built from those facts and the site profiles.

import { type ApiKeys, type ModelSettings, generateGroundedText, generateText } from './ai';
import { buildSpecialistPrompt, readVoiceSamples } from './humanizer';
import { loadSiteProfiles } from '../data/siteProfiles';
import { getAllEntries, isoDate } from './contentStore';
import { loadNewsletterState } from './newsletterPipeline';
import { loadAgentRuns, loadAgencyIndex, RECOMMENDED_AGENT_IDS } from './agency';

const USAGE_KEY = 'claude_machine_usage';

export const recordViewUse = (view: string) => {
  try {
    const usage = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}') as Record<string, { count: number; last: number }>;
    usage[view] = { count: (usage[view]?.count || 0) + 1, last: Date.now() };
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch {
    // tracking is best-effort
  }
};

const loadUsage = (): Record<string, { count: number; last: number }> => {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

export interface HealthItem {
  level: 'action' | 'tip' | 'ok';
  title: string;
  detail: string;
  view?: string; // screen that fixes it
  siteId?: string;
}

// Screens that look functional but are still simulations (see ARCHITECTURE.md).
const DEMO_SCREENS: Record<string, string> = {
  voxstar: 'Voxstar Connect',
  'content-multiplier': 'Content Multiplier',
  'creation-idea': 'Idea',
  'creation-wiredvibe': 'Wiredvibe app (Creation)',
  'video-factory': 'Video Factory',
  'linkedin-comments': 'Linkedin-Comments (Top 100)'
};

const REAL_FEATURES: Record<string, string> = {
  agents: 'Agents',
  'youtube-builder': 'YouTube Channel Builder',
  'linkedin-replies': 'LinkedIn Comment Replies',
  newsletter: 'Weekly AI Automation Newsletter',
  calendar: 'Content Calendar',
  dashboard: 'Specialists (105 prompts)'
};

export async function computeHealth(keys: ApiKeys, settings: ModelSettings): Promise<{ items: HealthItem[]; facts: string }> {
  const items: HealthItem[] = [];
  const facts: string[] = [];
  const today = isoDate(new Date());
  const sites = loadSiteProfiles();
  const entries = await getAllEntries().catch(() => []);
  const usage = loadUsage();
  const runs = loadAgentRuns();
  const nl = loadNewsletterState();

  // AI setup
  const liveKeys = (['anthropic', 'gemini', 'openai', 'grok'] as const).filter(p => keys[p]);
  if (settings.provider === 'mock' || !liveKeys.length) {
    items.push({ level: 'action', title: 'No live AI connected', detail: 'Everything real in this machine needs a Claude, Gemini, ChatGPT or Grok key. Add one in Settings.' });
  } else if (!keys.gemini && !keys.openai) {
    items.push({ level: 'tip', title: 'Add a Gemini or ChatGPT key for news research', detail: 'The newsletter\'s live web search only works with Gemini or OpenAI. Claude and Grok still write everything else.' });
  }
  facts.push(`AI keys connected: ${liveKeys.join(', ') || 'none'}; default provider ${settings.provider} (${settings.model}).`);

  if (!readVoiceSamples().trim()) {
    items.push({ level: 'action', title: 'Add your voice samples', detail: 'Paste 3-5 of your real LinkedIn comments in LinkedIn Comment Replies → "Your voice". Every generator uses them to sound like you.', view: 'linkedin-replies' });
  }

  // Sites and calendar
  for (const s of sites) {
    const mine = entries.filter(e => e.siteId === s.id && e.kind === 'daily');
    const posted = mine.filter(e => e.status === 'posted').length;
    const overdue = mine.filter(e => e.date < today && e.status !== 'posted').length;
    facts.push(`${s.name}: profile ${s.description.trim() ? 'filled' : 'EMPTY'}; ${mine.length} days of content; ${posted} posted; ${overdue} past their date and not posted.`);
    if (!s.description.trim()) {
      items.push({ level: 'action', title: `${s.name} has no profile`, detail: 'Describe what it is and who it\'s for, then generate its 50 days.', view: 'site-content', siteId: s.id });
    } else if (mine.length === 0) {
      items.push({ level: 'action', title: `No content yet for ${s.name}`, detail: 'Its profile is ready. Press "Plan & write 50 days".', view: 'site-content', siteId: s.id });
    } else if (overdue > 0) {
      items.push({ level: 'action', title: `${overdue} ${s.name} posts are overdue`, detail: 'They\'re past their date and not marked posted. Post them or move on, and paste the live links back.', view: 'calendar' });
    }
    if (s.description.trim() && (!s.linkedinPageUrl || !s.facebookPageUrl)) {
      items.push({ level: 'tip', title: `Add ${s.name}'s company page links`, detail: 'With the LinkedIn and Facebook page URLs in the profile, the calendar\'s Open buttons go straight to the right page.', view: 'site-content', siteId: s.id });
    }
  }

  // Newsletter
  const nlEntries = entries.filter(e => e.kind === 'newsletter');
  const unlinked = nlEntries.filter(e => e.date <= today && !e.postedUrls.newsletter && !e.title.includes('drafts automatically'));
  if (unlinked.length) {
    items.push({ level: 'tip', title: 'Paste your published newsletter links', detail: `${unlinked.map(e => e.title.split(' — ')[0]).join(', ')} ${unlinked.length > 1 ? 'have' : 'has'} no LinkedIn URL on the calendar yet.`, view: 'calendar' });
  }
  if (nl.draft) items.push({ level: 'action', title: `Newsletter #${nl.setup.issueNumber} draft is waiting`, detail: 'Review it, add your own news, and publish.', view: 'newsletter' });
  facts.push(`Newsletter: next issue #${nl.setup.issueNumber}; last published ${nl.setup.lastPublishedDate}; draft waiting: ${nl.draft ? 'yes' : 'no'}.`);

  // Agents
  const usedAgents = new Set(runs.map(r => r.agentId));
  const index = await loadAgencyIndex().catch(() => null);
  const unusedRecommended = RECOMMENDED_AGENT_IDS.filter(id => !usedAgents.has(id))
    .map(id => index?.agents.find(a => a.id === id)?.name).filter(Boolean) as string[];
  facts.push(`Agents: ${runs.length} runs, ${usedAgents.size} different agents used (${[...new Set(runs.map(r => r.agentName))].join(', ') || 'none'}).`);
  if (unusedRecommended.length) {
    items.push({ level: runs.length ? 'tip' : 'action', title: `${unusedRecommended.length} recommended agents never used`, detail: `For example: ${unusedRecommended.slice(0, 5).join(', ')}.`, view: 'agents' });
  }

  // Feature use
  const unused = Object.entries(REAL_FEATURES).filter(([v]) => !usage[v]).map(([, name]) => name);
  if (unused.length) items.push({ level: 'tip', title: 'Real features you haven\'t opened', detail: unused.join(', ') + '.' });
  facts.push(`Screens opened (count): ${Object.entries(usage).map(([v, u]) => `${v} ${u.count}`).join(', ') || 'none tracked yet'}.`);
  const demoUsed = Object.keys(DEMO_SCREENS).filter(v => usage[v]);
  if (demoUsed.length) {
    items.push({ level: 'tip', title: 'Some screens you use are demos', detail: `${demoUsed.map(v => DEMO_SCREENS[v]).join(', ')} only simulate their output (nothing is generated or posted). Use Daily, Agents and the Calendar for real work.` });
  }

  if (!items.some(i => i.level === 'action')) items.unshift({ level: 'ok', title: 'Nothing urgent', detail: 'The machine is set up and producing. See the AI review below for growth ideas.' });
  return { items, facts: facts.join('\n') };
}

export async function generateAdvice(facts: string, keys: ApiKeys, settings: ModelSettings): Promise<string> {
  const sites = loadSiteProfiles().filter(s => s.description.trim());
  const index = await loadAgencyIndex().catch(() => null);
  const agentList = (index?.agents || [])
    .filter(a => ['marketing', 'sales', 'paid-media', 'product', 'strategy', 'support', 'finance'].includes(a.division))
    .map(a => `${a.name}: ${a.description.slice(0, 110)}`).join('\n');
  const canSearch = settings.provider === 'gemini' || settings.provider === 'openai';

  const template = `# Task
Act as a sharp, practical business adviser to Gene Da Rocha, solo founder of Voxstar Ltd. Review how he's using his content machine and his websites, and tell him what to do next to save time and make more money.

# Audience
Gene: a technical founder (AI architect) who wants direct advice, not theory. He has limited time.

# Facts about how the machine is used
{{facts}}

# His websites
{{sites}}

# Agents available in the machine (name: what it does)
{{agents}}

# Rules
- Base every point on the facts and profiles above${canSearch ? ', plus what you can find by searching the web for each website and its market. Cite what you find.' : '. You cannot browse, so say where you are assuming.'}
- Be specific: name the exact agent to use and the exact task to give it, the exact page to change, the exact offer to create.
- Don't invent traffic, revenue or conversion numbers. No guaranteed income claims; give realistic ranges only if you label them as estimates.
- Prioritise: what earns money or saves the most time first.
- Gene's sites include early-stage products; recommend validating demand before big builds.

# Output format
Markdown with these sections:
## The short version
Three sentences.
## What you're not using (and should)
Bullets: feature or agent, why it matters, first step.
## Put these agents to work
5-8 bullets: agent name, the exact task to paste in, which site it's for.
## Website improvements
For each website: 3 specific changes (conversion, SEO / AI-search visibility, trust), most valuable first.
## Ways to make more money
Ranked list. For each: idea, why it fits, effort (low/medium/high), first step this week.
## Your next 7 days
A day-by-day list, about 30-60 minutes a day.`;
  const prompt = buildSpecialistPrompt(template, {
    facts,
    sites: sites.map(s => `- ${s.name} (${s.url}): ${s.description} Audience: ${s.audience}`).join('\n'),
    agents: agentList || 'Agent list unavailable'
  }, '');

  if (canSearch) {
    try {
      const res = await generateGroundedText(prompt, keys, settings);
      const sources = res.sources.filter((s, i, arr) => arr.findIndex(x => x.url === s.url) === i).slice(0, 15);
      return `${res.text.trim()}\n\n## Sources the adviser looked at\n${sources.map(s => `- [${s.title || s.url}](${s.url})`).join('\n')}`;
    } catch {
      // Search unavailable for this model: fall back to advice without browsing (stated in the output).
      const text = await generateText(prompt.replace('plus what you can find by searching the web for each website and its market. Cite what you find.', 'You cannot browse this time, so say where you are assuming.'), keys, settings, 16000, 0.6);
      return `${text.trim()}\n\n_Web search wasn't available for this model, so this review is based on your profiles and usage only._`;
    }
  }
  return generateText(prompt, keys, settings, 16000, 0.6);
}
