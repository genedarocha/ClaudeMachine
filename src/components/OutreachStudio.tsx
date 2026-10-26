import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Send, Database, Upload, Loader2, AlertTriangle, Check, Copy, Download, Mail, UserX, Sparkles, RefreshCw, Shield
} from 'lucide-react';
import { type ApiKeys, type ModelSettings } from '../utils/ai';
import {
  type SupabaseConfig, type Lead, type SeqStep, SCHEMA_SQL, loadSupabase, saveSupabase, clearSupabase, testConnection,
  fetchLeads, fetchUnsubscribes, importLeads, addUnsubscribe, parseCsv, guessMapping, rowsToLeads,
  generateSequence, campaignToCsv, renderStep,
  type EngineConfig, type SendStats, loadEngine, saveEngine, launchCampaign, fetchStats
} from '../utils/outreach';
import { SafeMarkdown } from './SpecialistRunner';

// Outreach cockpit: CSV → Supabase, AI sequences, suppression list, compliant export. Sending/tracking/
// drips need a sending provider + server (see the honest banner + docs/OUTREACH.md). Nothing is faked.

interface OutreachStudioProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenSettings: () => void;
}

type Tab = 'leads' | 'sequence' | 'suppression' | 'send';

const FIELDS: { key: string; label: string }[] = [
  { key: 'email', label: 'Email (required)' },
  { key: 'first_name', label: 'First name' },
  { key: 'last_name', label: 'Last name' },
  { key: 'company', label: 'Company' },
  { key: 'title', label: 'Job title' }
];

