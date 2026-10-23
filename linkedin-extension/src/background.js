// Voxstar LinkedIn Reply Assistant — service worker (ES module).
// Makes the real LLM calls (user's own key) and runs the humanizer. It never posts anything:
// drafts go back to the content script, which only fills the comment box after the user approves.
//
// This is the SOURCE file. `npm run package:extension` bundles it (with the web app's own
// src/utils/ai.ts and humanizer.ts, and the Anthropic SDK) into ../background.js, so the extension and
// the web app share exactly the same provider code, humanizer rules and prompts. Edit this file, not
// the generated ../background.js.
import { generateText } from '../../src/utils/ai';
import { buildReplyPrompt, buildReplyHumanizePrompt, checkHumanizer, tidyText } from '../../src/utils/humanizer';

const DEFAULT_BRANDS = [
  { name: 'Voxstar', domain: 'voxstar.com', focus: 'AI automation consultancy for SMEs, business process automation, AI strategy for founders', enabled: true },
  { name: 'Voxstar AI', domain: 'voxstar.ai', focus: 'AI agents, autonomous workflows, LLMs in production, Automating Everything podcast', enabled: true },
  { name: 'Wiredvibe', domain: 'wiredvibeapp.com', focus: 'Focus and wellbeing soundscapes, binaural audio, productivity and deep work, mental performance', enabled: true },
  { name: 'AIToolboard', domain: 'aitoolboard.com', focus: 'AI tools directory, new AI tool launches, tool comparisons, AI productivity stacks', enabled: true },
  { name: 'ATL-Trust', domain: 'atl-trust.com', focus: 'AI trust, governance, safety, compliance, responsible AI and data privacy', enabled: true }
];

async function getConfig() {
  const cfg = await chrome.storage.local.get(['keys', 'settings', 'brands', 'voice', 'tone']);
  return {
    keys: cfg.keys || {},
    settings: cfg.settings || { provider: 'mock', model: '' },
    brands: (cfg.brands && cfg.brands.length ? cfg.brands : DEFAULT_BRANDS).filter(b => b.enabled !== false),
    voice: cfg.voice || '',
    tone: cfg.tone || 'insight'
  };
}

function parseFirstResult(raw) {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end <= start) throw new Error('The model did not return JSON. Try Regenerate.');
  const parsed = JSON.parse(raw.slice(start, end + 1));
  if (!Array.isArray(parsed) || !parsed[0]) throw new Error('The model returned an empty result. Try Regenerate.');
  return parsed[0];
}

async function humanize(post, reply, cfg) {
  const prompt = buildReplyHumanizePrompt(post, reply, checkHumanizer(reply, 'reply'), cfg.voice);
  const rewritten = tidyText(await generateText(prompt, cfg.keys, cfg.settings, 600, 0.9), 'reply');
  if (!rewritten) throw new Error('The model returned an empty rewrite.');
  return rewritten;
}

async function draft(post) {
  const cfg = await getConfig();
  const prompt = buildReplyPrompt([{ id: 'p1', author: post.author, text: post.text }], cfg.brands, cfg.tone, cfg.voice);
  const result = parseFirstResult(await generateText(prompt, cfg.keys, cfg.settings, 1200, 0.9));
  let reply = tidyText(result.reply || '', 'reply');
  let issues = reply ? checkHumanizer(reply, 'reply') : ['Empty reply'];
  // One automatic rewrite pass when the local check still finds AI tells.
  if (reply && issues.length) {
    reply = await humanize(post, reply, cfg);
    issues = checkHumanizer(reply, 'reply');
  }
  return {
    fitScore: Math.max(0, Math.min(100, Number(result.fitScore) || 0)),
    bestBrand: result.bestBrand || 'None',
    reason: result.reason || '',
    reply,
    issues
  };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const run = async () => {
    if (msg.type === 'draft') return { ok: true, ...(await draft(msg.post)) };
    if (msg.type === 'humanize') {
      const cfg = await getConfig();
      const reply = await humanize(msg.post, msg.reply, cfg);
      return { ok: true, reply, issues: checkHumanizer(reply, 'reply') };
    }
    if (msg.type === 'check') return { ok: true, issues: checkHumanizer(msg.reply || '', 'reply') };
    return { ok: false, error: 'Unknown request' };
  };
  run().then(sendResponse, err => sendResponse({ ok: false, error: err?.message || String(err) }));
  return true; // async response
});

// Fallback for when LinkedIn's layout changes and the per-post button can't be placed:
// select the post text, right-click → draft.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'voxstar-draft-selection',
    title: 'Draft Voxstar reply for selected text',
    contexts: ['selection'],
    documentUrlPatterns: ['https://www.linkedin.com/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'voxstar-draft-selection' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'draft-selection', text: info.selectionText || '' });
  }
});
