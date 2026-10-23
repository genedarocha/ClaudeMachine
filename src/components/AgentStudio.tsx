import React, { useState, useEffect, useMemo } from 'react';
import {
  Bot, Search, Star, Play, Loader2, Copy, Check, CalendarPlus, ChevronDown, ChevronUp, ExternalLink, AlertTriangle, ShieldCheck, History
} from 'lucide-react';
import { type ApiKeys, type ModelSettings, DEFAULT_MODELS, PROVIDER_NAMES } from '../utils/ai';
import {
  type AgencyAgent, type AgencyIndex, type AgentRun, RECOMMENDED_AGENT_IDS, loadAgencyIndex, loadAgentPrompt, runAgent, siteContext, loadAgentRuns, saveAgentRun
} from '../utils/agency';
import { loadSiteProfiles } from '../data/siteProfiles';
import { putEntries, isoDate, addDays } from '../utils/contentStore';
import { SafeMarkdown } from './SpecialistRunner';

// REAL: each run is a live LLM call with the chosen agent's full instructions, on the provider picked
// here (Claude, Gemini, ChatGPT or Grok). Output can be saved to the Content Calendar as an item.

interface AgentStudioProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenSettings: () => void;
  onOpenCalendar: (entryId?: string) => void;
  initialAgentId?: string | null;
}

const PROVIDERS = ['anthropic', 'gemini', 'openai', 'grok'] as const;

