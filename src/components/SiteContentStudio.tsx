import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Globe, Sparkles, Loader2, Square, CalendarDays, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Trash2, ListChecks, ExternalLink
} from 'lucide-react';
import { type ApiKeys, type ModelSettings } from '../utils/ai';
import { type SiteProfile, loadSiteProfiles, saveSiteProfiles } from '../data/siteProfiles';
import { type SitePlan, type GenerateProgress, generatePlan, generateContent, loadPlan, clearPlan } from '../utils/contentGen';
import { CALENDAR_EVENT, getAllEntries, deleteEntries, addDays, isoDate } from '../utils/contentStore';

// REAL: plan and content are generated with the user's key and saved to the calendar (IndexedDB).
// Posting is manual via the calendar's per-platform links. This replaces the old simulated Daily
// Autopilot screen for these sites.

interface SiteContentStudioProps {
  siteId: string;
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenSettings: () => void;
  onOpenCalendar: (entryId?: string) => void;
}

const PROFILE_FIELDS: { key: keyof SiteProfile; label: string; rows?: number; hint?: string }[] = [
  { key: 'description', label: 'What it is (facts only: the AI won\'t claim anything not written here)', rows: 4 },
  { key: 'audience', label: 'Who it\'s for', rows: 2 },
  { key: 'pillars', label: 'Content themes to rotate (comma separated)', rows: 2 },
  { key: 'tone', label: 'Tone of voice', rows: 1 },
  { key: 'cta', label: 'Call to action', rows: 1 },
  { key: 'url', label: 'Website' },
  { key: 'linkedinPageUrl', label: 'LinkedIn company page admin URL (for the "Open" button)' },
  { key: 'facebookPageUrl', label: 'Facebook page URL' },
  { key: 'substackUrl', label: 'Substack publication URL (e.g. https://name.substack.com)' },
  { key: 'siteAdminUrl', label: 'Website admin / new-post URL' }
];

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isoDate(d);
};

