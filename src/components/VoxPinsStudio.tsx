import React, { useState, useEffect } from 'react';
import {
  Search, Loader2, Sparkles, FileText, ShoppingBag, ExternalLink, Download,
  Printer, Check, Trash2, AlertTriangle, Pin, ChevronRight, ClipboardCopy
} from 'lucide-react';
import { type ApiKeys, type ModelSettings } from '../utils/ai';
import {
  type PinResearchInput, type PinIdea, type PdfProduct,
  runResearch, runPinIdeas, runPdfOutline, runListingCopy,
  productToMarkdown, downloadFile, printProductAsPdf, PINCLICKS_URL
} from '../utils/voxpins';

interface Props {
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenSettings: () => void;
}

type Page = 'research' | 'ideas' | 'pdf' | 'sell';

const STORE = 'claude_machine_voxpins';

interface SavedState {
  input: PinResearchInput;
  research: string;
  ideas: PinIdea[];
  chosen: string[]; // chosen pin ids
  product: PdfProduct | null;
  listing: string;
}

const EMPTY: SavedState = {
  input: { niche: '', audience: '', goal: '', season: '', boardName: 'Voxstar', destinationUrl: '' },
  research: '',
  ideas: [],
  chosen: [],
  product: null,
  listing: ''
};

const load = (): SavedState => {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch { return EMPTY; }
};

