import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, Copy, Check, ExternalLink, Link2, Download, X, Wand2, Loader2,
  AlertTriangle, ShieldCheck, Newspaper, Film, List, LayoutGrid, Sparkles, Square
} from 'lucide-react';
import { type ApiKeys, type ModelSettings } from '../utils/ai';
import { type CalendarEntry, type PlatformKey, CALENDAR_EVENT, getAllEntries, updateEntry, entryLink, isoDate } from '../utils/contentStore';
import { PLATFORMS, composerUrl, rehumanize, entriesToCsv, generatePlan, generateContent, loadPlan } from '../utils/contentGen';
import { checkHumanizer } from '../utils/humanizer';
import { loadSiteProfiles, NEWSLETTER_COLOR } from '../data/siteProfiles';

// The calendar is the posting hub: every entry has a permalink (#/calendar/<id>), per-platform text with
// Copy and Open buttons, and a field for the live post URL once published. Posting itself is manual.

interface ContentCalendarProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenNewsletter: () => void;
}

type DetailTab = PlatformKey | 'video';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const hashEntryId = () => {
  const m = window.location.hash.match(/^#\/calendar\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
};

// Text boxes keep their own state while typing and save on blur, so each keystroke doesn't round-trip
// through IndexedDB (which would reload every entry and could drop characters).
const CommitTextarea: React.FC<{ value: string; rows: number; onCommit: (v: string) => void }> = ({ value, rows, onCommit }) => {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return <textarea rows={rows} value={text} onChange={e => setText(e.target.value)} onBlur={() => { if (text !== value) onCommit(text); }} />;
};

const CommitInput: React.FC<{ value: string; placeholder: string; onCommit: (v: string) => void }> = ({ value, placeholder, onCommit }) => {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return <input placeholder={placeholder} value={text} onChange={e => setText(e.target.value)} onBlur={() => { if (text !== value) onCommit(text.trim()); }} />;
};

export const ContentCalendar: React.FC<ContentCalendarProps> = ({ keys, settings, onOpenNewsletter }) => {
  const sites = useMemo(() => loadSiteProfiles(), []);
  const siteName = useCallback((id: string) => (id === 'newsletter' ? 'Newsletter' : id === 'agent' ? 'Agent output' : sites.find(s => s.id === id)?.name ?? id), [sites]);
  const siteColor = (id: string) => (id === 'newsletter' ? NEWSLETTER_COLOR : id === 'agent' ? '#94a3b8' : sites.find(s => s.id === id)?.color ?? 'var(--primary)');

  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [mode, setMode] = useState<'month' | 'list'>('month');
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(hashEntryId);
  const [tab, setTab] = useState<DetailTab>('linkedin');
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [fillStatus, setFillStatus] = useState<string | null>(null);
  const [filling, setFilling] = useState(false);
  const stopFill = React.useRef(false);

  const reload = useCallback(async () => {
    try {
      setEntries(await getAllEntries());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not open the calendar database.');
    }
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(CALENDAR_EVENT, reload);
    return () => window.removeEventListener(CALENDAR_EVENT, reload);
  }, [reload]);

  // Permalinks: #/calendar/<id> opens that entry (and its month).
  useEffect(() => {
    const onHash = () => setSelectedId(hashEntryId());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const selected = entries.find(e => e.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    const d = new Date(`${selected.date}T12:00:00`);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setTab(selected.kind === 'newsletter' ? 'linkedin' : (tab in selected.posts || tab === 'video' ? tab : 'linkedin'));
    setPanelError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const select = (id: string | null) => {
    setSelectedId(id);
    const url = id ? `#/calendar/${encodeURIComponent(id)}` : '#/calendar';
    window.history.replaceState(null, '', url);
  };

  const visible = entries.filter(e => !hidden.has(e.siteId));
  const byDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    for (const e of visible) (map[e.date] ||= []).push(e);
    return map;
  }, [visible]);

  // Month grid: Monday-first weeks covering the whole month.
  const gridDays = useMemo(() => {
    const first = new Date(month);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
    return Array.from({ length: cells }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [month]);

  const today = isoDate(new Date());
  const monthLabel = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const monthPrefix = isoDate(month).slice(0, 7);
  const monthEntries = visible.filter(e => e.date.startsWith(monthPrefix));
  const listEntries = visible.filter(e => e.date >= today);

  const flash = (key: string) => {
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };
  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(key);
    } catch {
      setPanelError('The browser blocked the clipboard. Select the text and copy it manually.');
    }
  };

  const save = async (patch: Partial<CalendarEntry>) => {
    if (!selected) return;
    try {
      await updateEntry(selected.id, patch);
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : 'Could not save.');
    }
  };

  const editPost = (platform: PlatformKey, text: string) => {
    if (!selected) return;
    const flags = { ...(selected.humanizerFlags || {}) };
    const issues = checkHumanizer(text, 'longform');
    if (issues.length) flags[platform] = issues; else delete flags[platform];
    // Substack and the website share one article; keep them in step.
    const posts = { ...selected.posts, [platform]: text, ...(platform === 'substack' ? { site: text } : platform === 'site' ? { substack: text } : {}) };
    save({ posts, humanizerFlags: flags });
  };

  const humanize = async (platform: PlatformKey) => {
    if (!selected) return;
    const text = selected.posts[platform] || '';
    setBusy(platform);
    setPanelError(null);
    try {
      const out = await rehumanize(text, selected.humanizerFlags?.[platform] || [], keys, settings);
      editPost(platform, out);
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : 'Humanize failed.');
    } finally {
      setBusy(null);
    }
  };

  // Fills 50 days for every site that has a profile, one site at a time, resuming partly done sites.
  const fillAll = async () => {
    if (settings.provider === 'mock') {
      setFillStatus('Choose a real AI provider in Settings first.');
      return;
    }
    const ready = sites.filter(s => s.description.trim() && s.audience.trim());
    const skipped = sites.filter(s => !ready.includes(s)).map(s => s.name);
    setFilling(true);
    stopFill.current = false;
    try {
      for (const site of ready) {
        if (stopFill.current) break;
        let plan = loadPlan(site.id);
        if (!plan) {
          setFillStatus(`${site.name}: planning 50 topics…`);
          const start = isoDate(new Date(Date.now() + 86400000));
          plan = await generatePlan(site, start, 50, keys, settings);
        }
        await generateContent(site, plan, keys, settings, p => setFillStatus(`${site.name}: ${p.message}`), () => stopFill.current);
      }
      setFillStatus(stopFill.current
        ? 'Stopped. Press again to carry on where it left off.'
        : `Done: ${ready.map(s => s.name).join(', ')} filled.${skipped.length ? ` Skipped (no profile yet): ${skipped.join(', ')}.` : ''}`);
    } catch (err) {
      setFillStatus(`${err instanceof Error ? err.message : 'Generation failed.'} Finished days are saved; press again to continue.`);
    } finally {
      setFilling(false);
    }
  };

  const exportCsv = () => {
    const rows = mode === 'month' ? monthEntries : listEntries;
    const blob = new Blob([entriesToCsv(rows, siteName)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-calendar-${mode === 'month' ? monthPrefix : `from-${today}`}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const siteIds = ['newsletter', ...sites.map(s => s.id), 'agent'];
  const counts = siteIds.reduce<Record<string, number>>((acc, id) => ({ ...acc, [id]: entries.filter(e => e.siteId === id).length }), {});
  const profile = selected ? sites.find(s => s.id === selected.siteId) : undefined;
  const postedCount = selected ? Object.values(selected.postedUrls || {}).filter(Boolean).length : 0;

  const Chip: React.FC<{ e: CalendarEntry }> = ({ e }) => (
    <button className={`cc-chip ${e.id === selectedId ? 'on' : ''} st-${e.status}`} style={{ borderLeftColor: siteColor(e.siteId) }}
      onClick={ev => { ev.stopPropagation(); select(e.id); }} title={`${siteName(e.siteId)}: ${e.title}`}>
      {e.kind === 'newsletter' && <Newspaper size={10} />}
      <span>{siteName(e.siteId)}</span>
      {e.status === 'posted' && <Check size={10} />}
    </button>
  );

  return (
    <div className="cc-container animate-fade">
      <header className="cc-header">
        <div>
          <h2><CalendarDays size={22} /> Content Calendar</h2>
          <p className="cc-sub">Every daily post and newsletter in one place. Open an item, copy each version, post it on the platform, then paste the live link back here.</p>
        </div>
        <div className="cc-actions">
          <div className="cc-tabs">
            <button className={mode === 'month' ? 'on' : ''} onClick={() => setMode('month')}><LayoutGrid size={13} /> Month</button>
            <button className={mode === 'list' ? 'on' : ''} onClick={() => setMode('list')}><List size={13} /> Upcoming</button>
          </div>
          {filling
            ? <button className="btn btn-secondary cc-btn" onClick={() => { stopFill.current = true; }}><Square size={13} /> Stop after this batch</button>
            : <button className="btn btn-primary cc-btn" onClick={fillAll}><Sparkles size={13} /> Fill 50 days for all sites</button>}
          <button className="btn btn-secondary cc-btn" onClick={exportCsv} disabled={!(mode === 'month' ? monthEntries : listEntries).length}><Download size={13} /> Export CSV</button>
        </div>
      </header>

      {loadError && <div className="cc-error glass-panel"><AlertTriangle size={15} /> {loadError}</div>}
      {fillStatus && <div className="cc-fill glass-panel">{filling && <Loader2 size={14} className="cc-spin" />} {fillStatus}</div>}

      <div className="cc-filters">
        {siteIds.map(id => (
          <button key={id} className={`cc-filter ${hidden.has(id) ? 'off' : ''}`} onClick={() => setHidden(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })}>
            <span className="cc-dot" style={{ background: siteColor(id) }} /> {siteName(id)} <span className="cc-count">{counts[id] || 0}</span>
          </button>
        ))}
      </div>

      <div className={`cc-body ${selected ? 'with-panel' : ''}`}>
        <div className="cc-main glass-panel">
          {mode === 'month' ? (
            <>
              <div className="cc-month-nav">
                <button className="cc-icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
                <strong>{monthLabel}</strong>
                <button className="cc-icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
                <button className="cc-link" onClick={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }}>Today</button>
                <span className="cc-muted">{monthEntries.length} items</span>
              </div>
              <div className="cc-grid">
                {WEEKDAYS.map(w => <div key={w} className="cc-wd">{w}</div>)}
                {gridDays.map(d => {
                  const iso = isoDate(d);
                  const inMonth = d.getMonth() === month.getMonth();
                  const items = byDate[iso] || [];
                  return (
                    <div key={iso} className={`cc-cell ${inMonth ? '' : 'out'} ${iso === today ? 'today' : ''}`}>
                      <span className="cc-num">{d.getDate()}</span>
                      <div className="cc-chips">{items.map(e => <Chip key={e.id} e={e} />)}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="cc-list">
              {listEntries.length === 0 && <p className="cc-muted">Nothing scheduled from today. Generate content from a site under Daily.</p>}
              {listEntries.map(e => (
                <button key={e.id} className={`cc-list-row ${e.id === selectedId ? 'on' : ''}`} onClick={() => select(e.id)}>
                  <span className="cc-dot" style={{ background: siteColor(e.siteId) }} />
                  <span className="cc-list-date">{new Date(`${e.date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span className="cc-list-site">{siteName(e.siteId)}</span>
                  <span className="cc-list-title">{e.title}</span>
                  <span className={`cc-status st-${e.status}`}>{e.status}</span>
                </button>
              ))}
            </div>
          )}
          {entries.length === 0 && !loadError && (
            <p className="cc-muted cc-empty">The calendar is empty. Go to Daily → a site and press "Plan & write 50 days", or open the newsletter screen.</p>
          )}
        </div>

        {selected && (
          <aside className="cc-panel glass-panel">
            <div className="cc-panel-head">
              <span className="cc-dot" style={{ background: siteColor(selected.siteId) }} />
              <div>
                <strong>{selected.title}</strong>
                <div className="cc-muted">{siteName(selected.siteId)} · {new Date(`${selected.date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}{selected.pillar ? ` · ${selected.pillar}` : ''}</div>
              </div>
              <button className="cc-icon" onClick={() => select(null)}><X size={16} /></button>
            </div>

            <div className="cc-row">
              <select value={selected.status} onChange={e => save({ status: e.target.value as CalendarEntry['status'] })}>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="posted">Posted</option>
              </select>
              <button className="btn btn-secondary cc-btn" onClick={() => copy(entryLink(selected.id), 'permalink')}>
                {copied === 'permalink' ? <Check size={13} /> : <Link2 size={13} />} Copy link to this item
              </button>
              {selected.kind === 'daily' && <span className="cc-muted">{postedCount} of {PLATFORMS.length - 1} posted</span>}
            </div>

            {panelError && <div className="cc-error"><AlertTriangle size={14} /> {panelError}</div>}

            {selected.kind === 'agent' ? (
              <div className="cc-post">
                <p className="cc-muted">From the {selected.agentName || 'agent'} agent{selected.siteId !== 'agent' ? ` for ${siteName(selected.siteId)}` : ''}. Edit it here, then copy it to wherever it's going.</p>
                <CommitTextarea key={`${selected.id}-agent`} rows={16} value={selected.article?.body || ''}
                  onCommit={v => save({ article: { title: selected.article?.title || selected.title, body: v }, posts: { ...selected.posts, site: v } })} />
                <div className="cc-row">
                  <button className="btn btn-primary cc-btn" onClick={() => copy(selected.article?.body || '', 'agent-body')}>
                    {copied === 'agent-body' ? <Check size={13} /> : <Copy size={13} />} Copy
                  </button>
                </div>
                <label className="cc-field">
                  <span>Where it was published (URL)</span>
                  <CommitInput key={`${selected.id}-agent-url`} placeholder="https://…" value={selected.postedUrls.site || ''}
                    onCommit={v => save({ postedUrls: { ...selected.postedUrls, site: v }, status: v ? 'posted' : selected.status })} />
                </label>
                {selected.postedUrls.site && <a className="cc-open" href={selected.postedUrls.site} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} /> View it live</a>}
              </div>
            ) : selected.kind === 'newsletter' ? (
              <div className="cc-newsletter">
                <p>{selected.posts.linkedin ? 'Draft ready in the newsletter screen.' : 'Newsletter slot.'} Review it there, publish it on LinkedIn, then paste the article's URL below.</p>
                <button className="btn btn-primary cc-btn" onClick={onOpenNewsletter}><Newspaper size={13} /> Open newsletter screen</button>
                <label className="cc-field">
                  <span>Published LinkedIn article URL</span>
                  <CommitInput key={`${selected.id}-nl`} placeholder="https://www.linkedin.com/pulse/..." value={selected.postedUrls.newsletter || ''}
                    onCommit={v => save({ postedUrls: { ...selected.postedUrls, newsletter: v }, status: v ? 'posted' : selected.status })} />
                </label>
                {selected.postedUrls.newsletter && <a className="cc-open" href={selected.postedUrls.newsletter} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> View the published newsletter</a>}
              </div>
            ) : (
              <>
                <div className="cc-ptabs">
                  {PLATFORMS.filter(p => p.key !== 'site').map(p => (
                    <button key={p.key} className={`${tab === p.key ? 'on' : ''} ${selected.postedUrls[p.key] ? 'posted' : ''} ${selected.humanizerFlags?.[p.key] ? 'flag' : ''}`} onClick={() => setTab(p.key)} title={p.label}>
                      {p.short}{selected.postedUrls[p.key] ? ' ✓' : ''}
                    </button>
                  ))}
                  <button className={`${tab === 'site' ? 'on' : ''} ${selected.postedUrls.site ? 'posted' : ''}`} onClick={() => setTab('site')}>Site{selected.postedUrls.site ? ' ✓' : ''}</button>
                  <button className={`${tab === 'video' ? 'on' : ''} ${selected.humanizerFlags?.video ? 'flag' : ''}`} onClick={() => setTab('video')}><Film size={11} /> Video</button>
                </div>

                {tab === 'video' ? (
                  <div className="cc-video">
                    {selected.video ? (
                      <>
                        <p className="cc-muted">For TikTok, YouTube Shorts and Reels (30-45 seconds, vertical). Record or generate the video, then post it with the TikTok and YT captions.</p>
                        <div className="cc-vblock"><strong>Hook (first 2 seconds)</strong><p>{selected.video.hook}</p></div>
                        <div className="cc-vblock">
                          <strong>Voiceover</strong> <button className="cc-link" onClick={() => copy(selected.video!.voiceover, 'vo')}>{copied === 'vo' ? 'Copied' : 'Copy'}</button>
                          <p>{selected.video.voiceover}</p>
                        </div>
                        <div className="cc-vblock">
                          <strong>Scenes</strong>
                          <ol>{selected.video.scenes.map((s, i) => <li key={i}>{s.visual}{s.onScreenText && <em> On screen: "{s.onScreenText}"</em>}</li>)}</ol>
                        </div>
                        <div className="cc-vblock">
                          <strong>AI video prompt</strong> <button className="cc-link" onClick={() => copy(selected.video!.aiVideoPrompt, 'aivp')}>{copied === 'aivp' ? 'Copied' : 'Copy'}</button>
                          <p className="cc-mono">{selected.video.aiVideoPrompt}</p>
                          <span className="cc-muted">Paste into an AI video tool such as Veo, Sora, Runway, Kling or CapCut.</span>
                        </div>
                      </>
                    ) : <p className="cc-muted">No video plan for this item.</p>}
                  </div>
                ) : (
                  <div className="cc-post">
                    <CommitTextarea key={`${selected.id}-${tab}`} rows={12} value={selected.posts[tab] || ''} onCommit={v => editPost(tab, v)} />
                    <div className="cc-row">
                      {selected.humanizerFlags?.[tab]
                        ? <span className="cc-flag warn"><AlertTriangle size={12} /> {selected.humanizerFlags[tab]!.join(' · ')}</span>
                        : <span className="cc-flag ok"><ShieldCheck size={12} /> Humanizer passed</span>}
                      {tab === 'x' && <span className={`cc-muted ${(selected.posts.x || '').length > 280 ? 'cc-over' : ''}`}>{(selected.posts.x || '').length}/280</span>}
                    </div>
                    <div className="cc-row">
                      <button className="btn btn-primary cc-btn" onClick={() => copy(selected.posts[tab] || '', `post-${tab}`)}>
                        {copied === `post-${tab}` ? <Check size={13} /> : <Copy size={13} />} Copy
                      </button>
                      {composerUrl(tab, selected.posts[tab] || '', profile) && (
                        <a className="btn btn-secondary cc-btn" href={composerUrl(tab, selected.posts[tab] || '', profile)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={13} /> Open {PLATFORMS.find(p => p.key === tab)?.label}
                        </a>
                      )}
                      {selected.humanizerFlags?.[tab] && settings.provider !== 'mock' && (
                        <button className="btn btn-secondary cc-btn" disabled={busy !== null} onClick={() => humanize(tab)}>
                          {busy === tab ? <Loader2 size={13} className="cc-spin" /> : <Wand2 size={13} />} Humanize
                        </button>
                      )}
                    </div>
                    {(tab === 'linkedinCompany' && !profile?.linkedinPageUrl) && <span className="cc-muted">Add the company page's admin URL in the site profile (Daily → {profile?.name}) so "Open" goes straight to it.</span>}
                    {(tab === 'tiktok' || tab === 'youtube') && <span className="cc-muted">Upload the video from the Video tab, then paste this as the caption.</span>}
                    <label className="cc-field">
                      <span>Live post URL (after you've posted)</span>
                      <CommitInput key={`${selected.id}-${tab}-url`} placeholder="https://…" value={selected.postedUrls[tab] || ''}
                        onCommit={v => {
                          const postedUrls = { ...selected.postedUrls, [tab]: v };
                          const all = PLATFORMS.filter(p => p.key !== 'site').every(p => postedUrls[p.key]);
                          save({ postedUrls, status: all ? 'posted' : selected.status });
                        }} />
                    </label>
                    {selected.postedUrls[tab] && <a className="cc-open" href={selected.postedUrls[tab]} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} /> View live post</a>}
                  </div>
                )}
              </>
            )}
          </aside>
        )}
      </div>

      <style>{`
        .cc-container { display: flex; flex-direction: column; gap: 14px; padding: 8px 4px 40px; }
        .cc-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .cc-header h2 { display: flex; align-items: center; gap: 10px; font-family: var(--font-heading); margin: 0 0 6px; color: var(--text-primary); }
        .cc-sub { color: var(--text-secondary); max-width: 720px; margin: 0; font-size: 0.9rem; line-height: 1.5; }
        .cc-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .cc-tabs { display: inline-flex; border: 1px solid var(--border-glass); border-radius: 8px; overflow: hidden; }
        .cc-tabs button { background: none; border: none; color: var(--text-secondary); padding: 6px 12px; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
        .cc-tabs button.on { background: var(--primary); color: #fff; }
        .cc-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 6px 12px; text-decoration: none; }
        .cc-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .cc-error { display: flex; align-items: center; gap: 8px; color: var(--danger); font-size: 0.85rem; padding: 8px 12px; }
        .cc-fill { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 0.85rem; color: var(--text-secondary); }
        .cc-filters { display: flex; flex-wrap: wrap; gap: 8px; }
        .cc-filter { display: inline-flex; align-items: center; gap: 6px; background: none; border: 1px solid var(--border-glass); border-radius: 999px; padding: 4px 12px; color: var(--text-primary); font-size: 0.8rem; cursor: pointer; }
        .cc-filter.off { opacity: 0.4; }
        .cc-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .cc-count { color: var(--text-muted); font-family: var(--font-mono); font-size: 0.72rem; }
        .cc-body { display: grid; grid-template-columns: 1fr; gap: 14px; align-items: start; }
        .cc-body.with-panel { grid-template-columns: minmax(0, 1fr) minmax(320px, 440px); }
        .cc-main { padding: 14px; min-width: 0; }
        .cc-month-nav { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: var(--text-primary); }
        .cc-icon { background: none; border: 1px solid var(--border-glass); border-radius: 6px; color: var(--text-secondary); padding: 4px; cursor: pointer; display: inline-flex; }
        .cc-link { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.8rem; padding: 0; }
        .cc-muted { color: var(--text-muted); font-size: 0.78rem; }
        .cc-empty { margin-top: 12px; }
        .cc-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
        .cc-wd { font-size: 0.72rem; color: var(--text-muted); text-align: center; padding: 4px 0; }
        .cc-cell { min-height: 96px; border: 1px solid var(--border-glass); border-radius: 6px; padding: 4px; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .cc-cell.out { opacity: 0.4; }
        .cc-cell.today { border-color: var(--primary); }
        .cc-num { font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); }
        .cc-chips { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .cc-chip { display: flex; align-items: center; gap: 3px; background: var(--bg-dark); border: 1px solid var(--border-glass); border-left: 3px solid; border-radius: 4px; padding: 1px 4px; font-size: 0.66rem; color: var(--text-primary); cursor: pointer; text-align: left; min-width: 0; }
        .cc-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cc-chip.on { outline: 1px solid var(--primary); }
        .cc-chip.st-posted { opacity: 0.6; }
        .cc-list { display: flex; flex-direction: column; }
        .cc-list-row { display: grid; grid-template-columns: 12px 110px 100px 1fr 70px; gap: 10px; align-items: center; padding: 8px 6px; background: none; border: none; border-bottom: 1px solid var(--border-glass); color: var(--text-primary); font-size: 0.82rem; text-align: left; cursor: pointer; }
        .cc-list-row.on, .cc-list-row:hover { background: var(--bg-card-hover); }
        .cc-list-date { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary); }
        .cc-list-site { color: var(--text-secondary); }
        .cc-list-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cc-status { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); justify-self: end; }
        .cc-status.st-posted { color: var(--success); }
        .cc-status.st-approved { color: var(--primary); }
        .cc-panel { padding: 16px; display: flex; flex-direction: column; gap: 12px; position: sticky; top: 8px; max-height: calc(100vh - 40px); overflow-y: auto; }
        .cc-panel-head { display: flex; gap: 10px; align-items: flex-start; color: var(--text-primary); }
        .cc-panel-head > div { flex: 1; min-width: 0; }
        .cc-panel-head .cc-dot { margin-top: 5px; }
        .cc-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .cc-row select, .cc-field input, .cc-post textarea {
          background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 8px; padding: 7px 10px; font-family: var(--font-body); font-size: 0.85rem;
        }
        .cc-post { display: flex; flex-direction: column; gap: 10px; }
        .cc-post textarea { width: 100%; box-sizing: border-box; resize: vertical; line-height: 1.5; }
        .cc-ptabs { display: flex; flex-wrap: wrap; gap: 4px; }
        .cc-ptabs button { background: none; border: 1px solid var(--border-glass); border-radius: 6px; color: var(--text-secondary); font-size: 0.74rem; padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; }
        .cc-ptabs button.on { background: var(--primary); color: #fff; border-color: var(--primary); }
        .cc-ptabs button.posted:not(.on) { color: var(--success); border-color: var(--success); }
        .cc-ptabs button.flag:not(.on) { border-color: var(--warning); }
        .cc-flag { display: inline-flex; align-items: center; gap: 4px; font-size: 0.74rem; }
        .cc-flag.ok { color: var(--success); }
        .cc-flag.warn { color: var(--warning); }
        .cc-over { color: var(--danger); }
        .cc-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.78rem; color: var(--text-secondary); }
        .cc-open { color: var(--primary); font-size: 0.8rem; display: inline-flex; align-items: center; gap: 5px; text-decoration: none; }
        .cc-video { display: flex; flex-direction: column; gap: 10px; }
        .cc-vblock { font-size: 0.84rem; color: var(--text-primary); }
        .cc-vblock p { margin: 4px 0 0; color: var(--text-secondary); line-height: 1.5; }
        .cc-vblock ol { margin: 4px 0 0; padding-left: 18px; color: var(--text-secondary); line-height: 1.5; }
        .cc-vblock em { color: var(--text-muted); }
        .cc-mono { font-family: var(--font-mono); font-size: 0.78rem; }
        .cc-newsletter { display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem; color: var(--text-secondary); }
        .cc-newsletter p { margin: 0; }
        .cc-spin { animation: cc-spin 1s linear infinite; }
        @keyframes cc-spin { to { transform: rotate(360deg); } }
        @media (max-width: 1000px) { .cc-body.with-panel { grid-template-columns: 1fr; } .cc-panel { position: static; max-height: none; } }
        @media (max-width: 640px) { .cc-cell { min-height: 60px; } .cc-chip span { display: none; } .cc-list-row { grid-template-columns: 12px 90px 1fr; } .cc-list-site, .cc-status { display: none; } }
      `}</style>
    </div>
  );
};
