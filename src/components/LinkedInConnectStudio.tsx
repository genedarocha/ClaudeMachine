import React, { useState, useEffect } from 'react';
import { UserPlus, Sparkles, Loader2, Copy, Check, ExternalLink, AlertTriangle, Trash2, Shield } from 'lucide-react';
import { type ApiKeys, type ModelSettings, generateText } from '../utils/ai';
import { checkHumanizer, tidyText, readVoiceSamples } from '../utils/humanizer';
import { DEFAULT_BYLINE } from '../data/newsletterDefaults';

// Assisted, human-in-the-loop LinkedIn connecting. It drafts a short personalised note for a person you
// paste in; YOU open LinkedIn and click Connect yourself. It never logs in, scrapes, or sends anything —
// automated/bulk connection requests break LinkedIn's User Agreement and get accounts restricted.

interface LinkedInConnectStudioProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenSettings: () => void;
}

interface Person {
  id: string;
  name: string;
  about: string; // headline / what they do / why connect
  note: string;
  issues: string[];
  copied: boolean;
  sent: boolean;
}

const ANGLES = [
  'Shared interest in AI / automation',
  'They work in security / governance (ATL-Trust, AlbionLM)',
  'They build or use AI tools (AIToolboard)',
  'Podcast listener / guest angle',
  'Fellow founder / UK tech',
  'Just a warm, genuine hello'
];

const STORE = 'claude_machine_li_connect';
const COUNT_KEY = 'claude_machine_li_connect_count';

const todayKey = () => new Date().toISOString().slice(0, 10);