export const OutreachStudio: React.FC<OutreachStudioProps> = ({ keys, settings, onOpenSettings }) => {
  const [cfg, setCfg] = useState<SupabaseConfig | null>(loadSupabase);
  const [url, setUrl] = useState(cfg?.url || '');
  const [anonKey, setAnonKey] = useState(cfg?.anonKey || '');
  const [connecting, setConnecting] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [tab, setTab] = useState<Tab>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [suppressed, setSuppressed] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // CSV import
  const [csv, setCsv] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Sequence
  const [offer, setOffer] = useState('');
  const [audience, setAudience] = useState('');
  const [stepCount, setStepCount] = useState(3);
  const [humanize, setHumanize] = useState(true);
  const [steps, setSteps] = useState<SeqStep[]>([]);
  const [fromName, setFromName] = useState('Gene Da Rocha');
  const [signature, setSignature] = useState('Gene Da Rocha\nFounder, Voxstar\nvoxstar.com');
  const [address, setAddress] = useState('Voxstar Ltd, High Wycombe, United Kingdom');

  // Suppression input
  const [unsubEmail, setUnsubEmail] = useState('');
  // Sending engine
  const [engine, setEngine] = useState<EngineConfig | null>(loadEngine);
  const [fnUrl, setFnUrl] = useState(engine?.functionsUrl || '');
  const [secret, setSecret] = useState(engine?.secret || '');
  const [campaignName, setCampaignName] = useState('Outreach campaign');
  const [replyTo, setReplyTo] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [stats, setStats] = useState<SendStats | null>(null);
  const [launching, setLaunching] = useState(false);

  const isDemo = settings.provider === 'mock';

  const refresh = useCallback(async (c: SupabaseConfig) => {
    setBusy('loading');
    try {
      const [l, u] = await Promise.all([fetchLeads(c), fetchUnsubscribes(c)]);
      setLeads(l || []);
      setSuppressed(new Set((u || []).map(x => x.email)));
      setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load from Supabase.'); }
    finally { setBusy(null); }
  }, []);

  useEffect(() => { if (cfg) refresh(cfg); }, [cfg, refresh]);
  useEffect(() => { if (cfg && engine) fetchStats(cfg).then(setStats).catch(() => {}); }, [cfg, engine, tab]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(null), 4000); return () => clearTimeout(t); }, [notice]);

  const connect = async () => {
    if (!url.trim() || !anonKey.trim()) { setError('Enter your Supabase URL and anon key.'); return; }
    setConnecting(true); setError(null);
    const c = { url: url.trim(), anonKey: anonKey.trim() };
    try {
      await testConnection(c);
      saveSupabase(c); setCfg(c);
      setNotice('Connected to Supabase.');
    } catch (e) {
      setError(`${e instanceof Error ? e.message : 'Connection failed.'} — check the URL/key, that you ran the schema SQL, and that RLS lets the anon key read 'leads'.`);
    } finally { setConnecting(false); }
  };

  const disconnect = () => { clearSupabase(); setCfg(null); setLeads([]); setSuppressed(new Set()); };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = parseCsv(await file.text());
      if (!parsed.headers.length) { setError('That CSV has no header row.'); return; }
      setCsv(parsed);
      setMapping(guessMapping(parsed.headers));
      setError(null);
    } catch { setError('Could not read that file.'); }
  };

  const doImport = async () => {
    if (!cfg || !csv) return;
    if (!mapping.email) { setError('Map which column is the email address.'); return; }
    setBusy('import');
    try {
      const { leads: parsed, invalid } = rowsToLeads(csv.headers, csv.rows, mapping);
      if (!parsed.length) { setError('No valid email rows found.'); setBusy(null); return; }
      const clean = parsed.filter(l => !suppressed.has(l.email));
      const n = await importLeads(cfg, clean);
      await refresh(cfg);
      setCsv(null);
      setNotice(`Imported ${n} new leads (${parsed.length - clean.length} already unsubscribed, ${invalid} invalid emails skipped).`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Import failed.'); }
    finally { setBusy(null); }
  };

  const loadSample = () => {
    setOffer('AlbionLM — a UK-hosted, security-cleared AI for regulated organisations. Early-access pilots open.');
    setAudience('CISOs and heads of security at UK banks and public bodies');
    setSteps([
      { subject: 'Quick one, {{first_name}}', body: "Hi {{first_name}}, I'm building AlbionLM, a UK-hosted AI model for security teams who can't send data to US clouds. Thought it might be relevant to {{company}}. Worth a short look?", waitDays: 0 },
      { subject: 'Following up', body: "Hi {{first_name}}, circling back once in case this slipped past. Happy to send a one-page overview rather than a call if that's easier. Either way, no worries.", waitDays: 3 }
    ]);
    setNotice('Loaded a sample 2-step sequence. Edit it, then preview and export or launch.');
  };

  const genSeq = async () => {
    if (isDemo) { onOpenSettings(); return; }
    if (!offer.trim()) { setError('Describe what you\'re offering first.'); return; }
    setBusy('seq'); setError(null);
    try {
      setSteps(await generateSequence({ offer, audience, fromName, signature, steps: stepCount, humanize, keys, settings }));
      setNotice('Sequence written. Edit any step, then export for sending.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Sequence failed.'); }
    finally { setBusy(null); }
  };

  const addUnsub = async () => {
    if (!cfg || !unsubEmail.trim()) return;
    try { await addUnsubscribe(cfg, unsubEmail); setUnsubEmail(''); await refresh(cfg); setNotice('Added to the suppression list.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not add.'); }
  };

  const saveEngineCfg = () => {
    if (!fnUrl.trim() || !secret.trim()) { setError('Enter the functions URL and the outreach secret.'); return; }
    const e = { functionsUrl: fnUrl.trim(), secret: secret.trim() }; saveEngine(e); setEngine(e); setNotice('Sending engine saved.');
  };
  const launch = async () => {
    if (!cfg || !engine) return;
    if (!steps.length) { setError('Generate a sequence first.'); return; }
    if (!fromEmail.trim()) { setError('Enter the From email (a verified sender on your email provider).'); return; }
    if (!window.confirm(`Launch "${campaignName}" to ${sendable.length} leads? The engine will start sending on its schedule. Make sure your domain is warmed up and you have a lawful basis to contact these people.`)) return;
    setLaunching(true); setError(null);
    try {
      const res = await launchCampaign(cfg, engine, { name: campaignName, steps, from_name: fromName, from_email: fromEmail.trim(), reply_to: replyTo.trim() || undefined, signature, physical_address: address });
      await refresh(cfg); fetchStats(cfg).then(setStats).catch(() => {});
      setNotice(`Launched: ${res.leads_queued} leads queued, ${res.messages_created} emails scheduled. The engine sends them on its cron schedule.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Launch failed.'); }
    finally { setLaunching(false); }
  };

  const exportCsv = () => {
    if (!steps.length) { setError('Generate a sequence first.'); return; }
    const data = campaignToCsv(leads, steps, signature, address, suppressed);
    const blob = new Blob([data], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `outreach-campaign-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  };

  const copySql = async () => { await navigator.clipboard.writeText(SCHEMA_SQL).catch(() => {}); setNotice('Schema SQL copied. Paste it into Supabase → SQL Editor and run it.'); };

  const sendable = leads.filter(l => !suppressed.has(l.email));
  const preview = useMemo(() => (steps[0] && sendable[0] ? renderStep(steps[0], sendable[0], signature, address) : null), [steps, sendable, signature, address]);

  // --- Not connected ------------------------------------------------------------------------------
  if (!cfg) {
    return (
      <div className="ou-container animate-fade">
        <header><h2><Send size={22} /> Outreach</h2>
          <p className="ou-sub">Import leads from CSV into your own Supabase, write AI follow-up sequences, manage unsubscribes, and export a send-ready campaign for new clients.</p></header>
        {error && <div className="ou-error glass-panel"><AlertTriangle size={14} /> <span>{error}</span><button onClick={() => setError(null)}>✕</button></div>}
        <section className="ou-card glass-panel">
          <h3><Database size={16} /> Connect your Supabase project</h3>
          <p className="ou-muted">Free at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>. Create a project, then run the schema below once, then paste your URL and anon key (Project Settings → API).</p>
          <label className="ou-field"><span>Project URL</span><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" /></label>
          <label className="ou-field"><span>Anon (public) key</span><input value={anonKey} onChange={e => setAnonKey(e.target.value)} placeholder="eyJ..." /></label>
          <div className="ou-row">
            <button className="btn btn-primary ou-btn" disabled={connecting} onClick={connect}>{connecting ? <Loader2 size={14} className="ou-spin" /> : <Database size={14} />} Connect</button>
            <button className="btn btn-secondary ou-btn" onClick={() => setShowSql(!showSql)}>Schema SQL</button>
            <button className="btn btn-secondary ou-btn" onClick={copySql}><Copy size={14} /> Copy SQL</button>
          </div>
          <div className="ou-warn"><Shield size={13} /> Your anon key lives in this browser and is public. Keep your Supabase project private, enable RLS (the SQL does), and remember these are other people's details — follow GDPR/CAN-SPAM.</div>
          {showSql && <pre className="ou-sql">{SCHEMA_SQL}</pre>}
        </section>
      </div>
    );
  }

  // --- Connected ----------------------------------------------------------------------------------
  return (
    <div className="ou-container animate-fade">
      <header className="ou-header">
        <div><h2><Send size={22} /> Outreach</h2>
          <p className="ou-sub"><Database size={12} /> {cfg.url.replace('https://', '')} · {leads.length} leads · {suppressed.size} unsubscribed</p></div>
        <div className="ou-row">
          <button className="btn btn-secondary ou-btn" onClick={() => refresh(cfg)} disabled={!!busy}>{busy === 'loading' ? <Loader2 size={13} className="ou-spin" /> : <RefreshCw size={13} />} Refresh</button>
          <button className="ou-link" onClick={disconnect}>Disconnect</button>
        </div>
      </header>

      <div className="ou-note glass-panel">
        <AlertTriangle size={14} /> This prepares and stores your campaign. <b>Actual sending, open/click tracking and automated drip retries need a sending provider</b> (Instantly, Smartlead, Lemlist, Mailchimp, or SendGrid/Resend + a server). Export your campaign below and run it there — see the Send tab.
      </div>

      {notice && <div className="ou-notice glass-panel"><Check size={14} /> {notice}</div>}
      {error && <div className="ou-error glass-panel"><AlertTriangle size={14} /> <span>{error}</span><button onClick={() => setError(null)}>✕</button></div>}

      <div className="ou-tabs">
        <button className={tab === 'leads' ? 'on' : ''} onClick={() => setTab('leads')}><Upload size={13} /> Leads</button>
        <button className={tab === 'sequence' ? 'on' : ''} onClick={() => setTab('sequence')}><Mail size={13} /> Sequence</button>
        <button className={tab === 'suppression' ? 'on' : ''} onClick={() => setTab('suppression')}><UserX size={13} /> Unsubscribes</button>
        <button className={tab === 'send' ? 'on' : ''} onClick={() => setTab('send')}><Send size={13} /> Send</button>
      </div>

      {tab === 'leads' && (
        <section className="ou-card glass-panel">
          <h3>Import leads (CSV)</h3>
          <p className="ou-muted">New here? <a href="/outreach-test-leads.csv" download>Download a 3-row test CSV</a> (edit the emails to your own address, e.g. Gmail <code>you+test1@gmail.com</code> aliases all reach one inbox) to run a safe first test.</p>
          <input type="file" accept=".csv,text/csv" onChange={e => onFile(e.target.files?.[0])} />
          {csv && (
            <>
              <p className="ou-muted">{csv.rows.length} rows. Map your columns:</p>
              <div className="ou-grid">
                {FIELDS.map(f => (
                  <label key={f.key} className="ou-field"><span>{f.label}</span>
                    <select value={mapping[f.key] || ''} onChange={e => setMapping({ ...mapping, [f.key]: e.target.value })}>
                      <option value="">—</option>
                      {csv.headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </label>
                ))}
              </div>
              <button className="btn btn-primary ou-btn" disabled={busy === 'import'} onClick={doImport}>{busy === 'import' ? <Loader2 size={14} className="ou-spin" /> : <Upload size={14} />} Import to Supabase</button>
            </>
          )}
          <div className="ou-leads">
            {leads.slice(0, 50).map(l => (
              <div key={l.id || l.email} className="ou-lead"><strong>{l.email}</strong><span>{[l.first_name, l.company, l.title].filter(Boolean).join(' · ')}</span><em className={`st-${l.status}`}>{l.status}</em></div>
            ))}
            {leads.length > 50 && <p className="ou-muted">Showing 50 of {leads.length}.</p>}
          </div>
        </section>
      )}

      {tab === 'sequence' && (
        <section className="ou-card glass-panel">
          <h3>Write the follow-up sequence</h3>
          <label className="ou-field"><span>What you're offering</span><textarea rows={2} value={offer} onChange={e => setOffer(e.target.value)} placeholder="e.g. AlbionLM — a UK-hosted, security-cleared AI for regulated organisations. Early-access pilots open." /></label>
          <label className="ou-field"><span>Who you're writing to</span><input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. CISOs and heads of security at UK banks" /></label>
          <div className="ou-grid">
            <label className="ou-field"><span>From name</span><input value={fromName} onChange={e => setFromName(e.target.value)} /></label>
            <label className="ou-field"><span>Steps (incl. follow-ups)</span><input type="number" min={1} max={5} value={stepCount} onChange={e => setStepCount(Math.max(1, Math.min(5, +e.target.value || 3)))} /></label>
          </div>
          <label className="ou-field"><span>Signature</span><textarea rows={3} value={signature} onChange={e => setSignature(e.target.value)} /></label>
          <label className="ou-field"><span>Physical address (required for CAN-SPAM)</span><input value={address} onChange={e => setAddress(e.target.value)} /></label>
          <label className="ou-check"><input type="checkbox" checked={humanize} onChange={e => setHumanize(e.target.checked)} /> Humanize the emails</label>
          <div className="ou-row">
            <button className="btn btn-primary ou-btn" disabled={busy === 'seq'} onClick={genSeq}>{busy === 'seq' ? <Loader2 size={14} className="ou-spin" /> : <Sparkles size={14} />} {steps.length ? 'Rewrite sequence' : 'Write sequence'}</button>
            <button className="btn btn-secondary ou-btn" onClick={loadSample}>Load sample sequence</button>
          </div>
          {steps.map((st, i) => (
            <div key={i} className="ou-step">
              <div className="ou-step-head"><strong>Step {i + 1}</strong>{i > 0 && <span className="ou-muted">send {st.waitDays} days after step {i}</span>}</div>
              <input className="ou-subj" value={st.subject} onChange={e => setSteps(steps.map((x, j) => j === i ? { ...x, subject: e.target.value } : x))} />
              <textarea rows={5} value={st.body} onChange={e => setSteps(steps.map((x, j) => j === i ? { ...x, body: e.target.value } : x))} />
            </div>
          ))}
          {preview && <div className="ou-preview"><strong>Preview (step 1 → {sendable[0]?.email}):</strong><div className="ou-prev-sub">{preview.subject}</div><div className="ou-out"><SafeMarkdown text={preview.body} /></div></div>}
        </section>
      )}

      {tab === 'suppression' && (
        <section className="ou-card glass-panel">
          <h3>Unsubscribes / suppression list</h3>
          <p className="ou-muted">Anyone here is never exported into a campaign. Add people who ask to opt out, or import a suppression CSV via the Leads tab logic. Keeping this list is a legal requirement.</p>
          <div className="ou-row">
            <input className="ou-grow" value={unsubEmail} onChange={e => setUnsubEmail(e.target.value)} placeholder="email@company.com" />
            <button className="btn btn-primary ou-btn" onClick={addUnsub}><UserX size={14} /> Add</button>
          </div>
          <div className="ou-leads">{[...suppressed].slice(0, 100).map(e => <div key={e} className="ou-lead"><strong>{e}</strong></div>)}</div>
        </section>
      )}

      {tab === 'send' && (
        <section className="ou-card glass-panel">
          <h3>Send the campaign</h3>
          <p className="ou-muted">{sendable.length} leads ready ({suppressed.size} suppressed).</p>

          {/* Option 1: export to a sending platform */}
          <div className="ou-send-how">
            <h4>Option 1 — export to a sending platform (no backend)</h4>
            <button className="btn btn-secondary ou-btn" disabled={!steps.length || !sendable.length} onClick={exportCsv}><Download size={14} /> Export send-ready CSV ({sendable.length}×{steps.length})</button>
            <p className="ou-muted">Import into <a href="https://instantly.ai" target="_blank" rel="noopener noreferrer">Instantly</a>, Smartlead or Lemlist — they handle sending, tracking, follow-ups and unsubscribe.</p>
          </div>

          {/* Option 2: the built-in sending engine */}
          <div className="ou-send-how">
            <h4>Option 2 — your own sending engine (Supabase Edge Functions)</h4>
            <p className="ou-muted">Deploy the engine in <code>supabase/functions</code> (see docs/OUTREACH_SENDING_ENGINE.md). It sends via Resend, tracks opens/clicks, runs the follow-up drip, and stops on reply/unsubscribe — all on your own infrastructure.</p>
            {!engine ? (
              <>
                <label className="ou-field"><span>Functions base URL</span><input value={fnUrl} onChange={e => setFnUrl(e.target.value)} placeholder="https://<ref>.functions.supabase.co" /></label>
                <label className="ou-field"><span>Outreach secret (the OUTREACH_SECRET you set on the functions)</span><input value={secret} onChange={e => setSecret(e.target.value)} placeholder="a long random string" /></label>
                <button className="btn btn-secondary ou-btn" onClick={saveEngineCfg}>Save engine</button>
              </>
            ) : (
              <>
                <div className="ou-grid">
                  <label className="ou-field"><span>Campaign name</span><input value={campaignName} onChange={e => setCampaignName(e.target.value)} /></label>
                  <label className="ou-field"><span>From email (verified sender)</span><input value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="gene@voxstar.com" /></label>
                  <label className="ou-field"><span>Reply-to (optional)</span><input value={replyTo} onChange={e => setReplyTo(e.target.value)} /></label>
                </div>
                <div className="ou-row">
                  <button className="btn btn-primary ou-btn" disabled={launching || !steps.length} onClick={launch}>{launching ? <Loader2 size={14} className="ou-spin" /> : <Send size={14} />} Launch campaign ({sendable.length} leads)</button>
                  <button className="ou-link" onClick={() => { saveEngine({ functionsUrl: '', secret: '' }); setEngine(null); }}>Change engine settings</button>
                </div>
                {stats && (
                  <div className="ou-stats">
                    {([['Sent', stats.sent], ['Opened', stats.opened], ['Clicked', stats.clicked], ['Replied', stats.replied], ['Queued', stats.queued], ['Unsub/cancelled', stats.cancelled], ['Failed', stats.failed]] as [string, number][]).map(([k, v]) => (
                      <div key={k} className="ou-stat"><strong>{v}</strong><span>{k}</span></div>
                    ))}
                    <button className="ou-link" onClick={() => cfg && fetchStats(cfg).then(setStats).catch(() => {})}>Refresh stats</button>
                  </div>
                )}
              </>
            )}
          </div>

          <p className="ou-muted"><Shield size={12} /> Cold email is regulated. Only email people you have a lawful basis to contact, keep the opt-out working, and warm up your sending domain. <a href="https://gdpr.eu/email-encryption/" target="_blank" rel="noopener noreferrer">GDPR for email</a></p>
        </section>
      )}

      <style>{STYLES}</style>
    </div>
  );
};

const STYLES = `
  .ou-container { display: flex; flex-direction: column; gap: 14px; padding: 8px 4px 40px; }
  .ou-container h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 4px; font-family: var(--font-heading); color: var(--text-primary); }
  .ou-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
  .ou-sub { color: var(--text-secondary); max-width: 740px; margin: 0; font-size: 0.9rem; line-height: 1.5; display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
  .ou-note { display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; font-size: 0.84rem; color: var(--text-secondary); border: 1px solid var(--warning); }
  .ou-warn { display: flex; align-items: flex-start; gap: 8px; font-size: 0.8rem; color: var(--text-muted); border: 1px solid var(--border-glass); border-radius: 8px; padding: 10px; }
  .ou-notice { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: var(--success); font-size: 0.85rem; }
  .ou-error { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: var(--danger); font-size: 0.85rem; }
  .ou-error span { flex: 1; } .ou-error button { background: none; border: none; color: inherit; cursor: pointer; }
  .ou-card { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
  .ou-card h3 { margin: 0; font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
  .ou-card h4 { margin: 0 0 6px; color: var(--text-primary); font-size: 0.9rem; }
  .ou-muted { color: var(--text-muted); font-size: 0.8rem; margin: 0; line-height: 1.5; }
  .ou-muted a, .ou-sub a, .ou-send-how a { color: var(--primary); }
  .ou-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
  .ou-field input, .ou-field select, .ou-field textarea, .ou-subj, .ou-step textarea, .ou-grow {
    background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 8px; padding: 8px 10px; font-family: var(--font-body); font-size: 0.86rem; resize: vertical;
  }
  .ou-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
  .ou-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .ou-grow { flex: 1; }
  .ou-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; padding: 7px 12px; align-self: flex-start; }
  .ou-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .ou-link { background: none; border: none; color: var(--text-secondary); cursor: pointer; text-decoration: underline; font-size: 0.8rem; }
  .ou-link-ext { font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; text-decoration: none; }
  .ou-tabs { display: inline-flex; border: 1px solid var(--border-glass); border-radius: 8px; overflow: hidden; width: fit-content; }
  .ou-tabs button { background: none; border: none; color: var(--text-secondary); padding: 7px 14px; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
  .ou-tabs button.on { background: var(--primary); color: #fff; }
  .ou-sql { background: var(--bg-dark); border: 1px solid var(--border-glass); border-radius: 8px; padding: 12px; font-size: 0.72rem; max-height: 300px; overflow: auto; color: var(--text-secondary); white-space: pre; }
  .ou-leads { display: flex; flex-direction: column; gap: 2px; max-height: 360px; overflow-y: auto; }
  .ou-lead { display: flex; gap: 10px; align-items: center; padding: 5px 8px; border-bottom: 1px solid var(--border-glass); font-size: 0.8rem; }
  .ou-lead strong { color: var(--text-primary); } .ou-lead span { color: var(--text-muted); flex: 1; } .ou-lead em { font-size: 0.7rem; color: var(--text-muted); font-style: normal; }
  .ou-lead em.st-replied { color: var(--success); } .ou-lead em.st-unsubscribed { color: var(--danger); }
  .ou-check { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); }
  .ou-step { border: 1px solid var(--border-glass); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
  .ou-step-head { display: flex; justify-content: space-between; align-items: center; } .ou-step-head strong { color: var(--text-primary); font-size: 0.86rem; }
  .ou-step textarea { width: 100%; box-sizing: border-box; }
  .ou-preview { border: 1px solid var(--border-glass); border-radius: 8px; padding: 12px; } .ou-prev-sub { font-weight: 600; color: var(--text-primary); margin: 6px 0; }
  .ou-out { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap; }
  .ou-send-how { border-top: 1px solid var(--border-glass); padding-top: 12px; } .ou-send-how ul { margin: 0 0 8px; padding-left: 18px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.6; }
  .ou-send-how code { font-family: var(--font-mono); color: var(--accent); font-size: 0.8rem; }
  .ou-stats { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 8px; }
  .ou-stat { border: 1px solid var(--border-glass); border-radius: 8px; padding: 8px 14px; text-align: center; min-width: 72px; }
  .ou-stat strong { display: block; font-size: 1.2rem; color: var(--primary); } .ou-stat span { font-size: 0.7rem; color: var(--text-muted); }
  .ou-spin { animation: ou-spin 1s linear infinite; } @keyframes ou-spin { to { transform: rotate(360deg); } }
`;