export const AgentStudio: React.FC<AgentStudioProps> = ({ keys, settings, onOpenSettings, onOpenCalendar, initialAgentId }) => {
  const sites = useMemo(() => loadSiteProfiles(), []);
  const [index, setIndex] = useState<AgencyIndex | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [division, setDivision] = useState<string>('recommended');
  const [selectedId, setSelectedId] = useState<string | null>(initialAgentId ?? null);
  const [instructions, setInstructions] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [task, setTask] = useState('');
  const [siteId, setSiteId] = useState<string>('');
  const [extraContext, setExtraContext] = useState('');
  const [humanize, setHumanize] = useState(true);
  const [provider, setProvider] = useState<ModelSettings['provider']>(settings.provider === 'mock' ? 'anthropic' : settings.provider);
  const [model, setModel] = useState(settings.provider === 'mock' ? DEFAULT_MODELS.anthropic : settings.model);
  const [output, setOutput] = useState('');
  const [issues, setIssues] = useState<string[] | null>(null);
  const [phase, setPhase] = useState<'idle' | 'running'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [calDate, setCalDate] = useState(() => addDays(isoDate(new Date()), 1));
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>(loadAgentRuns);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadAgencyIndex().then(setIndex).catch(err => setLoadError(err instanceof Error ? err.message : String(err)));
  }, []);

  useEffect(() => {
    if (initialAgentId) setSelectedId(initialAgentId);
  }, [initialAgentId]);

  const selected = index?.agents.find(a => a.id === selectedId) ?? null;

  useEffect(() => {
    setInstructions('');
    setShowInstructions(false);
    if (!selected) return;
    loadAgentPrompt(selected.id).then(setInstructions).catch(err => setError(err instanceof Error ? err.message : String(err)));
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const divisions = useMemo(() => {
    const map = new Map<string, { label: string; color: string; count: number }>();
    for (const a of index?.agents || []) {
      const d = map.get(a.division) || { label: a.divisionLabel, color: a.color, count: 0 };
      d.count++;
      map.set(a.division, d);
    }
    return [...map.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label));
  }, [index]);

  const filtered = useMemo(() => {
    const all = index?.agents || [];
    const q = query.trim().toLowerCase();
    let list = division === 'recommended'
      ? RECOMMENDED_AGENT_IDS.map(id => all.find(a => a.id === id)).filter((a): a is AgencyAgent => !!a)
      : division === 'all' ? all : all.filter(a => a.division === division);
    if (q) list = (division === 'recommended' ? all : list).filter(a => `${a.name} ${a.description} ${a.divisionLabel}`.toLowerCase().includes(q));
    return list;
  }, [index, division, query]);

  const usedIds = useMemo(() => new Set(runs.map(r => r.agentId)), [runs]);
  const hasKey = provider !== 'mock' && !!keys[provider as keyof ApiKeys];
  const runSettings: ModelSettings = { provider, model: model.trim() || DEFAULT_MODELS[provider] };

  const run = async () => {
    if (!selected || !task.trim()) return;
    setError(null);
    setOutput('');
    setIssues(null);
    setSavedEntryId(null);
    setPhase('running');
    const site = sites.find(s => s.id === siteId);
    const context = [site ? siteContext(site) : '', extraContext.trim()].filter(Boolean).join('\n\n');
    try {
      let streamed = '';
      const result = await runAgent({
        agent: selected, task, context, humanize, keys, settings: runSettings,
        onChunk: t => { streamed += t; setOutput(streamed); }
      });
      setOutput(result.text);
      setIssues(result.issues);
      if (result.rewriteError) setError(result.rewriteError);
      const entry: AgentRun = {
        id: `run-${Date.now()}`, agentId: selected.id, agentName: selected.name, task, provider, model: runSettings.model,
        siteId: siteId || undefined, output: result.text, issues: result.issues, at: Date.now()
      };
      saveAgentRun(entry);
      setRuns(loadAgentRuns());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The agent run failed.');
    } finally {
      setPhase('idle');
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('The browser blocked the clipboard. Select the text and copy it manually.');
    }
  };

  const addToCalendar = async () => {
    if (!selected || !output) return;
    const id = `agent-${selected.id}-${Date.now()}`;
    const title = task.trim().split('\n')[0].slice(0, 80);
    const now = Date.now();
    try {
      await putEntries([{
        id, date: calDate, siteId: siteId || 'agent', kind: 'agent', agentName: selected.name, title,
        posts: { site: output }, article: { title, body: output }, status: 'draft', postedUrls: {}, createdAt: now, updatedAt: now
      }]);
      setSavedEntryId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save to the calendar.');
    }
  };

  const loadRun = (r: AgentRun) => {
    setSelectedId(r.agentId);
    setTask(r.task);
    setOutput(r.output);
    setIssues(r.issues);
    setSiteId(r.siteId || '');
    setShowHistory(false);
  };

  return (
    <div className="ag-container animate-fade">
      <header className="ag-header">
        <div>
          <h2><Bot size={22} /> Agents</h2>
          <p className="ag-sub">
            {index ? `${index.count} specialist agents` : 'Specialist agents'} from <a href="https://github.com/msitarzewski/agency-agents" target="_blank" rel="noopener noreferrer">The Agency</a> (MIT licence).
            Pick one, give it a task and your brand, and run it on Claude, Gemini, ChatGPT or Grok. Save the result to the Content Calendar.
          </p>
        </div>
        <button className="btn btn-secondary ag-btn" onClick={() => setShowHistory(!showHistory)}><History size={14} /> Recent runs ({runs.length})</button>
      </header>

      {loadError && <div className="ag-error glass-panel"><AlertTriangle size={15} /> {loadError}</div>}

      {showHistory && (
        <section className="ag-card glass-panel">
          {runs.length === 0 && <p className="ag-muted">No runs yet.</p>}
          {runs.map(r => (
            <button key={r.id} className="ag-run-row" onClick={() => loadRun(r)}>
              <span>{r.agentName}</span>
              <span className="ag-muted">{r.task.slice(0, 70)}</span>
              <span className="ag-muted">{PROVIDER_NAMES[r.provider]} · {new Date(r.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </button>
          ))}
        </section>
      )}

      <div className="ag-body">
        {/* LIBRARY */}
        <aside className="ag-library glass-panel">
          <div className="ag-search"><Search size={14} /><input placeholder="Search agents" value={query} onChange={e => setQuery(e.target.value)} /></div>
          <select className="ag-division" value={division} onChange={e => setDivision(e.target.value)}>
            <option value="recommended">★ Recommended for you</option>
            <option value="all">All divisions</option>
            {divisions.map(([id, d]) => <option key={id} value={id}>{d.label} ({d.count})</option>)}
          </select>
          <div className="ag-list">
            {!index && !loadError && <p className="ag-muted"><Loader2 size={13} className="ag-spin" /> Loading agents…</p>}
            {filtered.map(a => (
              <button key={a.id} className={`ag-item ${a.id === selectedId ? 'on' : ''}`} onClick={() => setSelectedId(a.id)} style={{ borderLeftColor: a.color }}>
                <span className="ag-emoji">{a.emoji}</span>
                <span className="ag-item-text">
                  <strong>{a.name}{RECOMMENDED_AGENT_IDS.includes(a.id) && <Star size={10} className="ag-star" />}</strong>
                  <small>{a.divisionLabel}{usedIds.has(a.id) ? ' · used' : ''}</small>
                </span>
              </button>
            ))}
            {index && filtered.length === 0 && <p className="ag-muted">No agents match.</p>}
          </div>
        </aside>

        {/* WORKSPACE */}
        <section className="ag-work glass-panel">
          {!selected ? (
            <div className="ag-empty">
              <Bot size={28} />
              <p>Choose an agent on the left. The ★ ones are picked for content, social media, SEO and sales.</p>
            </div>
          ) : (
            <>
              <div className="ag-agent-head">
                <span className="ag-big-emoji">{selected.emoji}</span>
                <div>
                  <h3>{selected.name}</h3>
                  <p>{selected.description}</p>
                  {selected.vibe && <p className="ag-muted">{selected.vibe}</p>}
                </div>
              </div>
              <div className="ag-row">
                <button className="ag-link" onClick={() => setShowInstructions(!showInstructions)}>
                  {showInstructions ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {showInstructions ? 'Hide' : 'Show'} this agent's full instructions
                </button>
                <a className="ag-link" href={selected.source} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} /> Source</a>
              </div>
              {showInstructions && <div className="ag-instructions"><SafeMarkdown text={instructions || 'Loading…'} /></div>}

              <label className="ag-field">
                <span>Task: what do you want this agent to do?</span>
                <textarea rows={5} value={task} onChange={e => setTask(e.target.value)}
                  placeholder="e.g. Write 5 LinkedIn posts announcing AlbionLM early access to UK security leaders, each with a different hook." />
              </label>
              <div className="ag-grid">
                <label className="ag-field">
                  <span>Brand (adds its profile as context)</span>
                  <select value={siteId} onChange={e => setSiteId(e.target.value)}>
                    <option value="">None</option>
                    {sites.map(s => <option key={s.id} value={s.id} disabled={!s.description.trim()}>{s.name}{!s.description.trim() ? ' (no profile yet)' : ''}</option>)}
                  </select>
                </label>
                <label className="ag-field">
                  <span>AI for this run</span>
                  <select value={provider} onChange={e => { const p = e.target.value as ModelSettings['provider']; setProvider(p); setModel(p === settings.provider ? settings.model : DEFAULT_MODELS[p]); }}>
                    {PROVIDERS.map(p => <option key={p} value={p}>{PROVIDER_NAMES[p]}{keys[p] ? '' : ' (no key)'}</option>)}
                  </select>
                </label>
                <label className="ag-field">
                  <span>Model</span>
                  <input value={model} onChange={e => setModel(e.target.value)} />
                </label>
              </div>
              <label className="ag-field">
                <span>Extra context (optional): links, notes, data, examples</span>
                <textarea rows={3} value={extraContext} onChange={e => setExtraContext(e.target.value)} />
              </label>
              <label className="ag-check">
                <input type="checkbox" checked={humanize} onChange={e => setHumanize(e.target.checked)} />
                Humanize the output (for anything published; turn off for code, data or plans)
              </label>

              <div className="ag-row">
                <button className="btn btn-primary ag-btn" disabled={phase !== 'idle' || !task.trim() || !hasKey} onClick={run}>
                  {phase !== 'idle' ? <Loader2 size={14} className="ag-spin" /> : <Play size={14} />} {phase !== 'idle' ? 'Working…' : `Run on ${PROVIDER_NAMES[provider]}`}
                </button>
                {!hasKey && <button className="ag-link" onClick={onOpenSettings}>Add a {PROVIDER_NAMES[provider]} key in Settings</button>}
              </div>

              {error && <div className="ag-error"><AlertTriangle size={14} /> {error}</div>}

              {output && (
                <div className="ag-output-wrap">
                  <div className="ag-row">
                    {issues === null ? null : issues.length === 0
                      ? <span className="ag-flag ok"><ShieldCheck size={13} /> Humanizer passed</span>
                      : <span className="ag-flag warn"><AlertTriangle size={13} /> {issues.join(' · ')}</span>}
                    <button className="btn btn-secondary ag-btn" onClick={copy}>{copied ? <Check size={13} /> : <Copy size={13} />} Copy</button>
                    <input type="date" className="ag-date" value={calDate} onChange={e => setCalDate(e.target.value)} />
                    <button className="btn btn-secondary ag-btn" disabled={phase !== 'idle'} onClick={addToCalendar}><CalendarPlus size={13} /> Add to calendar</button>
                    {savedEntryId && <button className="ag-link" onClick={() => onOpenCalendar(savedEntryId)}>Saved: open in calendar</button>}
                  </div>
                  <div className="ag-output"><SafeMarkdown text={output} /></div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <style>{`
        .ag-container { display: flex; flex-direction: column; gap: 14px; padding: 8px 4px 40px; }
        .ag-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .ag-header h2 { display: flex; align-items: center; gap: 10px; font-family: var(--font-heading); margin: 0 0 6px; color: var(--text-primary); }
        .ag-sub { color: var(--text-secondary); max-width: 760px; margin: 0; font-size: 0.9rem; line-height: 1.5; }
        .ag-sub a { color: var(--primary); }
        .ag-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 6px 12px; }
        .ag-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .ag-error { display: flex; align-items: center; gap: 8px; color: var(--danger); font-size: 0.85rem; padding: 8px 12px; }
        .ag-card { padding: 12px; display: flex; flex-direction: column; gap: 4px; }
        .ag-run-row { display: grid; grid-template-columns: 200px 1fr 170px; gap: 10px; background: none; border: none; border-bottom: 1px solid var(--border-glass); color: var(--text-primary); text-align: left; padding: 6px; cursor: pointer; font-size: 0.8rem; }
        .ag-run-row:hover { background: var(--bg-card-hover); }
        .ag-muted { color: var(--text-muted); font-size: 0.78rem; margin: 0; }
        .ag-body { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 14px; align-items: start; }
        .ag-library { padding: 12px; display: flex; flex-direction: column; gap: 8px; position: sticky; top: 8px; max-height: calc(100vh - 40px); }
        .ag-search { display: flex; align-items: center; gap: 6px; border: 1px solid var(--border-glass); border-radius: 8px; padding: 6px 8px; color: var(--text-muted); }
        .ag-search input { background: none; border: none; color: var(--text-primary); outline: none; width: 100%; font-size: 0.85rem; }
        .ag-division, .ag-field select, .ag-field input, .ag-field textarea, .ag-date {
          background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 8px; padding: 7px 10px; font-family: var(--font-body); font-size: 0.85rem;
        }
        .ag-list { overflow-y: auto; display: flex; flex-direction: column; gap: 4px; min-height: 0; flex: 1; }
        .ag-item { display: flex; align-items: center; gap: 8px; background: none; border: 1px solid var(--border-glass); border-left: 3px solid; border-radius: 6px; padding: 6px 8px; cursor: pointer; text-align: left; color: var(--text-primary); }
        .ag-item.on, .ag-item:hover { background: var(--bg-card-hover); }
        .ag-emoji { font-size: 1.1rem; }
        .ag-item-text { display: flex; flex-direction: column; min-width: 0; }
        .ag-item-text strong { font-size: 0.8rem; display: flex; align-items: center; gap: 4px; }
        .ag-item-text small { font-size: 0.7rem; color: var(--text-muted); }
        .ag-star { color: var(--warning); fill: var(--warning); }
        .ag-work { padding: 18px; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
        .ag-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; color: var(--text-muted); padding: 60px 20px; text-align: center; }
        .ag-agent-head { display: flex; gap: 12px; }
        .ag-agent-head h3 { margin: 0 0 4px; color: var(--text-primary); }
        .ag-agent-head p { margin: 0; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; }
        .ag-big-emoji { font-size: 2rem; }
        .ag-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .ag-link { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; padding: 0; text-decoration: none; }
        .ag-instructions { max-height: 340px; overflow-y: auto; border: 1px solid var(--border-glass); border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; }
        .ag-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
        .ag-field textarea { resize: vertical; }
        .ag-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
        .ag-check { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); }
        .ag-flag { display: inline-flex; align-items: center; gap: 4px; font-size: 0.78rem; }
        .ag-flag.ok { color: var(--success); }
        .ag-flag.warn { color: var(--warning); }
        .ag-output-wrap { display: flex; flex-direction: column; gap: 10px; }
        .ag-output { border: 1px solid var(--border-glass); border-radius: 8px; padding: 12px 16px; background: var(--bg-dark); max-height: 640px; overflow-y: auto; }
        .ag-spin { animation: ag-spin 1s linear infinite; }
        @keyframes ag-spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .ag-body { grid-template-columns: 1fr; } .ag-library { position: static; max-height: 360px; } .ag-run-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};
