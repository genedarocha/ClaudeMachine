import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Brain, FolderOpen, RefreshCw, Search, Loader2, AlertTriangle, ExternalLink, MessageSquare, Plus, Upload,
  Sparkles, Check, X, Lock, Eye, FileText, Terminal
} from 'lucide-react';
import { type ApiKeys, type ModelSettings, PROVIDER_NAMES } from '../utils/ai';
import {
  type BrainNote, type ProposedNote, type Visibility, brainSupported, pickBrainFolder, loadBrainHandle, ensurePermission, scanBrain,
  searchNotes, askBrain, proposeKnowledge, saveKnowledge, writeBrainFile, rebuildIndex, frontmatter, slugify, todayIso, fileToText
} from '../utils/secondBrain';
import { SafeMarkdown } from './SpecialistRunner';

// REAL, LOCAL: reads and writes markdown files in a folder on Gene's computer (File System Access API).
// Only the notes selected for a question or a distil request are sent to the AI provider. Collecting
// blogs needs the command-line collector (browsers can't fetch other sites), shown on this screen.

type Handle = Awaited<ReturnType<typeof loadBrainHandle>>;
type Tab = 'browse' | 'ask' | 'add';

interface SecondBrainStudioProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenSettings: () => void;
}

const GROUP_LABELS: Record<string, string> = {
  identity: 'Identity',
  projects: 'Projects',
  docs: 'Docs',
  lenses: 'Lenses'
};
const groupLabel = (g: string) => GROUP_LABELS[g] || g.replace(/^raw\//, 'Raw · ').replace(/^knowledge\//, 'Knowledge · ');

export const SecondBrainStudio: React.FC<SecondBrainStudioProps> = ({ keys, settings, onOpenSettings }) => {
  const [handle, setHandle] = useState<Handle>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [notes, setNotes] = useState<BrainNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('browse');
  const [group, setGroup] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  // Ask
  const [question, setQuestion] = useState('');
  const [includePrivate, setIncludePrivate] = useState(false);
  const [answer, setAnswer] = useState<{ text: string; used: BrainNote[] } | null>(null);
  const [asking, setAsking] = useState(false);
  // Distil
  const [proposals, setProposals] = useState<ProposedNote[] | null>(null);
  const [distilling, setDistilling] = useState(false);
  // Add
  const [docTitle, setDocTitle] = useState('');
  const [docText, setDocText] = useState('');
  const [docKind, setDocKind] = useState<'doc' | 'story' | 'take' | 'fact' | 'lesson'>('doc');
  const [docVisibility, setDocVisibility] = useState<Visibility>('private');
  const fileInput = useRef<HTMLInputElement>(null);

  const isDemo = settings.provider === 'mock';

  const load = useCallback(async (h: NonNullable<Handle>) => {
    setLoading(true);
    setError(null);
    try {
      setNotes(await scanBrain(h));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read the folder.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!brainSupported()) return;
    loadBrainHandle().then(async h => {
      if (!h) return;
      setHandle(h);
      if (await ensurePermission(h, false)) load(h);
      else setNeedsPermission(true);
    }).catch(() => {});
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const connect = async () => {
    try {
      const h = await pickBrainFolder();
      setHandle(h);
      setNeedsPermission(false);
      await load(h);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Could not open the folder.');
    }
  };

  const reconnect = async () => {
    if (!handle) return;
    if (await ensurePermission(handle, true)) {
      setNeedsPermission(false);
      load(handle);
    }
  };

  const refresh = async () => {
    if (!handle) return;
    await load(handle);
  };

  const groups = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of notes) map.set(n.group, (map.get(n.group) || 0) + 1);
    const order = ['identity', 'projects', 'knowledge', 'docs', 'lenses', 'raw'];
    return [...map.entries()].sort((a, b) => {
      const ia = order.indexOf(a[0].split('/')[0]); const ib = order.indexOf(b[0].split('/')[0]);
      return ia - ib || a[0].localeCompare(b[0]);
    });
  }, [notes]);

  const visible = useMemo(() => {
    const scoped = group === 'all' ? notes : notes.filter(n => n.group === group);
    return query.trim() ? searchNotes(scoped, query, 200).map(r => r.note) : scoped;
  }, [notes, group, query]);

  const selected = notes.find(n => n.path === selectedPath) ?? null;
  const totalWords = notes.reduce((s, n) => s + n.words, 0);

  const ask = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await askBrain(question, notes, { includePrivate, keys, settings });
      setAnswer({ text: res.answer, used: res.used });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The question failed.');
    } finally {
      setAsking(false);
    }
  };

  const distil = async () => {
    if (!selected) return;
    setDistilling(true);
    setError(null);
    setProposals(null);
    try {
      setProposals(await proposeKnowledge(selected, keys, settings));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not propose notes.');
    } finally {
      setDistilling(false);
    }
  };

  const saveProposals = async () => {
    if (!handle || !selected || !proposals) return;
    try {
      const written = await saveKnowledge(handle, selected, proposals);
      const fresh = await scanBrain(handle);
      setNotes(fresh);
      await rebuildIndex(handle, fresh);
      setProposals(null);
      setNotice(`Saved ${written.length} note${written.length === 1 ? '' : 's'} to knowledge/ and updated INDEX.md.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the notes.');
    }
  };

  const addDocument = async () => {
    if (!handle || !docText.trim()) return;
    const title = docTitle.trim() || docText.trim().split('\n')[0].slice(0, 70);
    const folder = docKind === 'doc' ? 'docs' : `knowledge/${docKind === 'story' ? 'stories' : `${docKind}s`}`;
    const name = docKind === 'doc' ? `${todayIso()}-${slugify(title)}.md` : `${docKind}-${todayIso().slice(0, 7)}-${slugify(title)}.md`;
    try {
      const path = await writeBrainFile(handle, `${folder}/${name}`, frontmatter({ title, type: docKind, date: todayIso(), visibility: docVisibility }) + `# ${title}\n\n${docText.trim()}\n`);
      const fresh = await scanBrain(handle);
      setNotes(fresh);
      await rebuildIndex(handle, fresh);
      setDocTitle('');
      setDocText('');
      setNotice(`Saved to ${path}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    }
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!handle || !files?.length) return;
    const saved: string[] = [];
    const failed: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const text = await fileToText(file);
        const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        saved.push(await writeBrainFile(handle, `docs/${todayIso()}-${slugify(title)}.md`,
          frontmatter({ title, type: 'doc', date: todayIso(), visibility: docVisibility, original_file: file.name }) + `# ${title}\n\n${text}\n`));
      } catch (err) {
        failed.push(err instanceof Error ? err.message : file.name);
      }
    }
    const fresh = await scanBrain(handle);
    setNotes(fresh);
    await rebuildIndex(handle, fresh);
    if (fileInput.current) fileInput.current.value = '';
    setNotice(`Added ${saved.length} document${saved.length === 1 ? '' : 's'} to docs/.`);
    if (failed.length) setError(failed.join(' '));
  };

  // --- Not connected ------------------------------------------------------------------------------
  if (!brainSupported()) {
    return (
      <div className="sb-container"><div className="sb-empty glass-panel">
        <Brain size={30} /><h2>Second Brain</h2>
        <p>This screen opens a folder on your computer, which needs Chrome or Edge on a desktop. Open Claude Machine there.</p>
      </div><style>{STYLES}</style></div>
    );
  }

  if (!handle || needsPermission) {
    return (
      <div className="sb-container animate-fade">
        <div className="sb-empty glass-panel">
          <Brain size={30} />
          <h2>Second Brain</h2>
          <p>Your writing and knowledge as plain markdown files in a private folder on this computer. Nothing is uploaded: this screen reads the files where they are, and only the notes picked for a question are sent to your AI.</p>
          {needsPermission
            ? <button className="btn btn-primary sb-btn" onClick={reconnect}><FolderOpen size={15} /> Reconnect to {handle?.name}</button>
            : <button className="btn btn-primary sb-btn" onClick={connect}><FolderOpen size={15} /> Open my second brain folder</button>}
          <p className="sb-muted">Choose <code>Documents/second-brain</code> and allow editing when Chrome asks. Chrome asks again once per session.</p>
          {error && <div className="sb-error"><AlertTriangle size={14} /> {error}</div>}
        </div>
        <style>{STYLES}</style>
      </div>
    );
  }

  // --- Connected ----------------------------------------------------------------------------------
  return (
    <div className="sb-container animate-fade">
      <header className="sb-header">
        <div>
          <h2><Brain size={22} /> Second Brain</h2>
          <p className="sb-sub">
            <FolderOpen size={12} /> {handle.name} · {notes.length} notes · {totalWords.toLocaleString('en-GB')} words · stays on this computer
          </p>
        </div>
        <div className="sb-row">
          <div className="sb-tabs">
            <button className={tab === 'browse' ? 'on' : ''} onClick={() => setTab('browse')}><FileText size={13} /> Browse</button>
            <button className={tab === 'ask' ? 'on' : ''} onClick={() => setTab('ask')}><MessageSquare size={13} /> Ask</button>
            <button className={tab === 'add' ? 'on' : ''} onClick={() => setTab('add')}><Plus size={13} /> Add</button>
          </div>
          <button className="btn btn-secondary sb-btn" onClick={refresh} disabled={loading}>{loading ? <Loader2 size={13} className="sb-spin" /> : <RefreshCw size={13} />} Rescan</button>
          <button className="sb-link" onClick={connect}>Change folder</button>
        </div>
      </header>

      {notice && <div className="sb-notice glass-panel"><Check size={14} /> {notice}</div>}
      {error && <div className="sb-error glass-panel"><AlertTriangle size={14} /> <span>{error}</span><button onClick={() => setError(null)}><X size={13} /></button></div>}

      {tab === 'browse' && (
        <div className="sb-body">
          <aside className="sb-side glass-panel">
            <div className="sb-search"><Search size={13} /><input placeholder="Search everything" value={query} onChange={e => setQuery(e.target.value)} /></div>
            <button className={`sb-group ${group === 'all' ? 'on' : ''}`} onClick={() => setGroup('all')}>All <span>{notes.length}</span></button>
            {groups.map(([g, c]) => (
              <button key={g} className={`sb-group ${group === g ? 'on' : ''}`} onClick={() => setGroup(g)}>{groupLabel(g)} <span>{c}</span></button>
            ))}
          </aside>
          <div className="sb-list glass-panel">
            {visible.length === 0 && <p className="sb-muted">{query ? 'No notes match.' : 'This folder has no notes yet.'}</p>}
            {visible.slice(0, 300).map(n => (
              <button key={n.path} className={`sb-item ${n.path === selectedPath ? 'on' : ''}`} onClick={() => { setSelectedPath(n.path); setProposals(null); }}>
                <strong>{n.title}</strong>
                <small>{groupLabel(n.group)}{n.date ? ` · ${n.date}` : ''}{n.visibility !== 'public' ? ` · ${n.visibility}` : ''}</small>
              </button>
            ))}
            {visible.length > 300 && <p className="sb-muted">Showing 300 of {visible.length}. Search to narrow down.</p>}
          </div>
          <article className="sb-note glass-panel">
            {!selected ? <p className="sb-muted">Pick a note to read it.</p> : (
              <>
                <h3>{selected.title}</h3>
                <div className="sb-chips">
                  <span>{selected.path}</span>
                  {selected.type && <span>{selected.type}</span>}
                  {selected.date && <span>{selected.date}</span>}
                  <span className={`vis-${selected.visibility}`}>{selected.visibility === 'private' ? <Lock size={10} /> : <Eye size={10} />} {selected.visibility}</span>
                  {selected.sourceUrl && <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={10} /> source</a>}
                </div>
                {selected.group.startsWith('raw') && (
                  <div className="sb-distil">
                    <button className="btn btn-secondary sb-btn" disabled={distilling || isDemo} onClick={distil}>
                      {distilling ? <Loader2 size={13} className="sb-spin" /> : <Sparkles size={13} />} Distil into knowledge notes
                    </button>
                    <span className="sb-muted">The AI proposes stories, takes, facts and lessons from this piece. Nothing is saved until you approve.</span>
                  </div>
                )}
                {proposals && (
                  <div className="sb-proposals">
                    {proposals.length === 0 && <p className="sb-muted">Nothing worth keeping was found.</p>}
                    {proposals.map((p, i) => (
                      <label key={i} className={`sb-proposal ${p.approved ? 'on' : ''}`}>
                        <input type="checkbox" checked={p.approved} onChange={() => setProposals(proposals.map((x, j) => (j === i ? { ...x, approved: !x.approved } : x)))} />
                        <div>
                          <strong><span className="sb-kind">{p.kind}</span> {p.title}</strong>
                          <textarea rows={3} value={p.body} onChange={e => setProposals(proposals.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} />
                          {p.quote && <blockquote>{p.quote}</blockquote>}
                        </div>
                      </label>
                    ))}
                    {proposals.length > 0 && (
                      <div className="sb-row">
                        <button className="btn btn-primary sb-btn" onClick={saveProposals}><Check size={13} /> Save {proposals.filter(p => p.approved).length} approved</button>
                        <button className="sb-link" onClick={() => setProposals(null)}>Discard</button>
                      </div>
                    )}
                  </div>
                )}
                <div className="sb-body-text"><SafeMarkdown text={selected.body} /></div>
              </>
            )}
          </article>
        </div>
      )}

      {tab === 'ask' && (
        <section className="sb-card glass-panel">
          <label className="sb-field">
            <span>Ask your second brain</span>
            <textarea rows={3} value={question} onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. What have I written about zero-trust for AI agents, and what's my position on monitoring?" />
          </label>
          <div className="sb-row">
            <button className="btn btn-primary sb-btn" disabled={asking || !question.trim() || isDemo} onClick={ask}>
              {asking ? <Loader2 size={14} className="sb-spin" /> : <MessageSquare size={14} />} Ask {PROVIDER_NAMES[settings.provider]}
            </button>
            <label className="sb-check"><input type="checkbox" checked={includePrivate} onChange={e => setIncludePrivate(e.target.checked)} /> Include private notes</label>
            {isDemo && <button className="sb-link" onClick={onOpenSettings}>Choose a real AI in Settings</button>}
          </div>
          <p className="sb-muted">Finds the most relevant notes (plus your identity files), sends only those, and asks for an answer that cites them and lists what's missing.</p>
          {answer && (
            <div className="sb-answer">
              <SafeMarkdown text={answer.text} />
              <details>
                <summary>{answer.used.length} notes were sent</summary>
                <ul>{answer.used.map(n => <li key={n.path}><button className="sb-link" onClick={() => { setSelectedPath(n.path); setTab('browse'); }}>{n.path}</button></li>)}</ul>
              </details>
            </div>
          )}
        </section>
      )}

      {tab === 'add' && (
        <div className="sb-add">
          <section className="sb-card glass-panel">
            <h3><Plus size={15} /> Write or paste a note</h3>
            <div className="sb-grid">
              <label className="sb-field"><span>Title</span><input value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="Optional: the first line is used if empty" /></label>
              <label className="sb-field"><span>Kind</span>
                <select value={docKind} onChange={e => setDocKind(e.target.value as typeof docKind)}>
                  <option value="doc">Document (docs/)</option>
                  <option value="story">Story: something that happened</option>
                  <option value="take">Take: an opinion you hold</option>
                  <option value="fact">Fact: a number or detail with its source</option>
                  <option value="lesson">Lesson: something you learned</option>
                </select>
              </label>
              <label className="sb-field"><span>Visibility</span>
                <select value={docVisibility} onChange={e => setDocVisibility(e.target.value as Visibility)}>
                  <option value="private">Private: only when I ask</option>
                  <option value="agents-only">Agents only: AI may use, never quote publicly</option>
                  <option value="public">Public: already published</option>
                </select>
              </label>
            </div>
            <label className="sb-field"><span>Text</span><textarea rows={10} value={docText} onChange={e => setDocText(e.target.value)} /></label>
            <button className="btn btn-primary sb-btn" disabled={!docText.trim()} onClick={addDocument}><Check size={13} /> Save to my second brain</button>
          </section>

          <section className="sb-card glass-panel">
            <h3><Upload size={15} /> Add documents</h3>
            <p className="sb-muted">Markdown, text, HTML, CSV or JSON files are saved into <code>docs/</code> with the visibility chosen above. PDF and Word files: save them as text or HTML first.</p>
            <input ref={fileInput} type="file" multiple accept=".md,.markdown,.txt,.html,.htm,.csv,.json" onChange={e => uploadFiles(e.target.files)} />
          </section>

          <section className="sb-card glass-panel">
            <h3><Terminal size={15} /> Collect from your websites and LinkedIn</h3>
            <p className="sb-muted">Browsers can't read other websites, so collecting runs on your Mac. In Terminal, from the Claude Machine folder:</p>
            <pre className="sb-code">node scripts/collect-second-brain.mjs</pre>
            <p className="sb-muted">Pulls new posts from genedarocha.com, atl-trust.com, the aitoolboard.com blog, voxstar.com, voxstar.ai and both Substacks. Already-collected posts are skipped. For LinkedIn, download your data (LinkedIn → Settings & Privacy → Data privacy → Get a copy of your data → Articles and Posts), then run:</p>
            <pre className="sb-code">node scripts/collect-second-brain.mjs --linkedin ~/Downloads/Basic_LinkedInDataExport_….zip</pre>
            <p className="sb-muted">Then press Rescan.</p>
          </section>
        </div>
      )}
      <style>{STYLES}</style>
    </div>
  );
};

const STYLES = `
  .sb-container { display: flex; flex-direction: column; gap: 14px; padding: 8px 4px 40px; }
  .sb-empty { max-width: 640px; margin: 40px auto; padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; color: var(--text-secondary); }
  .sb-empty h2 { margin: 0; color: var(--text-primary); font-family: var(--font-heading); }
  .sb-empty p { margin: 0; line-height: 1.55; }
  .sb-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
  .sb-header h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 4px; font-family: var(--font-heading); color: var(--text-primary); }
  .sb-sub { margin: 0; color: var(--text-muted); font-size: 0.82rem; display: flex; align-items: center; gap: 5px; }
  .sb-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .sb-tabs { display: inline-flex; border: 1px solid var(--border-glass); border-radius: 8px; overflow: hidden; }
  .sb-tabs button { background: none; border: none; color: var(--text-secondary); padding: 6px 12px; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
  .sb-tabs button.on { background: var(--primary); color: #fff; }
  .sb-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; padding: 7px 12px; }
  .sb-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .sb-link { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.8rem; padding: 0; text-align: left; }
  .sb-muted { color: var(--text-muted); font-size: 0.8rem; margin: 0; line-height: 1.5; }
  .sb-muted code, .sb-empty code { font-family: var(--font-mono); color: var(--accent); }
  .sb-notice { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: var(--success); font-size: 0.85rem; }
  .sb-error { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: var(--danger); font-size: 0.85rem; }
  .sb-error span { flex: 1; }
  .sb-error button { background: none; border: none; color: inherit; cursor: pointer; }
  .sb-body { display: grid; grid-template-columns: 220px 320px minmax(0, 1fr); gap: 12px; align-items: start; }
  .sb-side, .sb-list { padding: 10px; display: flex; flex-direction: column; gap: 2px; max-height: calc(100vh - 160px); overflow-y: auto; position: sticky; top: 8px; }
  .sb-search { display: flex; align-items: center; gap: 6px; border: 1px solid var(--border-glass); border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; color: var(--text-muted); }
  .sb-search input { background: none; border: none; outline: none; color: var(--text-primary); width: 100%; font-size: 0.82rem; }
  .sb-group { display: flex; justify-content: space-between; background: none; border: none; color: var(--text-secondary); font-size: 0.8rem; padding: 6px 8px; border-radius: 6px; cursor: pointer; text-align: left; }
  .sb-group span { color: var(--text-muted); font-family: var(--font-mono); font-size: 0.72rem; }
  .sb-group.on, .sb-group:hover { background: var(--bg-card-hover); color: var(--text-primary); }
  .sb-item { display: flex; flex-direction: column; gap: 2px; background: none; border: none; border-bottom: 1px solid var(--border-glass); padding: 7px 6px; text-align: left; cursor: pointer; color: var(--text-primary); }
  .sb-item strong { font-size: 0.8rem; font-weight: 500; }
  .sb-item small { font-size: 0.7rem; color: var(--text-muted); }
  .sb-item.on, .sb-item:hover { background: var(--bg-card-hover); }
  .sb-note { padding: 18px 22px; min-width: 0; }
  .sb-note h3 { margin: 0 0 8px; color: var(--text-primary); }
  .sb-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .sb-chips span, .sb-chips a { display: inline-flex; align-items: center; gap: 3px; font-size: 0.7rem; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--border-glass); color: var(--text-muted); font-family: var(--font-mono); text-decoration: none; }
  .sb-chips a { color: var(--primary); }
  .sb-chips .vis-private { color: var(--warning); border-color: var(--warning); }
  .sb-distil { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 12px; }
  .sb-proposals { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .sb-proposal { display: flex; gap: 10px; padding: 10px; border: 1px solid var(--border-glass); border-radius: 8px; opacity: 0.55; }
  .sb-proposal.on { opacity: 1; border-color: var(--border-glass-glow); }
  .sb-proposal > div { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .sb-proposal strong { font-size: 0.85rem; color: var(--text-primary); }
  .sb-proposal textarea, .sb-field input, .sb-field select, .sb-field textarea {
    background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 8px; padding: 7px 10px; font-family: var(--font-body); font-size: 0.85rem; resize: vertical;
  }
  .sb-proposal blockquote { margin: 0; padding-left: 10px; border-left: 3px solid var(--border-glass-glow); color: var(--text-muted); font-size: 0.78rem; font-style: italic; }
  .sb-kind { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); margin-right: 4px; }
  .sb-body-text { font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); }
  .sb-body-text a { color: var(--primary); }
  .sb-card { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
  .sb-card h3 { margin: 0; font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
  .sb-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
  .sb-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
  .sb-check { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-secondary); }
  .sb-answer { border: 1px solid var(--border-glass); border-radius: 8px; padding: 14px 18px; background: var(--bg-dark); }
  .sb-answer details { margin-top: 10px; font-size: 0.8rem; color: var(--text-muted); }
  .sb-answer ul { margin: 6px 0 0; padding-left: 18px; }
  .sb-add { display: flex; flex-direction: column; gap: 14px; }
  .sb-code { background: var(--bg-dark); border: 1px solid var(--border-glass); border-radius: 8px; padding: 8px 12px; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-primary); margin: 0; white-space: pre-wrap; word-break: break-all; }
  .sb-spin { animation: sb-spin 1s linear infinite; }
  @keyframes sb-spin { to { transform: rotate(360deg); } }
  @media (max-width: 1100px) { .sb-body { grid-template-columns: 1fr; } .sb-side, .sb-list { position: static; max-height: 320px; } }
`;