export const VoxPinsStudio: React.FC<Props> = ({ keys, settings, onOpenSettings }) => {
  const [page, setPage] = useState<Page>('research');
  const [state, setState] = useState<SavedState>(load);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ideaCount, setIdeaCount] = useState(8);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const hasKey = settings.provider !== 'mock' && !!keys[settings.provider];
  const { input, research, ideas, chosen, product, listing } = state;
  const set = (patch: Partial<SavedState>) => setState(s => ({ ...s, ...patch }));
  const setInput = (patch: Partial<PinResearchInput>) => setState(s => ({ ...s, input: { ...s.input, ...patch } }));

  const guard = (): boolean => {
    setError(null);
    if (!hasKey) { setError('No AI model connected. Open Settings and add your Claude / Gemini / ChatGPT / Grok key.'); return false; }
    if (!input.niche.trim() || !input.audience.trim() || !input.goal.trim()) {
      setError('Fill in niche, audience and goal first — they drive every step.'); return false;
    }
    return true;
  };

  const doResearch = async () => {
    if (!guard()) return;
    setBusy('research');
    try { set({ research: await runResearch(input, keys, settings) }); setPage('research'); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(null); }
  };

  const doIdeas = async () => {
    if (!guard()) return;
    setBusy('ideas');
    try {
      const pins = await runPinIdeas(input, ideaCount, research, keys, settings);
      set({ ideas: pins, chosen: pins.map(p => p.id) });
      setPage('ideas');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not parse pin ideas — try again.'); }
    finally { setBusy(null); }
  };

  const doPdf = async () => {
    if (!guard()) return;
    const picked = ideas.filter(p => chosen.includes(p.id));
    if (picked.length === 0) { setError('Pick at least one pin to include in the PDF.'); return; }
    setBusy('pdf');
    try { set({ product: await runPdfOutline(input, picked, keys, settings) }); setPage('pdf'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not build the PDF outline — try again.'); }
    finally { setBusy(null); }
  };

  const doListing = async () => {
    if (!product) { setError('Build the PDF product first.'); return; }
    if (!hasKey) { setError('No AI model connected.'); return; }
    setBusy('sell');
    try { set({ listing: await runListingCopy(product, input, keys, settings) }); setPage('sell'); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(null); }
  };

  const toggle = (id: string) =>
    set({ chosen: chosen.includes(id) ? chosen.filter(c => c !== id) : [...chosen, id] });

  const copyListing = () => {
    navigator.clipboard.writeText(listing);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const resetAll = () => {
    if (window.confirm('Clear this VoxPins project and start fresh?')) { setState(EMPTY); setPage('research'); }
  };

  const Tab: React.FC<{ id: Page; icon: React.ReactNode; label: string; done?: boolean }> = ({ id, icon, label, done }) => (
    <button className={`vp-tab ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}>
      {icon}<span>{label}</span>{done && <Check size={13} className="vp-tab-done" />}
    </button>
  );

  return (
    <div className="vp-wrap animate-fade">
      <header className="vp-head glass-panel">
        <div className="vp-title">
          <Pin size={22} className="vp-logo" />
          <div>
            <h2>VoxPins</h2>
            <p>Research the best pins for a niche, package the winners into a PDF, and list it for sale.</p>
          </div>
        </div>
        <div className="vp-head-actions">
          <a className="btn btn-secondary" href={PINCLICKS_URL} target="_blank" rel="noopener noreferrer" title="Open PinClicks for real keyword & pin data">
            <ExternalLink size={15} /> PinClicks data
          </a>
          <button className="btn btn-secondary" onClick={resetAll}><Trash2 size={15} /> Reset</button>
        </div>
      </header>

      {!hasKey && (
        <div className="vp-note warn">
          <AlertTriangle size={15} />
          <span>Demo mode has no real model. <button onClick={onOpenSettings}>Open Settings</button> and add a key — every VoxPins step is a real AI call.</span>
        </div>
      )}
      {error && <div className="vp-note err"><AlertTriangle size={15} /><span>{error}</span></div>}

      <div className="vp-tabs">
        <Tab id="research" icon={<Search size={15} />} label="1 · Research" done={!!research} />
        <Tab id="ideas" icon={<Sparkles size={15} />} label="2 · Pin Ideas" done={ideas.length > 0} />
        <Tab id="pdf" icon={<FileText size={15} />} label="3 · PDF Builder" done={!!product} />
        <Tab id="sell" icon={<ShoppingBag size={15} />} label="4 · Sell" done={!!listing} />
      </div>

      {/* Brief — shared across every page */}
      <div className="vp-brief glass-panel">
        <div className="vp-field">
          <label>Niche / topic</label>
          <input value={input.niche} onChange={e => setInput({ niche: e.target.value })} placeholder="e.g. cozy home office setups" />
        </div>
        <div className="vp-field">
          <label>Audience</label>
          <input value={input.audience} onChange={e => setInput({ audience: e.target.value })} placeholder="e.g. remote workers, women 25-45" />
        </div>
        <div className="vp-field">
          <label>Goal / what you'll sell</label>
          <input value={input.goal} onChange={e => setInput({ goal: e.target.value })} placeholder="e.g. a printable desk-setup planner on Etsy" />
        </div>
        <div className="vp-field">
          <label>Pinterest board</label>
          <input value={input.boardName} onChange={e => setInput({ boardName: e.target.value })} placeholder="Voxstar" />
        </div>
        <div className="vp-field">
          <label>Destination URL — pins point here (your PDF / sales page)</label>
          <input value={input.destinationUrl} onChange={e => setInput({ destinationUrl: e.target.value })} placeholder="https://voxstar.com/pins/your-pdf" />
        </div>
        <div className="vp-field short">
          <label>Season (optional)</label>
          <input value={input.season} onChange={e => setInput({ season: e.target.value })} placeholder="e.g. back to work" />
        </div>
      </div>

      {/* PAGE 1 — RESEARCH */}
      {page === 'research' && (
        <div className="vp-page glass-panel">
          <div className="vp-page-head">
            <h3>Pin research</h3>
            <button className="btn btn-primary" onClick={doResearch} disabled={busy === 'research'}>
              {busy === 'research' ? <><Loader2 size={15} className="spin" /> Researching…</> : <><Search size={15} /> Research best pins</>}
            </button>
          </div>
          <p className="vp-hint">What pins win in this niche, which keywords to target, and the fastest route to a sellable PDF. Verify search volume in <a href={PINCLICKS_URL} target="_blank" rel="noopener noreferrer">PinClicks</a>.</p>
          {research
            ? <div className="vp-output"><pre>{research}</pre></div>
            : <div className="vp-empty">No research yet. Fill the brief above and hit <strong>Research best pins</strong>.</div>}
          {research && (
            <div className="vp-next">
              <button className="btn btn-secondary" onClick={() => downloadFile('voxpins-research.md', research, 'text/markdown')}><Download size={14} /> Download notes</button>
              <button className="btn btn-primary" onClick={doIdeas} disabled={busy === 'ideas'}>Next: pin ideas <ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      )}

      {/* PAGE 2 — PIN IDEAS */}
      {page === 'ideas' && (
        <div className="vp-page glass-panel">
          <div className="vp-page-head">
            <h3>Pin ideas <span className="vp-count">{chosen.length}/{ideas.length} chosen</span></h3>
            <div className="vp-inline">
              <label className="vp-mini">How many
                <select value={ideaCount} onChange={e => setIdeaCount(Number(e.target.value))}>
                  {[6, 8, 10, 12, 16].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <button className="btn btn-primary" onClick={doIdeas} disabled={busy === 'ideas'}>
                {busy === 'ideas' ? <><Loader2 size={15} className="spin" /> Generating…</> : <><Sparkles size={15} /> {ideas.length ? 'Regenerate' : 'Generate'} ideas</>}
              </button>
            </div>
          </div>
          {ideas.length === 0
            ? <div className="vp-empty">No ideas yet. Hit <strong>Generate ideas</strong> — tick the ones you like, they feed the PDF.</div>
            : (
              <>
                <div className="vp-boardbar">
                  <Pin size={14} /> Board: <strong>{input.boardName || 'Voxstar'}</strong>
                  {input.destinationUrl
                    ? <span className="vp-boardbar-url">→ all pins link to <a href={input.destinationUrl} target="_blank" rel="noopener noreferrer">{input.destinationUrl}</a></span>
                    : <span className="vp-boardbar-url muted">→ set a Destination URL above so pins point to your PDF</span>}
                </div>
                <div className="vp-ideas">
                  {ideas.map(p => (
                    <label key={p.id} className={`vp-idea ${chosen.includes(p.id) ? 'on' : ''}`}>
                      <input type="checkbox" checked={chosen.includes(p.id)} onChange={() => toggle(p.id)} />
                      <div className="vp-idea-body">
                        <div className="vp-idea-top"><span className="vp-fmt">{p.format}</span><span className="vp-board">{input.boardName || 'Voxstar'} › {p.boardIdea}</span></div>
                        <h4>{p.title}</h4>
                        <p className="vp-overlay">“{p.overlayText}”</p>
                        <p className="vp-desc">{p.description}</p>
                        <div className="vp-kw">{p.keywords.map(k => <span key={k}>{k}</span>)}</div>
                        {p.destinationUrl && <p className="vp-link"><ExternalLink size={11} /> {p.destinationUrl}</p>}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="vp-next">
                  <button className="btn btn-secondary" onClick={() => downloadFile('voxpins-ideas.json', JSON.stringify(ideas, null, 2), 'application/json')}><Download size={14} /> Export ideas JSON</button>
                  <button className="btn btn-primary" onClick={doPdf} disabled={busy === 'pdf'}>
                    {busy === 'pdf' ? <><Loader2 size={15} className="spin" /> Building…</> : <>Next: build PDF <ChevronRight size={14} /></>}
                  </button>
                </div>
              </>
            )}
        </div>
      )}

      {/* PAGE 3 — PDF BUILDER */}
      {page === 'pdf' && (
        <div className="vp-page glass-panel">
          <div className="vp-page-head">
            <h3>PDF product</h3>
            <button className="btn btn-primary" onClick={doPdf} disabled={busy === 'pdf'}>
              {busy === 'pdf' ? <><Loader2 size={15} className="spin" /> Building…</> : <><FileText size={15} /> {product ? 'Rebuild' : 'Build'} outline</>}
            </button>
          </div>
          {!product
            ? <div className="vp-empty">Pick pins on the <strong>Pin Ideas</strong> page, then build the outline here.</div>
            : (
              <>
                <div className="vp-product">
                  <h2 className="vp-prod-title">{product.title}</h2>
                  <p className="vp-prod-sub">{product.subtitle}</p>
                  <p className="vp-prod-intro">{product.intro}</p>
                  {product.sections.map((s, i) => (
                    <div key={i} className="vp-prod-sec"><h4>{s.heading}</h4><p>{s.body}</p></div>
                  ))}
                  <div className="vp-prod-sec"><h4>The Pins ({product.pins.length})</h4>
                    <ul className="vp-prod-pins">{product.pins.map(p => <li key={p.id}><strong>{p.title}</strong> — {p.format}</li>)}</ul>
                  </div>
                </div>
                <div className="vp-next">
                  <button className="btn btn-secondary" onClick={() => downloadFile('voxpins-product.md', productToMarkdown(product, input), 'text/markdown')}><Download size={14} /> Download .md</button>
                  <button className="btn btn-secondary" onClick={() => printProductAsPdf(product, input)}><Printer size={14} /> Print / Save as PDF</button>
                  <button className="btn btn-primary" onClick={doListing} disabled={busy === 'sell'}>
                    {busy === 'sell' ? <><Loader2 size={15} className="spin" /> Writing…</> : <>Next: sell it <ChevronRight size={14} /></>}
                  </button>
                </div>
              </>
            )}
        </div>
      )}

      {/* PAGE 4 — SELL */}
      {page === 'sell' && (
        <div className="vp-page glass-panel">
          <div className="vp-page-head">
            <h3>Listing copy</h3>
            <button className="btn btn-primary" onClick={doListing} disabled={busy === 'sell' || !product}>
              {busy === 'sell' ? <><Loader2 size={15} className="spin" /> Writing…</> : <><ShoppingBag size={15} /> {listing ? 'Rewrite' : 'Write'} Etsy / shop listing</>}
            </button>
          </div>
          <p className="vp-hint">Title, tags, description, price range and promo pins to sell the PDF on Etsy or your own sites.</p>
          {listing
            ? (
              <>
                <div className="vp-output"><pre>{listing}</pre></div>
                <div className="vp-next">
                  <button className="btn btn-secondary" onClick={copyListing}>{copied ? <><Check size={14} /> Copied</> : <><ClipboardCopy size={14} /> Copy all</>}</button>
                  <button className="btn btn-secondary" onClick={() => downloadFile('voxpins-listing.md', listing, 'text/markdown')}><Download size={14} /> Download .md</button>
                </div>
              </>
            )
            : <div className="vp-empty">Build the PDF product first, then write the listing here.</div>}
        </div>
      )}

      <style>{`
        .vp-wrap { display: flex; flex-direction: column; gap: 16px; padding-bottom: 32px; }
        .vp-head { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; gap: 16px; flex-wrap: wrap; }
        .vp-title { display: flex; align-items: center; gap: 14px; }
        .vp-logo { color: #e60023; filter: drop-shadow(0 0 8px rgba(230,0,35,0.4)); }
        .vp-title h2 { font-size: 20px; font-weight: 800; }
        .vp-title p { font-size: 13px; color: var(--text-secondary); margin-top: 2px; max-width: 520px; }
        .vp-head-actions { display: flex; gap: 10px; }
        .vp-note { display: flex; align-items: center; gap: 10px; padding: 11px 16px; border-radius: 10px; font-size: 13px; }
        .vp-note.warn { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); color: #fcd34d; }
        .vp-note.err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
        .vp-note button { background: none; border: none; color: inherit; text-decoration: underline; cursor: pointer; font-weight: 600; }
        .vp-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .vp-tab { display: flex; align-items: center; gap: 7px; padding: 9px 15px; border-radius: 9px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); color: var(--text-secondary); cursor: pointer; font-size: 13px; font-weight: 600; transition: var(--transition-smooth); }
        .vp-tab:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .vp-tab.active { background: rgba(230,0,35,0.12); border-color: rgba(230,0,35,0.4); color: #ff6b81; }
        .vp-tab-done { color: var(--success); }
        .vp-brief { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 18px 22px; }
        .vp-field { display: flex; flex-direction: column; gap: 6px; }
        .vp-field.short { }
        .vp-field label { font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; }
        .vp-field input { background: rgba(5,7,12,0.5); border: 1px solid var(--border-glass); border-radius: 8px; padding: 10px 12px; color: #fff; font-size: 13.5px; outline: none; }
        .vp-field input:focus { border-color: #e60023; }
        .vp-page { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
        .vp-page-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .vp-page-head h3 { font-size: 17px; font-weight: 700; }
        .vp-count { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-left: 8px; }
        .vp-inline { display: flex; align-items: center; gap: 12px; }
        .vp-mini { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }
        .vp-mini select { background: rgba(5,7,12,0.5); border: 1px solid var(--border-glass); border-radius: 7px; color: #fff; padding: 5px 8px; }
        .vp-hint { font-size: 12.5px; color: var(--text-secondary); }
        .vp-hint a { color: #ff6b81; }
        .vp-output { background: #090c12; border: 1px solid var(--border-glass); border-radius: 10px; padding: 18px; max-height: 520px; overflow-y: auto; }
        .vp-output pre { font-family: var(--font-mono); font-size: 13px; color: #e5e7eb; white-space: pre-wrap; line-height: 1.55; }
        .vp-empty { padding: 36px; text-align: center; color: var(--text-muted); font-size: 13.5px; background: rgba(255,255,255,0.02); border-radius: 10px; }
        .vp-next { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }
        .vp-ideas { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
        .vp-idea { display: flex; gap: 10px; padding: 14px; border: 1px solid var(--border-glass); border-radius: 10px; background: rgba(255,255,255,0.02); cursor: pointer; transition: var(--transition-smooth); }
        .vp-idea.on { border-color: rgba(230,0,35,0.4); background: rgba(230,0,35,0.06); }
        .vp-idea input { margin-top: 3px; accent-color: #e60023; }
        .vp-idea-body { flex: 1; min-width: 0; }
        .vp-idea-top { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
        .vp-fmt { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; color: #ff6b81; font-weight: 700; }
        .vp-board { font-size: 10.5px; color: var(--text-muted); }
        .vp-idea-body h4 { font-size: 14px; font-weight: 700; color: #fff; }
        .vp-overlay { font-size: 13px; color: var(--text-secondary); font-style: italic; margin: 3px 0; }
        .vp-desc { font-size: 12.5px; color: var(--text-secondary); }
        .vp-kw { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
        .vp-kw span { font-size: 10.5px; background: rgba(255,255,255,0.05); border-radius: 99px; padding: 2px 9px; color: var(--text-secondary); }
        .vp-link { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #ff6b81; margin-top: 8px; word-break: break-all; }
        .vp-boardbar { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; font-size: 13px; color: var(--text-secondary); background: rgba(230,0,35,0.06); border: 1px solid rgba(230,0,35,0.25); border-radius: 9px; padding: 9px 14px; }
        .vp-boardbar strong { color: #fff; }
        .vp-boardbar-url a { color: #ff6b81; word-break: break-all; }
        .vp-boardbar-url.muted { color: var(--text-muted); }
        .vp-product { background: #090c12; border: 1px solid var(--border-glass); border-radius: 10px; padding: 22px; max-height: 520px; overflow-y: auto; }
        .vp-prod-title { font-size: 22px; font-weight: 800; color: #fff; }
        .vp-prod-sub { font-size: 15px; color: #ff6b81; font-style: italic; margin: 2px 0 12px; }
        .vp-prod-intro { font-size: 13.5px; color: var(--text-secondary); line-height: 1.55; }
        .vp-prod-sec { margin-top: 16px; }
        .vp-prod-sec h4 { font-size: 14px; color: #fff; font-weight: 700; margin-bottom: 4px; }
        .vp-prod-sec p { font-size: 13px; color: var(--text-secondary); line-height: 1.55; }
        .vp-prod-pins { margin: 0; padding-left: 18px; }
        .vp-prod-pins li { font-size: 13px; color: var(--text-secondary); margin: 3px 0; }
        .spin { animation: vp-spin 1s linear infinite; }
        @keyframes vp-spin { to { transform: rotate(360deg); } }
        @media (max-width: 680px) { .vp-brief { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};
