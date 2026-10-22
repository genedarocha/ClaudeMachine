import React, { useState, useEffect, useMemo } from 'react';
import {
  LogIn, ExternalLink, Copy, Check, Trash2, Plus, Sparkles, Loader2,
  ClipboardPaste, Target, MessageSquareReply, AlertTriangle, X, ShieldCheck, Wand2, Download
} from 'lucide-react';
import { type ApiKeys, type ModelSettings, generateText } from '../utils/ai';
import {
  type ReplyTone, TONE_LABELS, VOICE_STORAGE_KEY, buildReplyPrompt, buildReplyHumanizePrompt, checkHumanizer, tidyText
} from '../utils/humanizer';

// REAL vs MANUAL — read before extending:
// - Brand-fit scoring and reply drafting are real LLM calls via generateText() (user's BYOK key).
// - LinkedIn sign-in, finding stories, and posting the reply are done by the user in their own
//   LinkedIn tab. LinkedIn offers no API for reading the feed or commenting on other people's posts,
//   and logging in with captured credentials / scraping breaks LinkedIn's User Agreement and risks
//   the account. Nothing on this screen talks to linkedin.com except plain links that open new tabs.

interface BrandProfile {
  id: string;
  name: string;
  domain: string;
  focus: string;
  enabled: boolean;
}

interface StoryItem {
  id: string;
  url: string;
  author: string;
  text: string;
  addedAt: string;
  status: 'new' | 'scored' | 'posted' | 'skipped';
  fitScore?: number;
  bestBrand?: string;
  reason?: string;
  reply?: string;
  humanizerIssues?: string[];
}

const DEFAULT_BRANDS: BrandProfile[] = [
  { id: 'voxstar-com', name: 'Voxstar', domain: 'voxstar.com', focus: 'AI automation consultancy for SMEs, business process automation, AI strategy for founders', enabled: true },
  { id: 'voxstar-ai', name: 'Voxstar AI', domain: 'voxstar.ai', focus: 'AI agents, autonomous workflows, LLMs in production, Automating Everything podcast', enabled: true },
  { id: 'wiredvibe', name: 'Wiredvibe', domain: 'wiredvibeapp.com', focus: 'Focus and wellbeing soundscapes, binaural audio, productivity and deep work, mental performance', enabled: true },
  { id: 'aitoolboard', name: 'AIToolboard', domain: 'aitoolboard.com', focus: 'AI tools directory, new AI tool launches, tool comparisons, AI productivity stacks', enabled: true },
  { id: 'atl-trust', name: 'ATL-Trust', domain: 'atl-trust.com', focus: 'AI trust, governance, safety, compliance, responsible AI and data privacy', enabled: true }
];

const STORAGE_BRANDS = 'claude_machine_li_reply_brands';
const STORAGE_STORIES = 'claude_machine_li_reply_stories';
const STORAGE_TONE = 'claude_machine_li_reply_tone';
const STORAGE_VOICE = VOICE_STORAGE_KEY;

const loadJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const newId = () => `li-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// Splits a bulk paste into stories. Separate posts with a line containing only "---".
// The first linkedin.com URL in each block becomes the post link; a leading "Author:" line is optional.
const parseBulkPaste = (raw: string): Omit<StoryItem, 'id' | 'addedAt' | 'status'>[] =>
  raw
    .split(/\n\s*---+\s*\n/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const urlMatch = block.match(/https?:\/\/(?:www\.)?linkedin\.com\/\S+/i);
      const authorMatch = block.match(/^author:\s*(.+)$/im);
      const text = block
        .replace(urlMatch?.[0] ?? '', '')
        .replace(authorMatch?.[0] ?? '', '')
        .trim();
      return { url: urlMatch?.[0] ?? '', author: authorMatch?.[1]?.trim() ?? '', text };
    })
    .filter(s => s.text.length > 0);

const extractJsonArray = (raw: string): unknown[] => {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end <= start) throw new Error('The model did not return a JSON list. Try again or switch model.');
  const parsed = JSON.parse(raw.slice(start, end + 1));
  if (!Array.isArray(parsed)) throw new Error('The model response was not a list.');
  return parsed;
};

// Humanizer rules, prompts, check and cleanup all live in ../utils/humanizer (shared with the
// specialists and the Chrome extension). Replies use the strict 'reply' mode.
const tidyReply = (reply: string) => tidyText(reply, 'reply');

const LinkedInGlyph: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

interface LinkedInRepliesStudioProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenSettings: () => void;
}

export const LinkedInRepliesStudio: React.FC<LinkedInRepliesStudioProps> = ({ keys, settings, onOpenSettings }) => {
  const [brands, setBrands] = useState<BrandProfile[]>(() => loadJson(STORAGE_BRANDS, DEFAULT_BRANDS));
  const [stories, setStories] = useState<StoryItem[]>(() => loadJson(STORAGE_STORIES, [] as StoryItem[]));
  const [tone, setTone] = useState<ReplyTone>(() => loadJson(STORAGE_TONE, 'insight' as ReplyTone));
  const [pasteText, setPasteText] = useState('');
  const [newBrand, setNewBrand] = useState({ name: '', domain: '', focus: '' });
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(60);
  const [voiceSamples, setVoiceSamples] = useState<string>(() => loadJson(STORAGE_VOICE, ''));
  const [humanizingId, setHumanizingId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_BRANDS, JSON.stringify(brands)); }, [brands]);
  useEffect(() => { localStorage.setItem(STORAGE_STORIES, JSON.stringify(stories)); }, [stories]);
  useEffect(() => { localStorage.setItem(STORAGE_TONE, JSON.stringify(tone)); }, [tone]);
  useEffect(() => { localStorage.setItem(STORAGE_VOICE, JSON.stringify(voiceSamples)); }, [voiceSamples]);

  const enabledBrands = brands.filter(b => b.enabled);
  const isDemo = settings.provider === 'mock';
  const pendingCount = stories.filter(s => s.status === 'new').length;

  const sortedStories = useMemo(() => {
    const order = { scored: 0, new: 1, posted: 2, skipped: 3 } as const;
    return [...stories].sort((a, b) =>
      order[a.status] - order[b.status] || (b.fitScore ?? -1) - (a.fitScore ?? -1)
    );
  }, [stories]);

  const searchLinks = useMemo(() => enabledBrands.map(b => {
    const keywords = b.focus.split(',')[0].trim();
    return {
      brand: b.name,
      keywords,
      url: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keywords)}&sortBy=%22relevance%22`
    };
  }), [enabledBrands]);

  const handleAddStories = () => {
    const parsed = parseBulkPaste(pasteText);
    if (parsed.length === 0) {
      setError('Nothing to add — paste the post text (and its link) first.');
      return;
    }
    const now = new Date().toISOString();
    setStories(prev => [...parsed.map(p => ({ ...p, id: newId(), addedAt: now, status: 'new' as const })), ...prev]);
    setPasteText('');
    setError(null);
  };

  const handleScoreAndDraft = async (only?: StoryItem[]) => {
    const targets = only ?? stories.filter(s => s.status === 'new');
    if (targets.length === 0 || enabledBrands.length === 0) return;
    setIsScoring(true);
    setError(null);
    try {
      // Batches of 8 keep each response well inside output-token limits.
      for (let i = 0; i < targets.length; i += 8) {
        const batch = targets.slice(i, i + 8);
        const raw = await generateText(buildReplyPrompt(batch, enabledBrands, tone, voiceSamples), keys, settings, 4000, 0.9);
        const results = extractJsonArray(raw) as Array<Partial<StoryItem> & { id: string }>;
        const byId = new Map(results.map(r => [r.id, r]));
        const missing = batch.filter(s => !byId.has(s.id)).length;

        const scored: StoryItem[] = batch.filter(s => byId.has(s.id)).map(s => {
          const r = byId.get(s.id)!;
          const reply = tidyReply(r.reply || '');
          return {
            ...s,
            status: 'scored' as const,
            fitScore: Math.max(0, Math.min(100, Number(r.fitScore) || 0)),
            bestBrand: r.bestBrand || 'None',
            reason: r.reason || '',
            reply,
            humanizerIssues: reply ? checkHumanizer(reply) : []
          };
        });

        // One automatic rewrite pass for any draft the local check still flags.
        for (const item of scored) {
          if (item.reply && item.humanizerIssues?.length) {
            const rewritten = tidyReply(await generateText(buildReplyHumanizePrompt(item, item.reply, item.humanizerIssues, voiceSamples), keys, settings, 600, 0.9));
            if (rewritten) {
              item.reply = rewritten;
              item.humanizerIssues = checkHumanizer(rewritten);
            }
          }
        }

        const scoredById = new Map(scored.map(s => [s.id, s]));
        setStories(prev => prev.map(s => scoredById.get(s.id) ?? s));
        if (missing > 0) setError(`${missing} post(s) were not scored by the model — run again to retry them.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed.');
    } finally {
      setIsScoring(false);
    }
  };

  const handleHumanize = async (story: StoryItem) => {
    if (!story.reply) return;
    setHumanizingId(story.id);
    setError(null);
    try {
      const rewritten = tidyReply(await generateText(buildReplyHumanizePrompt(story, story.reply, checkHumanizer(story.reply), voiceSamples), keys, settings, 600, 0.9));
      if (!rewritten) throw new Error('The model returned an empty rewrite.');
      updateStory(story.id, { reply: rewritten, humanizerIssues: checkHumanizer(rewritten) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Humanize failed.');
    } finally {
      setHumanizingId(null);
    }
  };

  const updateStory = (id: string, patch: Partial<StoryItem>) =>
    setStories(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));

  const handleCopy = async (story: StoryItem) => {
    if (!story.reply) return;
    try {
      await navigator.clipboard.writeText(story.reply);
      setCopiedId(story.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError('Clipboard access was blocked by the browser — select the reply text and copy it manually.');
    }
  };

  const handleAddBrand = () => {
    if (!newBrand.name.trim() || !newBrand.focus.trim()) return;
    setBrands(prev => [...prev, { id: newId(), ...newBrand, enabled: true }]);
    setNewBrand({ name: '', domain: '', focus: '' });
  };

  return (
    <div className="lir-container animate-fade">
      <header className="lir-header">
        <div>
          <h2><MessageSquareReply size={22} /> LinkedIn Comment Replies</h2>
          <p className="lir-sub">
            Find popular posts in your own LinkedIn session, paste them here, and the AI ranks them by fit for your
            Voxstar brands and drafts a reply for each. You post the reply yourself — nothing is sent to LinkedIn automatically.
          </p>
        </div>
        <span className={`lir-model-pill ${isDemo ? 'warn' : ''}`} onClick={onOpenSettings} title="Change model in Settings">
          {isDemo ? 'Demo Mode — set a real model in Settings' : `${settings.provider} · ${settings.model}`}
        </span>
      </header>

      {error && (
        <div className="lir-error glass-panel">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button className="lir-icon-btn" onClick={() => setError(null)} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      <div className="lir-steps">
        {/* STEP 1 — LinkedIn session */}
        <section className="lir-card glass-panel">
          <h3><span className="lir-step">1</span> Sign in to LinkedIn</h3>
          <p className="lir-hint">Opens LinkedIn in a new tab using your normal browser login. This app never sees your LinkedIn password.</p>
          <a className="btn btn-primary lir-btn" href="https://www.linkedin.com/login" target="_blank" rel="noopener noreferrer">
            <LogIn size={14} /> Open LinkedIn sign-in
          </a>
          <div className="lir-ext">
            <strong><Download size={14} /> Draft replies inside LinkedIn (Chrome extension)</strong>
            <p className="lir-hint">
              Adds a <b>✨ Draft reply</b> button under every LinkedIn post. You approve, regenerate or reject the
              humanized draft, and Approve puts it in that post's comment box. You still press LinkedIn's Post button.
              It uses the AI key, brands and voice samples saved on this page.
            </p>
            <ol className="lir-hint lir-steps-list">
              <li>Download the extension and unzip it.</li>
              <li>In Chrome go to <code>chrome://extensions</code> and turn on <b>Developer mode</b> (top right).</li>
              <li>Click <b>Load unpacked</b> and choose the unzipped folder.</li>
              <li>Reload this page once (so it syncs), then refresh LinkedIn.</li>
            </ol>
            <a className="btn btn-secondary lir-btn" href="/voxstar-linkedin-extension.zip" download>
              <Download size={14} /> Download extension (.zip)
            </a>
          </div>
          <div className="lir-search-list">
            <span className="lir-label">Find popular posts per brand:</span>
            {searchLinks.map(l => (
              <a key={l.brand} className="lir-search-link" href={l.url} target="_blank" rel="noopener noreferrer">
                <LinkedInGlyph size={12} /> {l.brand}: “{l.keywords}” <ExternalLink size={11} />
              </a>
            ))}
            <a className="lir-search-link" href="https://www.linkedin.com/feed/" target="_blank" rel="noopener noreferrer">
              <LinkedInGlyph size={12} /> Your home feed <ExternalLink size={11} />
            </a>
          </div>
        </section>

        {/* STEP 2 — Brands */}
        <section className="lir-card glass-panel">
          <h3><span className="lir-step">2</span> <Target size={16} /> Brands to match against</h3>
          <div className="lir-brand-list">
            {brands.map(b => (
              <label key={b.id} className={`lir-brand ${b.enabled ? 'on' : ''}`}>
                <input
                  type="checkbox"
                  checked={b.enabled}
                  onChange={() => setBrands(prev => prev.map(x => (x.id === b.id ? { ...x, enabled: !x.enabled } : x)))}
                />
                <div className="lir-brand-text">
                  <strong>{b.name}</strong> <span className="lir-domain">{b.domain}</span>
                  <small>{b.focus}</small>
                </div>
                <button
                  className="lir-icon-btn"
                  title="Remove brand"
                  onClick={e => { e.preventDefault(); setBrands(prev => prev.filter(x => x.id !== b.id)); }}
                >
                  <Trash2 size={13} />
                </button>
              </label>
            ))}
          </div>
          <div className="lir-add-brand">
            <input placeholder="Brand name" value={newBrand.name} onChange={e => setNewBrand({ ...newBrand, name: e.target.value })} />
            <input placeholder="domain.com" value={newBrand.domain} onChange={e => setNewBrand({ ...newBrand, domain: e.target.value })} />
            <input className="lir-wide" placeholder="Topics it should match (comma separated)" value={newBrand.focus} onChange={e => setNewBrand({ ...newBrand, focus: e.target.value })} />
            <button className="btn btn-secondary lir-btn" onClick={handleAddBrand}><Plus size={14} /> Add</button>
          </div>
        </section>

        {/* VOICE — humanizer training */}
        <section className="lir-card glass-panel lir-span">
          <h3><ShieldCheck size={16} /> Your voice (humanizer)</h3>
          <p className="lir-hint">
            Paste 3–5 comments you've actually written on LinkedIn. Every reply is matched to your rhythm and wording,
            checked for AI tells (clichés, em dashes, “not X, it's Y”, praise openers…) and auto-rewritten once if it fails.
          </p>
          <textarea
            className="lir-paste"
            rows={4}
            value={voiceSamples}
            onChange={e => setVoiceSamples(e.target.value)}
            placeholder={"e.g. We tried exactly this with a logistics client last year. The model was fine, the handover to ops was the bit that broke...\n\nHonestly I think the eval step gets skipped because nobody owns it..."}
          />
        </section>

        {/* STEP 3 — Paste stories */}
        <section className="lir-card glass-panel lir-span">
          <h3><span className="lir-step">3</span> <ClipboardPaste size={16} /> Paste posts you found</h3>
          <p className="lir-hint">
            For each post: copy its link (⋯ → “Copy link to post”) and its text. Put <code>---</code> on its own line between posts.
            An optional <code>Author: Name</code> line helps the reply sound natural.
          </p>
          <textarea
            className="lir-paste"
            rows={7}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder={'https://www.linkedin.com/posts/...\nAuthor: Jane Smith\nMost companies are still treating AI agents like chatbots...\n---\nhttps://www.linkedin.com/posts/...\nAuthor: ...\n...'}
          />
          <div className="lir-row">
            <button className="btn btn-secondary lir-btn" onClick={handleAddStories}><Plus size={14} /> Add to queue</button>
            <select value={tone} onChange={e => setTone(e.target.value as ReplyTone)} className="lir-select">
              {(Object.keys(TONE_LABELS) as ReplyTone[]).map(t => <option key={t} value={t}>{TONE_LABELS[t]}</option>)}
            </select>
            <button
              className="btn btn-primary lir-btn"
              disabled={isScoring || pendingCount === 0 || enabledBrands.length === 0}
              onClick={() => handleScoreAndDraft()}
            >
              {isScoring ? <Loader2 size={14} className="lir-spin" /> : <Sparkles size={14} />}
              {isScoring ? 'Scoring…' : `Rank & draft replies (${pendingCount})`}
            </button>
          </div>
        </section>
      </div>

      {/* STEP 4 — Queue */}
      <section className="lir-queue">
        <div className="lir-queue-head">
          <h3><span className="lir-step">4</span> Review, copy, post</h3>
          <label className="lir-label">
            Highlight fit ≥ {minScore}
            <input type="range" min={0} max={100} step={5} value={minScore} onChange={e => setMinScore(Number(e.target.value))} />
          </label>
          {stories.length > 0 && (
            <button className="lir-link-btn" onClick={() => setStories(prev => prev.filter(s => s.status !== 'posted' && s.status !== 'skipped'))}>
              Clear posted & skipped
            </button>
          )}
        </div>

        {sortedStories.length === 0 && (
          <div className="lir-empty glass-panel">No posts in the queue yet. Find posts on LinkedIn (step 1) and paste them in step 3.</div>
        )}

        {sortedStories.map(s => {
          const strong = s.fitScore !== undefined && s.fitScore >= minScore;
          return (
            <article key={s.id} className={`lir-story glass-panel ${strong ? 'strong' : ''} status-${s.status}`}>
              <div className="lir-story-top">
                {s.fitScore !== undefined
                  ? <span className={`lir-score ${strong ? 'good' : 'weak'}`}>{s.fitScore}</span>
                  : <span className="lir-score pending">—</span>}
                <div className="lir-story-meta">
                  <strong>{s.author || 'Unknown author'}</strong>
                  {s.bestBrand && <span className="lir-brand-tag">{s.bestBrand}</span>}
                  <span className="lir-status">{s.status}</span>
                </div>
                <button className="lir-icon-btn" title="Remove" onClick={() => setStories(prev => prev.filter(x => x.id !== s.id))}>
                  <Trash2 size={14} />
                </button>
              </div>

              <p className="lir-story-text">{s.text.length > 320 ? `${s.text.slice(0, 320)}…` : s.text}</p>
              {s.reason && <p className="lir-reason">{s.reason}</p>}

              {s.status !== 'new' && (
                <textarea
                  className="lir-reply"
                  rows={4}
                  value={s.reply ?? ''}
                  placeholder="No reply drafted (low fit). Write one yourself or regenerate."
                  onChange={e => updateStory(s.id, { reply: e.target.value, humanizerIssues: checkHumanizer(e.target.value) })}
                />
              )}

              {s.reply && s.humanizerIssues && (
                s.humanizerIssues.length === 0
                  ? <span className="lir-human ok"><ShieldCheck size={13} /> Humanizer check passed</span>
                  : <span className="lir-human warn"><AlertTriangle size={13} /> {s.humanizerIssues.join(' · ')}</span>
              )}

              <div className="lir-row">
                <button className="btn btn-secondary lir-btn" disabled={!s.reply} onClick={() => handleCopy(s)}>
                  {copiedId === s.id ? <Check size={14} /> : <Copy size={14} />} {copiedId === s.id ? 'Copied' : 'Copy reply'}
                </button>
                {s.url
                  ? <a className="btn btn-secondary lir-btn" href={s.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Open post</a>
                  : <span className="lir-hint">No link pasted for this post</span>}
                <button className="btn btn-secondary lir-btn" disabled={!s.reply || humanizingId !== null || isScoring} onClick={() => handleHumanize(s)}>
                  {humanizingId === s.id ? <Loader2 size={14} className="lir-spin" /> : <Wand2 size={14} />} Humanize again
                </button>
                <button className="btn btn-secondary lir-btn" disabled={isScoring} onClick={() => handleScoreAndDraft([s])}>
                  <Sparkles size={14} /> {s.status === 'new' ? 'Draft' : 'Regenerate'}
                </button>
                {s.status !== 'posted' && (
                  <button className="lir-link-btn" onClick={() => updateStory(s.id, { status: 'posted' })}>I posted it</button>
                )}
                {s.status !== 'skipped' && s.status !== 'posted' && (
                  <button className="lir-link-btn" onClick={() => updateStory(s.id, { status: 'skipped' })}>Skip</button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <style>{`
        .lir-container { display: flex; flex-direction: column; gap: 20px; padding: 8px 4px 40px; }
        .lir-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .lir-header h2 { display: flex; align-items: center; gap: 10px; font-family: var(--font-heading); margin: 0 0 6px; color: var(--text-primary); }
        .lir-sub { color: var(--text-secondary); max-width: 760px; margin: 0; line-height: 1.5; font-size: 0.92rem; }
        .lir-model-pill { font-size: 0.78rem; font-family: var(--font-mono); padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border-glass); color: var(--text-secondary); cursor: pointer; white-space: nowrap; }
        .lir-model-pill.warn { border-color: var(--warning); color: var(--warning); }
        .lir-error { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1px solid var(--danger); color: var(--danger); font-size: 0.88rem; }
        .lir-error span { flex: 1; }
        .lir-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; }
        .lir-span { grid-column: 1 / -1; }
        .lir-card { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
        .lir-card h3, .lir-queue h3 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 1rem; color: var(--text-primary); }
        .lir-step { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 0.75rem; font-weight: 700; }
        .lir-hint { color: var(--text-muted); font-size: 0.8rem; margin: 0; line-height: 1.45; }
        .lir-hint code { font-family: var(--font-mono); color: var(--accent); }
        .lir-label { color: var(--text-secondary); font-size: 0.8rem; display: flex; align-items: center; gap: 8px; }
        .lir-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; padding: 7px 12px; text-decoration: none; }
        .lir-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .lir-search-list { display: flex; flex-direction: column; gap: 6px; }
        .lir-search-link { display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.82rem; text-decoration: none; }
        .lir-search-link:hover { color: var(--primary); }
        .lir-brand-list { display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto; }
        .lir-brand { display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px; border: 1px solid var(--border-glass); border-radius: 8px; cursor: pointer; opacity: 0.6; }
        .lir-brand.on { opacity: 1; border-color: var(--border-glass-glow); }
        .lir-brand-text { flex: 1; display: flex; flex-direction: column; gap: 2px; color: var(--text-primary); font-size: 0.86rem; }
        .lir-brand-text small { color: var(--text-muted); font-size: 0.75rem; }
        .lir-domain { color: var(--accent); font-family: var(--font-mono); font-size: 0.75rem; }
        .lir-add-brand { display: flex; flex-wrap: wrap; gap: 6px; }
        .lir-add-brand input, .lir-select, .lir-paste, .lir-reply {
          background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary);
          border-radius: 8px; padding: 7px 10px; font-family: var(--font-body); font-size: 0.85rem;
        }
        .lir-add-brand input { flex: 1 1 110px; min-width: 0; }
        .lir-add-brand .lir-wide { flex: 3 1 220px; }
        .lir-paste, .lir-reply { width: 100%; resize: vertical; line-height: 1.5; box-sizing: border-box; }
        .lir-reply { margin-top: 4px; }
        .lir-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .lir-icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; display: inline-flex; }
        .lir-icon-btn:hover { color: var(--danger); }
        .lir-link-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.8rem; text-decoration: underline; }
        .lir-link-btn:hover { color: var(--primary); }
        .lir-queue { display: flex; flex-direction: column; gap: 12px; }
        .lir-queue-head { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .lir-queue-head h3 { flex: 1; }
        .lir-empty { padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.88rem; }
        .lir-story { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; border-left: 3px solid var(--border-glass); }
        .lir-story.strong { border-left-color: var(--success); }
        .lir-story.status-posted, .lir-story.status-skipped { opacity: 0.55; }
        .lir-story-top { display: flex; align-items: center; gap: 12px; }
        .lir-story-meta { flex: 1; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; color: var(--text-primary); font-size: 0.88rem; }
        .lir-score { min-width: 38px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem; }
        .lir-score.good { background: var(--success-glow); color: var(--success); }
        .lir-score.weak { background: var(--bg-card-hover); color: var(--text-muted); }
        .lir-score.pending { border: 1px dashed var(--border-glass); color: var(--text-muted); }
        .lir-brand-tag { font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; background: var(--primary-glow); color: var(--primary); }
        .lir-status { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
        .lir-story-text { margin: 0; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; }
        .lir-reason { margin: 0; color: var(--text-muted); font-size: 0.78rem; font-style: italic; }
        .lir-ext { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border: 1px dashed var(--border-glass-glow); border-radius: 8px; }
        .lir-ext strong { display: inline-flex; align-items: center; gap: 6px; color: var(--text-primary); font-size: 0.86rem; }
        .lir-steps-list { padding-left: 18px; display: flex; flex-direction: column; gap: 2px; }
        .lir-human { display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; }
        .lir-human.ok { color: var(--success); }
        .lir-human.warn { color: var(--warning); }
        .lir-spin { animation: lir-spin 1s linear infinite; }
        @keyframes lir-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