export const LinkedInConnectStudio: React.FC<LinkedInConnectStudioProps> = ({ keys, settings, onOpenSettings }) => {
  const [people, setPeople] = useState<Person[]>(() => { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; } });
  const [paste, setPaste] = useState('');
  const [angle, setAngle] = useState(ANGLES[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentToday, setSentToday] = useState(0);

  const isDemo = settings.provider === 'mock';

  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(people.slice(0, 60))); } catch { /* full */ } }, [people]);
  useEffect(() => {
    try { const d = JSON.parse(localStorage.getItem(COUNT_KEY) || '{}'); setSentToday(d.date === todayKey() ? d.n : 0); } catch { /* ignore */ }
  }, []);

  const bumpCount = () => {
    const n = sentToday + 1;
    setSentToday(n);
    try { localStorage.setItem(COUNT_KEY, JSON.stringify({ date: todayKey(), n })); } catch { /* ignore */ }
  };

  // Splits a bulk paste into people. Separate each with a blank line or "---"; first line is the name.
  const parse = (raw: string): Person[] =>
    raw.split(/\n\s*(?:---+)?\s*\n/).map(b => b.trim()).filter(Boolean).map(block => {
      const [first, ...rest] = block.split('\n');
      return { id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, name: first.trim().slice(0, 80), about: rest.join(' ').trim(), note: '', issues: [], copied: false, sent: false };
    }).filter(p => p.name);

  const addPeople = () => {
    const added = parse(paste);
    if (!added.length) { setError('Paste at least one person (name on the first line).'); return; }
    setPeople(prev => [...added, ...prev]);
    setPaste('');
    setError(null);
  };

  const draftNote = async (person: Person): Promise<string> => {
    const prompt = `# Task
Write a LinkedIn connection-request note from Gene Da Rocha to the person below. This is sent when Gene clicks "Connect".

# Gene
${DEFAULT_BYLINE.replace(/\*\*/g, '')}

# The person
Name: ${person.name}
About: ${person.about || '(no details given)'}

# Angle
${angle}

# Rules
- Hard limit 280 characters (LinkedIn caps notes at 300; stay safely under).
- Warm, specific, human. Reference something real about them from "About" if given. Use their first name.
- No flattery clichés ("I was impressed by"), no pitch, no links, no hashtags, no emojis.
- British English. Sound like a real person typing, not a template.
- One short reason to connect, then a light invite. Do not ask for a call or sell anything.

# Output
Return ONLY the note text, nothing else.`;
    const voice = readVoiceSamples();
    const raw = await generateText(voice ? `${prompt}\n\n# Gene's writing style (match it)\n"""\n${voice.slice(0, 1500)}\n"""` : prompt, keys, settings, 400, 0.8);
    return tidyText(raw, 'reply').slice(0, 300);
  };

  const draftOne = async (id: string) => {
    if (isDemo) { onOpenSettings(); return; }
    setBusy(true); setError(null);
    try {
      const person = people.find(p => p.id === id)!;
      const note = await draftNote(person);
      setPeople(prev => prev.map(p => p.id === id ? { ...p, note, issues: checkHumanizer(note, 'reply'), copied: false } : p));
    } catch (e) { setError(e instanceof Error ? e.message : 'Draft failed.'); } finally { setBusy(false); }
  };

  const draftAll = async () => {
    if (isDemo) { onOpenSettings(); return; }
    setBusy(true); setError(null);
    try {
      for (const person of people.filter(p => !p.note && !p.sent)) {
        const note = await draftNote(person);
        setPeople(prev => prev.map(p => p.id === person.id ? { ...p, note, issues: checkHumanizer(note, 'reply') } : p));
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Draft failed.'); } finally { setBusy(false); }
  };

  const copy = async (p: Person) => {
    try { await navigator.clipboard.writeText(p.note); setPeople(prev => prev.map(x => x.id === p.id ? { ...x, copied: true } : x)); setTimeout(() => setPeople(prev => prev.map(x => x.id === p.id ? { ...x, copied: false } : x)), 1800); }
    catch { setError('Clipboard blocked — select the note and copy it manually.'); }
  };

  const editNote = (id: string, note: string) => setPeople(prev => prev.map(p => p.id === id ? { ...p, note: note.slice(0, 300), issues: checkHumanizer(note, 'reply') } : p));
  const remove = (id: string) => setPeople(prev => prev.filter(p => p.id !== id));
  const markSent = (id: string) => { setPeople(prev => prev.map(p => p.id === id ? { ...p, sent: true } : p)); bumpCount(); };

  return (
    <div className="lc-container animate-fade">
      <header className="lc-header">
        <div>
          <h2><UserPlus size={22} /> Connect 20 LinkedIn Newbies</h2>
          <p className="lc-sub">Paste people you want to connect with. The app writes a short, personal note for each. You open LinkedIn and click Connect yourself — it never logs in or sends anything.</p>
        </div>
        <div className="lc-counter">
          <strong>{sentToday}/20</strong>
          <span>marked sent today</span>
        </div>
      </header>

      <div className="lc-warn glass-panel">
        <Shield size={15} /> Keep it to about 20 connection requests a day and personalise each one. Automated or bulk connecting breaks LinkedIn's rules and gets accounts restricted — that's why you click Connect, not the app.
      </div>

      {error && <div className="lc-error glass-panel"><AlertTriangle size={14} /> <span>{error}</span><button onClick={() => setError(null)}>✕</button></div>}

      <section className="lc-card glass-panel">
        <div className="lc-row">
          <label className="lc-field lc-grow"><span>Add people (one per block; first line is the name, then their headline / why connect; separate with a blank line)</span>
            <textarea rows={4} value={paste} onChange={e => setPaste(e.target.value)} placeholder={'Jane Smith\nHead of Security at a UK bank, posts about AI governance\n\nTom Lee\nFounder, builds AI tools'} />
          </label>
        </div>
        <div className="lc-row">
          <label className="lc-field"><span>Angle for the notes</span>
            <select value={angle} onChange={e => setAngle(e.target.value)}>{ANGLES.map(a => <option key={a}>{a}</option>)}</select>
          </label>
          <button className="btn btn-secondary lc-btn" onClick={addPeople}>Add to list</button>
          <button className="btn btn-primary lc-btn" disabled={busy || !people.some(p => !p.note && !p.sent)} onClick={draftAll}>
            {busy ? <Loader2 size={14} className="lc-spin" /> : <Sparkles size={14} />} Draft notes for all
          </button>
          <a className="btn btn-secondary lc-btn" href="https://www.linkedin.com/search/results/people/" target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Find people on LinkedIn</a>
        </div>
        {isDemo && <p className="lc-muted">Pick a real AI in Settings to draft notes.</p>}
      </section>

      <div className="lc-list">
        {people.length === 0 && <p className="lc-muted">No one added yet. Find good people on LinkedIn, paste them above.</p>}
        {people.map(p => (
          <div key={p.id} className={`lc-person glass-panel ${p.sent ? 'sent' : ''}`}>
            <div className="lc-person-head">
              <div><strong>{p.name}</strong>{p.about && <small>{p.about}</small>}</div>
              <button className="lc-del" onClick={() => remove(p.id)}><Trash2 size={14} /></button>
            </div>
            {p.note ? (
              <>
                <textarea className="lc-note" rows={2} value={p.note} onChange={e => editNote(p.id, e.target.value)} />
                <div className="lc-row lc-meta">
                  <span className={`lc-len ${p.note.length > 280 ? 'over' : ''}`}>{p.note.length}/300</span>
                  {p.issues.length > 0 && <span className="lc-flag"><AlertTriangle size={11} /> {p.issues.join(' · ')}</span>}
                </div>
                <div className="lc-row">
                  <button className="btn btn-secondary lc-btn" onClick={() => copy(p)}>{p.copied ? <Check size={13} /> : <Copy size={13} />} Copy note</button>
                  <a className="btn btn-primary lc-btn" href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(p.name)}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> Open & Connect</a>
                  <button className="btn btn-secondary lc-btn" disabled={busy} onClick={() => draftOne(p.id)}>Redraft</button>
                  {!p.sent && <button className="lc-link" onClick={() => markSent(p.id)}>Mark sent</button>}
                </div>
              </>
            ) : (
              <button className="btn btn-primary lc-btn" disabled={busy || isDemo} onClick={() => draftOne(p.id)}>{busy ? <Loader2 size={13} className="lc-spin" /> : <Sparkles size={13} />} Draft note</button>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .lc-container { display: flex; flex-direction: column; gap: 14px; padding: 8px 4px 40px; }
        .lc-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
        .lc-header h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 4px; font-family: var(--font-heading); color: var(--text-primary); }
        .lc-sub { color: var(--text-secondary); max-width: 720px; margin: 0; font-size: 0.9rem; line-height: 1.5; }
        .lc-counter { text-align: center; } .lc-counter strong { display: block; font-size: 1.4rem; color: var(--primary); } .lc-counter span { font-size: 0.72rem; color: var(--text-muted); }
        .lc-warn { display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; font-size: 0.84rem; color: var(--text-secondary); border: 1px solid var(--warning); }
        .lc-error { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: var(--danger); font-size: 0.85rem; }
        .lc-error span { flex: 1; } .lc-error button { background: none; border: none; color: inherit; cursor: pointer; }
        .lc-card { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .lc-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; }
        .lc-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
        .lc-grow { flex: 1; } .lc-field.lc-grow textarea { width: 100%; box-sizing: border-box; }
        .lc-field textarea, .lc-field select, .lc-note { background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 8px; padding: 8px 10px; font-family: var(--font-body); font-size: 0.86rem; resize: vertical; }
        .lc-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 7px 12px; text-decoration: none; }
        .lc-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .lc-muted { color: var(--text-muted); font-size: 0.8rem; margin: 0; }
        .lc-list { display: flex; flex-direction: column; gap: 8px; }
        .lc-person { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
        .lc-person.sent { opacity: 0.6; }
        .lc-person-head { display: flex; justify-content: space-between; gap: 10px; }
        .lc-person-head strong { color: var(--text-primary); font-size: 0.9rem; display: block; }
        .lc-person-head small { color: var(--text-muted); font-size: 0.76rem; }
        .lc-del { background: none; border: none; color: var(--text-muted); cursor: pointer; } .lc-del:hover { color: var(--danger); }
        .lc-note { width: 100%; box-sizing: border-box; }
        .lc-meta { font-size: 0.74rem; }
        .lc-len { color: var(--text-muted); font-family: var(--font-mono); } .lc-len.over { color: var(--danger); }
        .lc-flag { color: var(--warning); display: inline-flex; align-items: center; gap: 3px; }
        .lc-link { background: none; border: none; color: var(--text-secondary); cursor: pointer; text-decoration: underline; font-size: 0.8rem; }
        .lc-spin { animation: lc-spin 1s linear infinite; } @keyframes lc-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
