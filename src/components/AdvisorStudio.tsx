import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Loader2, AlertTriangle, CheckCircle2, Info, ArrowRight, RefreshCw, Copy, Check } from 'lucide-react';
import { type ApiKeys, type ModelSettings, PROVIDER_NAMES } from '../utils/ai';
import { type HealthItem, computeHealth, generateAdvice } from '../utils/advisor';
import { SafeMarkdown } from './SpecialistRunner';

// Health check = local facts only (instant, free). AI review = one real LLM call (web-searched when the
// provider supports it). Neither changes anything; they point to the screens that do.

interface AdvisorStudioProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onNavigate: (view: string, siteId?: string) => void;
}

const REPORT_KEY = 'claude_machine_advisor_report';

const loadReport = (): { text: string; at: number } | null => {
  try {
    return JSON.parse(localStorage.getItem(REPORT_KEY) || 'null');
  } catch {
    return null;
  }
};

export const AdvisorStudio: React.FC<AdvisorStudioProps> = ({ keys, settings, onNavigate }) => {
  const [items, setItems] = useState<HealthItem[] | null>(null);
  const [facts, setFacts] = useState('');
  const [report, setReport] = useState(loadReport);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    const res = await computeHealth(keys, settings);
    setItems(res.items);
    setFacts(res.facts);
  }, [keys, settings]);

  useEffect(() => { refresh(); }, [refresh]);

  const getAdvice = async () => {
    setBusy(true);
    setError(null);
    try {
      const text = await generateAdvice(facts, keys, settings);
      const next = { text, at: Date.now() };
      setReport(next);
      try { localStorage.setItem(REPORT_KEY, JSON.stringify(next)); } catch { /* storage blocked */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The review failed.');
    } finally {
      setBusy(false);
    }
  };

  const icon = (level: HealthItem['level']) =>
    level === 'action' ? <AlertTriangle size={15} className="adv-warn" /> : level === 'ok' ? <CheckCircle2 size={15} className="adv-ok" /> : <Info size={15} className="adv-info" />;

  return (
    <div className="adv-container animate-fade">
      <header>
        <h2><Lightbulb size={22} /> Advisor</h2>
        <p className="adv-sub">What to fix, what you're not using, and how to make more from your sites. The checklist is worked out on this device; the review is written by your AI.</p>
      </header>

      <section className="adv-card glass-panel">
        <div className="adv-row">
          <h3>Health check</h3>
          <button className="adv-link" onClick={refresh}><RefreshCw size={12} /> Refresh</button>
        </div>
        {!items && <p className="adv-muted"><Loader2 size={13} className="adv-spin" /> Checking…</p>}
        {items?.map((it, i) => (
          <div key={i} className={`adv-item lv-${it.level}`}>
            {icon(it.level)}
            <div>
              <strong>{it.title}</strong>
              <p>{it.detail}</p>
            </div>
            {it.view && <button className="adv-go" onClick={() => onNavigate(it.view!, it.siteId)}>Fix <ArrowRight size={12} /></button>}
          </div>
        ))}
      </section>

      <section className="adv-card glass-panel">
        <div className="adv-row">
          <h3>AI business review</h3>
          <button className="btn btn-primary adv-btn" disabled={busy || settings.provider === 'mock'} onClick={getAdvice}>
            {busy ? <Loader2 size={14} className="adv-spin" /> : <Lightbulb size={14} />} {report ? 'Get a fresh review' : 'Get my review'}
          </button>
          {report && <button className="btn btn-secondary adv-btn" onClick={async () => { await navigator.clipboard.writeText(report.text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check size={13} /> : <Copy size={13} />} Copy</button>}
        </div>
        <p className="adv-muted">
          Uses {PROVIDER_NAMES[settings.provider]}{settings.provider === 'gemini' || settings.provider === 'openai' ? ', with web search to look at your sites and market' : ' (no web search with this provider: switch to Gemini or ChatGPT in Settings for a review that looks at your live sites)'}.
          Takes a minute or two.
        </p>
        {error && <div className="adv-error"><AlertTriangle size={14} /> {error}</div>}
        {report && (
          <>
            <p className="adv-muted">Last review: {new Date(report.at).toLocaleString('en-GB')}</p>
            <div className="adv-report"><SafeMarkdown text={report.text} /></div>
          </>
        )}
      </section>

      <style>{`
        .adv-container { display: flex; flex-direction: column; gap: 16px; padding: 8px 4px 40px; max-width: 980px; }
        .adv-container h2 { display: flex; align-items: center; gap: 10px; font-family: var(--font-heading); margin: 0 0 6px; color: var(--text-primary); }
        .adv-sub { color: var(--text-secondary); margin: 0; font-size: 0.9rem; line-height: 1.5; }
        .adv-card { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
        .adv-card h3 { margin: 0; font-size: 1rem; color: var(--text-primary); flex: 1; }
        .adv-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .adv-muted { color: var(--text-muted); font-size: 0.8rem; margin: 0; }
        .adv-link { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; }
        .adv-item { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border: 1px solid var(--border-glass); border-radius: 8px; }
        .adv-item > div { flex: 1; }
        .adv-item strong { color: var(--text-primary); font-size: 0.88rem; }
        .adv-item p { margin: 2px 0 0; color: var(--text-secondary); font-size: 0.82rem; line-height: 1.45; }
        .adv-item.lv-action { border-color: var(--warning); }
        .adv-warn { color: var(--warning); margin-top: 2px; flex-shrink: 0; }
        .adv-ok { color: var(--success); margin-top: 2px; flex-shrink: 0; }
        .adv-info { color: var(--primary); margin-top: 2px; flex-shrink: 0; }
        .adv-go { background: none; border: 1px solid var(--border-glass); border-radius: 6px; color: var(--text-secondary); font-size: 0.78rem; padding: 4px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .adv-go:hover { color: var(--primary); border-color: var(--primary); }
        .adv-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; padding: 7px 12px; }
        .adv-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .adv-error { display: flex; align-items: center; gap: 8px; color: var(--danger); font-size: 0.85rem; }
        .adv-report { border: 1px solid var(--border-glass); border-radius: 8px; padding: 14px 18px; background: var(--bg-dark); }
        .adv-spin { animation: adv-spin 1s linear infinite; }
        @keyframes adv-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