export const SiteContentStudio: React.FC<SiteContentStudioProps> = ({ siteId, keys, settings, onOpenSettings, onOpenCalendar }) => {
  const [profiles, setProfiles] = useState<SiteProfile[]>(loadSiteProfiles);
  const profile = profiles.find(p => p.id === siteId) ?? profiles[0];
  const needsInfo = !profile.description.trim() || !profile.audience.trim();

  const [plan, setPlan] = useState<SitePlan | null>(() => loadPlan(siteId));
  const [startDate, setStartDate] = useState(() => loadPlan(siteId)?.startDate ?? tomorrow());
  const [days, setDays] = useState(50);
  const [written, setWritten] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'idle' | 'planning' | 'writing'>('idle');
  const [progress, setProgress] = useState<GenerateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(needsInfo);
  const [showPlan, setShowPlan] = useState(false);
  const stopRef = useRef(false);

  // Switching between sites in the sidebar reuses this component, so reload per site.
  useEffect(() => {
    const p = loadPlan(siteId);
    setPlan(p);
    setStartDate(p?.startDate ?? tomorrow());
    setError(null);
    setProgress(null);
    const prof = loadSiteProfiles().find(x => x.id === siteId);
    setShowProfile(!prof?.description.trim() || !prof?.audience.trim());
  }, [siteId]);

  const refreshWritten = useCallback(async () => {
    try {
      const all = await getAllEntries();
      setWritten(new Set(all.filter(e => e.siteId === siteId).map(e => e.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read the calendar.');
    }
  }, [siteId]);

  useEffect(() => {
    refreshWritten();
    window.addEventListener(CALENDAR_EVENT, refreshWritten);
    return () => window.removeEventListener(CALENDAR_EVENT, refreshWritten);
  }, [refreshWritten]);

  const updateProfile = (key: keyof SiteProfile, value: string) => {
    const next = profiles.map(p => (p.id === siteId ? { ...p, [key]: value } : p));
    setProfiles(next);
    saveSiteProfiles(next);
  };

  const isDemo = settings.provider === 'mock';
  const busy = phase !== 'idle';
  const planWritten = plan ? plan.days.filter(d => written.has(`${siteId}-${d.date}`)).length : 0;

  const runPlan = async (): Promise<SitePlan | null> => {
    setPhase('planning');
    setError(null);
    setProgress({ done: 0, total: days, message: `Planning ${days} topics…` });
    try {
      const p = await generatePlan(profile, startDate, days, keys, settings);
      setPlan(p);
      setShowPlan(true);
      return p;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Planning failed.');
      return null;
    } finally {
      setPhase('idle');
    }
  };

  const runWrite = async (p: SitePlan) => {
    setPhase('writing');
    setError(null);
    stopRef.current = false;
    try {
      await generateContent(profile, p, keys, settings, setProgress, () => stopRef.current);
      if (stopRef.current) setProgress(prev => (prev ? { ...prev, message: `Stopped. ${prev.done} of ${prev.total} days saved; run again to continue.` } : prev));
    } catch (err) {
      setError(`${err instanceof Error ? err.message : 'Writing failed.'} Everything written so far is saved; run again to continue.`);
    } finally {
      setPhase('idle');
      refreshWritten();
    }
  };

  const runAll = async () => {
    const p = plan ?? (await runPlan());
    if (p) await runWrite(p);
  };

  const replan = async () => {
    if (plan && planWritten > 0 && !window.confirm('Make a new topic plan? Days already written stay in the calendar; only unwritten days use the new plan.')) return;
    clearPlan(siteId);
    setPlan(null);
    await runPlan();
  };

  const deleteAll = async () => {
    if (!window.confirm(`Delete all ${written.size} generated ${profile.name} days from the calendar and the topic plan? This can't be undone.`)) return;
    await deleteEntries([...written]);
    clearPlan(siteId);
    setPlan(null);
    setProgress(null);
  };

  const pct = progress ? Math.round((progress.done / Math.max(1, progress.total)) * 100) : 0;

  return (
    <div className="sc-container animate-fade">
      <header className="sc-header">
        <div>
          <h2><span className="sc-dot" style={{ background: profile.color }} /> {profile.name}: daily content</h2>
          <p className="sc-sub">
            Plans and writes {days} days of posts for LinkedIn, the LinkedIn company page, X, Facebook, TikTok, YouTube Shorts, Substack and
            the website, plus a short-video script and AI video prompt for each day. Everything lands on the Content Calendar, where you
            copy each post and open the platform to publish it.
          </p>
          <a className="sc-site-link" href={profile.url} target="_blank" rel="noopener noreferrer"><Globe size={13} /> {profile.url} <ExternalLink size={11} /></a>
        </div>
        <span className={`sc-model-pill ${isDemo ? 'warn' : ''}`} onClick={onOpenSettings}>
          {isDemo ? 'Demo Mode: set a real model in Settings' : `${settings.provider} · ${settings.model}`}
        </span>
      </header>

      {error && <div className="sc-error glass-panel"><AlertTriangle size={15} /> <span>{error}</span><button onClick={() => setError(null)}>✕</button></div>}

      {needsInfo && (
        <div className="sc-warn glass-panel">
          <AlertTriangle size={15} /> Tell the AI what {profile.name} is before generating: fill in "What it is" and "Who it's for" below.
          The AI only writes what's in the profile, so it can't guess.
        </div>
      )}

      {/* PROFILE */}
      <section className="sc-card glass-panel">
        <button className="sc-toggle" onClick={() => setShowProfile(!showProfile)}>
          {showProfile ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Site profile (what the AI knows about {profile.name})
        </button>
        {showProfile && (
          <div className="sc-grid">
            {PROFILE_FIELDS.map(f => (
              <label key={f.key} className={`sc-field ${f.rows && f.rows > 1 ? 'sc-span' : ''}`}>
                <span>{f.label}</span>
                {f.rows
                  ? <textarea rows={f.rows} value={String(profile[f.key] ?? '')} onChange={e => updateProfile(f.key, e.target.value)} />
                  : <input value={String(profile[f.key] ?? '')} onChange={e => updateProfile(f.key, e.target.value)} />}
              </label>
            ))}
          </div>
        )}
      </section>

      {/* GENERATE */}
      <section className="sc-card glass-panel">
        <h3><Sparkles size={16} /> Generate</h3>
        <div className="sc-row">
          <label className="sc-field sc-inline">
            <span>First day</span>
            <input type="date" value={startDate} disabled={!!plan} onChange={e => setStartDate(e.target.value)} />
          </label>
          <label className="sc-field sc-inline">
            <span>Days</span>
            <input type="number" min={5} max={90} value={days} disabled={!!plan} onChange={e => setDays(Math.max(5, Math.min(90, Number(e.target.value) || 50)))} />
          </label>
          <span className="sc-hint">{plan ? `Plan: ${plan.startDate} to ${addDays(plan.startDate, plan.days.length - 1)}` : `Runs ${startDate} to ${addDays(startDate, days - 1)}`}</span>
        </div>

        <div className="sc-row">
          <button className="btn btn-primary sc-btn" disabled={busy || isDemo || needsInfo || (!!plan && planWritten === plan.days.length)} onClick={runAll}>
            {busy ? <Loader2 size={14} className="sc-spin" /> : <Sparkles size={14} />}
            {!plan ? `Plan & write ${days} days` : planWritten === 0 ? `Write all ${plan.days.length} days` : planWritten === plan.days.length ? 'All days written' : `Continue (${plan.days.length - planWritten} days left)`}
          </button>
          {phase === 'writing' && (
            <button className="btn btn-secondary sc-btn" onClick={() => { stopRef.current = true; }}><Square size={13} /> Stop after this batch</button>
          )}
          {plan && !busy && <button className="btn btn-secondary sc-btn" onClick={replan}><ListChecks size={14} /> New topic plan</button>}
          <button className="btn btn-secondary sc-btn" disabled={written.size === 0} onClick={() => onOpenCalendar()}><CalendarDays size={14} /> Open calendar</button>
        </div>

        {progress && (
          <div className="sc-progress">
            <div className="sc-bar"><div style={{ width: `${pct}%`, background: profile.color }} /></div>
            <span>{progress.message}</span>
          </div>
        )}
        <p className="sc-hint">
          Writes 5 days per AI call ({plan ? Math.ceil((plan.days.length - planWritten) / 5) : Math.ceil(days / 5)} calls to go), saving each batch as it
          arrives. If it stops part-way, run it again to carry on. Each post is checked by the humanizer; anything flagged shows on the calendar
          with a one-click rewrite.
        </p>
      </section>

      {/* PLAN */}
      {plan && (
        <section className="sc-card glass-panel">
          <button className="sc-toggle" onClick={() => setShowPlan(!showPlan)}>
            {showPlan ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Topic plan: {planWritten} of {plan.days.length} written
          </button>
          {showPlan && (
            <div className="sc-plan">
              {plan.days.map(d => {
                const id = `${siteId}-${d.date}`;
                const done = written.has(id);
                return (
                  <div key={d.day} className={`sc-plan-row ${done ? 'done' : ''}`} onClick={() => done && onOpenCalendar(id)}>
                    <span className="sc-day">{d.day}</span>
                    <span className="sc-date">{d.date}</span>
                    <span className="sc-pillar">{d.pillar}</span>
                    <span className="sc-topic">{d.topic}</span>
                    {done ? <CheckCircle2 size={14} className="sc-ok" /> : <span className="sc-pending">pending</span>}
                  </div>
                );
              })}
            </div>
          )}
          {written.size > 0 && (
            <button className="sc-danger" disabled={busy} onClick={deleteAll}><Trash2 size={12} /> Delete all {profile.name} content</button>
          )}
        </section>
      )}

      <style>{`
        .sc-container { display: flex; flex-direction: column; gap: 16px; padding: 8px 4px 40px; }
        .sc-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .sc-header h2 { display: flex; align-items: center; gap: 10px; font-family: var(--font-heading); margin: 0 0 6px; color: var(--text-primary); }
        .sc-dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; }
        .sc-sub { color: var(--text-secondary); max-width: 780px; margin: 0 0 6px; line-height: 1.5; font-size: 0.92rem; }
        .sc-site-link { color: var(--primary); font-size: 0.82rem; display: inline-flex; align-items: center; gap: 5px; text-decoration: none; }
        .sc-model-pill { font-size: 0.78rem; font-family: var(--font-mono); padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border-glass); color: var(--text-secondary); cursor: pointer; }
        .sc-model-pill.warn { border-color: var(--warning); color: var(--warning); }
        .sc-error, .sc-warn { display: flex; align-items: center; gap: 8px; padding: 10px 14px; font-size: 0.88rem; }
        .sc-error { color: var(--danger); border: 1px solid var(--danger); }
        .sc-error span { flex: 1; }
        .sc-error button { background: none; border: none; color: inherit; cursor: pointer; }
        .sc-warn { color: var(--warning); border: 1px solid var(--warning); }
        .sc-card { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
        .sc-card h3 { margin: 0; font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
        .sc-toggle { background: none; border: none; color: var(--text-primary); font-size: 0.95rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 0; text-align: left; }
        .sc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
        .sc-span { grid-column: 1 / -1; }
        .sc-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
        .sc-field input, .sc-field textarea {
          background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary);
          border-radius: 8px; padding: 8px 10px; font-family: var(--font-body); font-size: 0.86rem; resize: vertical;
        }
        .sc-inline { flex-direction: row; align-items: center; gap: 8px; }
        .sc-inline input[type=number] { width: 70px; }
        .sc-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
        .sc-hint { color: var(--text-muted); font-size: 0.8rem; line-height: 1.45; margin: 0; }
        .sc-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; padding: 7px 12px; }
        .sc-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .sc-progress { display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem; color: var(--text-secondary); }
        .sc-bar { height: 6px; border-radius: 999px; background: var(--bg-dark); overflow: hidden; }
        .sc-bar div { height: 100%; transition: width 0.4s ease; }
        .sc-plan { display: flex; flex-direction: column; max-height: 480px; overflow-y: auto; border: 1px solid var(--border-glass); border-radius: 8px; }
        .sc-plan-row { display: grid; grid-template-columns: 34px 92px 160px 1fr 60px; gap: 10px; align-items: center; padding: 7px 10px; font-size: 0.8rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-glass); }
        .sc-plan-row.done { cursor: pointer; color: var(--text-primary); }
        .sc-plan-row.done:hover { background: var(--bg-card-hover); }
        .sc-day { font-family: var(--font-mono); color: var(--text-muted); }
        .sc-date { font-family: var(--font-mono); font-size: 0.75rem; }
        .sc-pillar { color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sc-ok { color: var(--success); justify-self: end; }
        .sc-pending { color: var(--text-muted); font-size: 0.72rem; justify-self: end; }
        .sc-danger { align-self: flex-start; background: none; border: none; color: var(--text-muted); font-size: 0.78rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
        .sc-danger:hover:not(:disabled) { color: var(--danger); }
        .sc-spin { animation: sc-spin 1s linear infinite; }
        @keyframes sc-spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) { .sc-plan-row { grid-template-columns: 28px 1fr 50px; } .sc-date, .sc-pillar { display: none; } }
      `}</style>
    </div>
  );
};
