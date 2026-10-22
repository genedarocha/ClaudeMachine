import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Newspaper, Search, PenLine, Copy, Check, Loader2, AlertTriangle, ShieldCheck, ExternalLink,
  RefreshCw, Download, Image as ImageIcon, Eye, Pencil, CheckCircle2, Wand2, ChevronDown, ChevronUp
} from 'lucide-react';
import { type ApiKeys, type ModelSettings, humanizeLongform } from '../utils/ai';
import { checkHumanizer, readVoiceSamples } from '../utils/humanizer';
import {
  type NewsStory, type NewsletterImage, imageUrl, issueTitle, sourcesMarkdown, assembleArticle, markdownToHtml, markdownToPlain, formatRange
} from '../utils/newsletter';
import { NEWSLETTER_NAME, DEFAULT_BYLINE, DEFAULT_SIGNATURE, OUR_NEWS_PLACEHOLDER, PODCAST_PLACEHOLDER } from '../data/newsletterDefaults';
import {
  type NewsletterSetup, type NewsletterDraftState, type ArchivedIssue, NEWSLETTER_EVENT, loadNewsletterState, saveNewsletterState,
  researchStories, writeNewsletterDraft, upsertNewsletterEntry, todayIso, isoDaysAgo, nextFriday
} from '../utils/newsletterPipeline';
import { addDays } from '../utils/contentStore';

const dayAfter = (iso: string) => addDays(iso, 1);

// REAL: research uses live web search through the user's key (generateGroundedText) and each story's
// sources are checked against the pages the search actually returned. Writing is a real LLM call with
// the humanizer. Images come from Pollinations' free generator (plain image URLs). Nothing is posted:
// the user copies the result into LinkedIn's newsletter editor themselves.

type Setup = NewsletterSetup;
type Draft = NewsletterDraftState;

interface NewsletterStudioProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenSettings: () => void;
}

export const NewsletterStudio: React.FC<NewsletterStudioProps> = ({ keys, settings, onOpenSettings }) => {
  const initial = useRef(loadNewsletterState()).current;
  const [setup, setSetup] = useState<Setup>(initial.setup);
  const [stories, setStories] = useState<NewsStory[]>(initial.stories);
  const [draft, setDraft] = useState<Draft | null>(initial.draft);
  const [archive, setArchive] = useState<ArchivedIssue[]>(initial.archive);
  const [phase, setPhase] = useState<'idle' | 'researching' | 'writing' | 'humanizing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<'preview' | 'edit'>('preview');
  const [copied, setCopied] = useState<string | null>(null);
  const [showStyle, setShowStyle] = useState(false);
  // Pollinations' free tier allows one image per ~45 seconds per IP, so images are requested one at a
  // time: `requested` holds the URLs released so far, `settled` those that loaded or failed.
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [settled, setSettled] = useState<Record<string, 'ok' | 'error'>>({});
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const imgRefs = useRef<Record<string, HTMLImageElement | null>>({});

  useEffect(() => {
    saveNewsletterState({ ...loadNewsletterState(), setup, stories, draft, archive });
  }, [setup, stories, draft, archive]);

  // The Friday auto-draft runs at app level; pick up its result if this screen is open.
  useEffect(() => {
    const onUpdate = () => {
      const st = loadNewsletterState();
      setSetup(st.setup);
      setStories(st.stories);
      setDraft(st.draft);
      setNotice(`Issue #${st.setup.issueNumber} was drafted automatically. Review the stories and the draft below.`);
    };
    window.addEventListener(NEWSLETTER_EVENT, onUpdate);
    return () => window.removeEventListener(NEWSLETTER_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const IMAGE_GAP_MS = 46000;

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [cooldownUntil]);

  // Release the next image once the previous one has settled and the cooldown has passed.
  useEffect(() => {
    if (!draft) return;
    const urls = draft.images.map(imageUrl);
    const pending = urls.some(u => requested.has(u) && !settled[u]);
    if (pending || now < cooldownUntil) return;
    const next = urls.find(u => !requested.has(u));
    if (!next) return;
    setRequested(prev => new Set(prev).add(next));
    setCooldownUntil(Date.now() + IMAGE_GAP_MS);
    setNow(Date.now());
  }, [draft, requested, settled, now, cooldownUntil]);

  const cooldownSecs = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const markSettled = (url: string, result: 'ok' | 'error') => setSettled(prev => ({ ...prev, [url]: result }));

  const busy = phase !== 'idle';
  const isDemo = settings.provider === 'mock';
  const selectedStories = stories.filter(s => s.selected);
  const update = <K extends keyof Setup>(key: K, value: Setup[K]) => setSetup(prev => ({ ...prev, [key]: value }));

  // --- Step 1: research --------------------------------------------------------------------------
  const handleResearch = async () => {
    if (setup.from > setup.to) {
      setError('The "news from" date is after the "to" date.');
      return;
    }
    setError(null);
    setPhase('researching');
    try {
      const found = await researchStories(setup, keys, settings);
      setStories(found);
      setNotice(`${found.length} stories found. ${found.filter(s => s.selected).length} passed the source and date checks and are ticked.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed.');
    } finally {
      setPhase('idle');
    }
  };

  // --- Step 2: write -----------------------------------------------------------------------------
  const handleWrite = async () => {
    if (!selectedStories.length) {
      setError('Tick at least one story to write about.');
      return;
    }
    setError(null);
    setPhase('writing');
    try {
      const { draft: written, rewriteError } = await writeNewsletterDraft(setup, selectedStories, keys, settings, raw => {
        setDraft(raw);
        setPhase('humanizing');
      });
      setDraft(written);
      if (rewriteError) setError(rewriteError);
      setView('preview');
      const date = nextFriday(setup.issueDate);
      await upsertNewsletterEntry(setup.issueNumber, date, issueTitle(setup.issueNumber, written.subtitle), { status: 'draft', posts: { linkedin: written.body } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Writing failed.');
    } finally {
      setPhase('idle');
    }
  };

  const handleHumanizeAgain = async () => {
    if (!draft) return;
    setError(null);
    setPhase('humanizing');
    const human = await humanizeLongform(draft.body, keys, settings, readVoiceSamples(), true);
    setDraft({ ...draft, body: human.text, issues: human.issues });
    if (human.rewriteError) setError(human.rewriteError);
    setPhase('idle');
  };

  // --- Assembly ----------------------------------------------------------------------------------
  const title = draft ? issueTitle(setup.issueNumber, draft.subtitle) : '';
  const sourcesMd = setup.includeSources ? sourcesMarkdown(selectedStories) : '';
  const article = draft
    ? assembleArticle({ byline: setup.byline, issueDateIso: setup.issueDate, body: draft.body, sources: sourcesMd, signature: setup.signature })
    : '';

  const imagesByHeading = useMemo(() => {
    const map: Record<string, string> = {};
    for (const img of draft?.images || []) {
      const url = imageUrl(img);
      if (img.slot.toUpperCase() !== 'COVER' && settled[url] === 'ok') map[img.slot.toLowerCase()] = url;
    }
    return map;
  }, [draft?.images, settled]);

  const headings = useMemo(
    () => new Set((draft?.body.match(/^#{2,4}\s+(.+)$/gm) || []).map(h => h.replace(/^#+\s+/, '').trim().toLowerCase())),
    [draft?.body]
  );

  const previewHtml = useMemo(() => (article ? markdownToHtml(article, imagesByHeading) : ''), [article, imagesByHeading]);

  // --- Clipboard -----------------------------------------------------------------------------------
  const flash = (key: string) => {
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyPlain = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(key);
    } catch {
      setError('Clipboard access was blocked by the browser. Select the text and copy it manually.');
    }
  };

  // Copies formatted HTML (headings, bold, links survive pasting into LinkedIn's editor) with a
  // plain-text fallback. Images are left out: LinkedIn needs them uploaded, see the images panel.
  const copyArticle = async () => {
    const html = markdownToHtml(article);
    const plain = markdownToPlain(article);
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([plain], { type: 'text/plain' })
          })
        ]);
      } else {
        await navigator.clipboard.writeText(plain);
      }
      flash('article');
    } catch {
      setError('Clipboard access was blocked by the browser. Switch to Edit and copy the text manually.');
    }
  };

  // --- Images --------------------------------------------------------------------------------------
  const newVariation = (index: number) => {
    if (!draft || cooldownSecs > 0) return;
    const images = draft.images.map((img, i) => (i === index ? { ...img, seed: img.seed + 7919 } : img));
    setDraft({ ...draft, images });
  };

  // Saves the image already shown on screen (no second request, which the free tier would rate-limit).
  const downloadImage = (img: NewsletterImage, index: number) => {
    const url = imageUrl(img);
    const el = imgRefs.current[url];
    const name = `newsletter-${setup.issueNumber}-${index === 0 ? 'cover' : `image-${index}`}.jpg`;
    try {
      if (!el || !el.complete || !el.naturalWidth) throw new Error('not loaded');
      const canvas = document.createElement('canvas');
      canvas.width = el.naturalWidth;
      canvas.height = el.naturalHeight;
      canvas.getContext('2d')?.drawImage(el, 0, 0);
      canvas.toBlob(blob => {
        if (!blob) {
          window.open(url, '_blank', 'noopener');
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = name;
        a.click();
        URL.revokeObjectURL(blobUrl);
      }, 'image/jpeg', 0.92);
    } catch {
      window.open(url, '_blank', 'noopener');
      setNotice('Opened the image in a new tab. Right-click it and choose "Save image as".');
    }
  };

  // --- Publish bookkeeping -------------------------------------------------------------------------
  const markPublished = () => {
    if (!draft) return;
    if (!window.confirm(`Mark #${setup.issueNumber} as published? It becomes the style reference for #${setup.issueNumber + 1}, and the stories and draft are cleared.`)) return;
    setArchive(prev => [{ number: setup.issueNumber, date: setup.issueDate, title, article }, ...prev]);
    upsertNewsletterEntry(setup.issueNumber, nextFriday(setup.issueDate), title, { status: 'posted', posts: { linkedin: draft.body } }).catch(() => {});
    setSetup(prev => ({
      ...prev,
      issueNumber: prev.issueNumber + 1,
      lastIssue: draft.body,
      lastPublishedDate: prev.issueDate,
      ourNews: '',
      podcast: '',
      issueDate: todayIso(),
      from: dayAfter(prev.to),
      to: todayIso()
    }));
    setStories([]);
    setDraft(null);
    setNotice(`#${setup.issueNumber} archived. Ready for #${setup.issueNumber + 1}.`);
  };

  const confirmedCount = stories.filter(s => s.publisherConfirmed).length;

  return (
    <div className="nl-container animate-fade">
      <header className="nl-header">
        <div>
          <h2><Newspaper size={22} /> Weekly AI Automation Newsletter</h2>
          <p className="nl-sub">
            {NEWSLETTER_NAME}: find this week's real AI news with web search, check the sources, write issue #{setup.issueNumber} in your
            voice and format, then copy it into LinkedIn. Nothing is published automatically.
          </p>
        </div>
        <span className={`nl-model-pill ${isDemo || settings.provider === 'anthropic' ? 'warn' : ''}`} onClick={onOpenSettings} title="Change model in Settings">
          {isDemo ? 'Demo Mode: set Gemini or OpenAI in Settings' : settings.provider === 'anthropic' ? 'Research needs Gemini or OpenAI' : `${settings.provider} · ${settings.model}`}
        </span>
      </header>

      {notice && <div className="nl-notice glass-panel"><CheckCircle2 size={15} /> {notice}</div>}
      {error && <div className="nl-error glass-panel"><AlertTriangle size={15} /> <span>{error}</span><button onClick={() => setError(null)}>✕</button></div>}

      {/* SETUP */}
      <section className="nl-card glass-panel">
        <h3>Issue #{setup.issueNumber}</h3>
        <div className="nl-grid">
          <label className="nl-field">
            <span>Issue number</span>
            <input type="number" min={1} value={setup.issueNumber} onChange={e => update('issueNumber', Number(e.target.value) || 1)} />
          </label>
          <label className="nl-field">
            <span>Issue date</span>
            <input type="date" value={setup.issueDate} onChange={e => update('issueDate', e.target.value)} />
          </label>
          <label className="nl-field">
            <span>News from</span>
            <input type="date" value={setup.from} onChange={e => update('from', e.target.value)} />
          </label>
          <label className="nl-field">
            <span>News to</span>
            <input type="date" value={setup.to} onChange={e => update('to', e.target.value)} />
          </label>
        </div>
        <div className="nl-row">
          <span className="nl-hint">Window:</span>
          <button className="nl-chip" onClick={() => { update('from', isoDaysAgo(7)); update('to', todayIso()); }}>Last 7 days</button>
          <button className="nl-chip" onClick={() => { update('from', isoDaysAgo(14)); update('to', todayIso()); }}>Last 14 days</button>
          <button className="nl-chip" onClick={() => { update('from', dayAfter(setup.lastPublishedDate)); update('to', todayIso()); }}>
            Since last issue ({setup.lastPublishedDate})
          </button>
          <span className="nl-hint">{formatRange(setup.from, setup.to)}</span>
        </div>
        <label className="nl-field">
          <span>Good news from your side of the fence (Voxstar, AIToolboard, AlbionLM, ATL-Trust, Wiredvibe…)</span>
          <textarea rows={5} value={setup.ourNews} onChange={e => update('ourNews', e.target.value)} placeholder={OUR_NEWS_PLACEHOLDER} />
        </label>
        <label className="nl-field">
          <span>Podcast episode to feature (optional)</span>
          <textarea rows={3} value={setup.podcast} onChange={e => update('podcast', e.target.value)} placeholder={PODCAST_PLACEHOLDER} />
        </label>
        <button className="nl-link-btn" onClick={() => setShowStyle(!showStyle)}>
          {showStyle ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Format & style: byline, sign-off, last issue reference
        </button>
        {showStyle && (
          <div className="nl-style">
            <label className="nl-field"><span>Byline (top of the article)</span>
              <textarea rows={2} value={setup.byline} onChange={e => update('byline', e.target.value)} /></label>
            <label className="nl-field"><span>Sign-off, links and hashtags (added exactly as written)</span>
              <textarea rows={6} value={setup.signature} onChange={e => update('signature', e.target.value)} /></label>
            <label className="nl-field"><span>Last issue (style and structure reference; updates automatically when you mark an issue published)</span>
              <textarea rows={6} value={setup.lastIssue} onChange={e => update('lastIssue', e.target.value)} /></label>
            <label className="nl-check">
              <input type="checkbox" checked={setup.includeSources} onChange={e => update('includeSources', e.target.checked)} />
              Add a SOURCES list before the sign-off
            </label>
            <div className="nl-row">
              <button className="nl-link-btn" onClick={() => { update('byline', DEFAULT_BYLINE); update('signature', DEFAULT_SIGNATURE); }}>Reset byline & sign-off</button>
            </div>
          </div>
        )}
      </section>

      {/* STEP 1 — RESEARCH */}
      <section className="nl-card glass-panel">
        <div className="nl-step-head">
          <h3><span className="nl-step">1</span> Find this week's AI news</h3>
          <button className="btn btn-primary nl-btn" disabled={busy} onClick={handleResearch}>
            {phase === 'researching' ? <Loader2 size={14} className="nl-spin" /> : stories.length ? <RefreshCw size={14} /> : <Search size={14} />}
            {phase === 'researching' ? 'Searching the web…' : stories.length ? 'Search again' : 'Search the web'}
          </button>
        </div>
        <p className="nl-hint">
          Uses live web search through your AI key. Each story shows its sources. <ShieldCheck size={12} className="nl-ok-i" /> means the publisher
          was among the pages the search actually returned; <AlertTriangle size={12} className="nl-warn-i" /> means it wasn't, or the date is
          outside your window. Those start unticked: open the links and check before including them.
        </p>
        {stories.length > 0 && (
          <>
            <div className="nl-row">
              <span className="nl-hint">{selectedStories.length} of {stories.length} ticked · {confirmedCount} source-confirmed</span>
              <button className="nl-link-btn" onClick={() => setStories(stories.map(s => ({ ...s, selected: true })))}>Tick all</button>
              <button className="nl-link-btn" onClick={() => setStories(stories.map(s => ({ ...s, selected: false })))}>Untick all</button>
            </div>
            <div className="nl-stories">
              {stories.map(s => (
                <label key={s.id} className={`nl-story ${s.selected ? 'on' : ''}`}>
                  <input type="checkbox" checked={s.selected} onChange={() => setStories(stories.map(x => (x.id === s.id ? { ...x, selected: !x.selected } : x)))} />
                  <div className="nl-story-body">
                    <div className="nl-story-top">
                      <strong>{s.headline}</strong>
                      {s.publisherConfirmed && s.inWindow
                        ? <span className="nl-flag ok"><ShieldCheck size={12} /> checked</span>
                        : <span className="nl-flag warn"><AlertTriangle size={12} /> {!s.publisherConfirmed ? 'source not confirmed by search' : 'date outside window'}</span>}
                    </div>
                    <div className="nl-meta">{s.date} · {s.category}</div>
                    <p>{s.summary}</p>
                    <div className="nl-sources">
                      {s.sources.length === 0 && <span className="nl-flag warn">no sources given</span>}
                      {s.sources.map(src => (
                        <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                          {src.title || src.url} <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </>
        )}
      </section>

      {/* STEP 2 — WRITE */}
      <section className="nl-card glass-panel">
        <div className="nl-step-head">
          <h3><span className="nl-step">2</span> Write issue #{setup.issueNumber}</h3>
          <button className="btn btn-primary nl-btn" disabled={busy || !selectedStories.length} onClick={handleWrite}>
            {phase === 'writing' || phase === 'humanizing' ? <Loader2 size={14} className="nl-spin" /> : <PenLine size={14} />}
            {phase === 'writing' ? 'Writing…' : phase === 'humanizing' ? 'Humanizing…' : draft ? 'Rewrite from ticked stories' : `Write from ${selectedStories.length} stories`}
          </button>
        </div>
        {!draft && <p className="nl-hint">Uses only the ticked stories and your Voxstar news, in the structure and voice of the last issue, then runs the humanizer.</p>}

        {draft && (
          <>
            <div className="nl-row">
              <div className="nl-tabs">
                <button className={view === 'preview' ? 'on' : ''} onClick={() => setView('preview')}><Eye size={13} /> Preview</button>
                <button className={view === 'edit' ? 'on' : ''} onClick={() => setView('edit')}><Pencil size={13} /> Edit</button>
              </div>
              {draft.issues.length === 0
                ? <span className="nl-flag ok"><ShieldCheck size={13} /> Humanizer passed</span>
                : <span className="nl-flag warn" title={draft.issues.join('\n')}><AlertTriangle size={13} /> {draft.issues.join(' · ')}</span>}
              <button className="btn btn-secondary nl-btn" disabled={busy} onClick={handleHumanizeAgain}><Wand2 size={13} /> Humanize again</button>
            </div>

            <label className="nl-field">
              <span>Subtitle (title becomes: {title})</span>
              <input value={draft.subtitle} onChange={e => setDraft({ ...draft, subtitle: e.target.value })} />
            </label>

            {view === 'edit' ? (
              <label className="nl-field">
                <span>Body (markdown: ## and ### headings, **bold**). Byline, date, sources and sign-off are added automatically.</span>
                <textarea rows={24} className="nl-editor" value={draft.body}
                  onChange={e => setDraft({ ...draft, body: e.target.value, issues: checkHumanizer(e.target.value, 'longform') })} />
              </label>
            ) : (
              <div className="nl-preview">
                {draft.images[0] && settled[imageUrl(draft.images[0])] === 'ok' && (
                  <img className="nl-cover" src={imageUrl(draft.images[0])} alt="Cover" crossOrigin="anonymous" />
                )}
                <h1>{title}</h1>
                <div className="nl-article" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            )}
          </>
        )}
      </section>

      {/* STEP 3 — IMAGES + COPY */}
      {draft && (
        <section className="nl-card glass-panel">
          <h3><span className="nl-step">3</span> Images & copy to LinkedIn</h3>

          {draft.images.length > 0 && (
            <>
              <p className="nl-hint">
                Free AI images (Pollinations). The free service allows one image every 45 seconds, so they appear one by one, and adds a small pollinations.ai mark in the corner. Check each image before using it; try a new variation if one doesn't suit. LinkedIn doesn't take images through copy and paste, so download each one and upload it in
                the editor: the cover via "Upload cover image", the others with the image button under the heading shown.
              </p>
              <div className="nl-images">
                {draft.images.map((img, i) => {
                  const url = imageUrl(img);
                  const isCover = img.slot.toUpperCase() === 'COVER';
                  const placed = isCover || headings.has(img.slot.toLowerCase());
                  return (
                    <div key={`${img.slot}-${i}`} className="nl-image">
                      {!requested.has(url) ? (
                        <div className="nl-image-broken"><Loader2 size={18} className="nl-spin" /> Queued (free tier: one image every 45 seconds)</div>
                      ) : settled[url] === 'error' ? (
                        <div className="nl-image-broken"><ImageIcon size={20} /> The image service refused this one (usually the rate limit). Try a new variation{cooldownSecs ? ` in ${cooldownSecs}s` : ''}.</div>
                      ) : (
                        <img ref={el => { imgRefs.current[url] = el; }} src={url} alt={img.prompt} crossOrigin="anonymous"
                          onLoad={() => markSettled(url, 'ok')} onError={() => markSettled(url, 'error')} />
                      )}
                      <div className="nl-image-meta">
                        <strong>{isCover ? 'Cover image' : `Under: ${img.slot}`}</strong>
                        {!placed && <span className="nl-flag warn">heading changed, place it where it fits</span>}
                        <div className="nl-row">
                          <button className="btn btn-secondary nl-btn" disabled={settled[url] !== 'ok'} onClick={() => downloadImage(img, i)}><Download size={13} /> Download</button>
                          <button className="btn btn-secondary nl-btn" disabled={cooldownSecs > 0 || (requested.has(url) && !settled[url])} onClick={() => newVariation(i)}>
                            <RefreshCw size={13} /> {cooldownSecs > 0 ? `New variation (${cooldownSecs}s)` : 'New variation'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <ol className="nl-steps-list">
            <li>On LinkedIn: <b>Write article</b>, then choose the <b>{NEWSLETTER_NAME}</b> newsletter.</li>
            <li>Upload the cover image, then paste the title: <button className="btn btn-secondary nl-btn" onClick={() => copyPlain(title, 'title')}>{copied === 'title' ? <Check size={13} /> : <Copy size={13} />} Copy title</button></li>
            <li>Click into the body and paste the article (headings, bold and links keep their formatting): <button className="btn btn-primary nl-btn" onClick={copyArticle}>{copied === 'article' ? <Check size={13} /> : <Copy size={13} />} Copy article</button></li>
            <li>Add the section images under their headings, read it through once, then publish.</li>
          </ol>
          <div className="nl-row">
            <a className="btn btn-secondary nl-btn" href="https://www.linkedin.com/article/new/" target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> Open LinkedIn article editor</a>
            <button className="btn btn-secondary nl-btn" onClick={markPublished}><CheckCircle2 size={13} /> I've published #{setup.issueNumber}</button>
            <span className="nl-hint">Then paste the LinkedIn article link on its Content Calendar entry.</span>
          </div>
        </section>
      )}

      {archive.length > 0 && (
        <section className="nl-card glass-panel">
          <h3>Past issues</h3>
          {archive.map(a => (
            <div key={`${a.number}-${a.date}`} className="nl-archive-row">
              <span>{a.title}</span>
              <span className="nl-hint">{a.date}</span>
              <button className="nl-link-btn" onClick={() => copyPlain(markdownToPlain(a.article), `arch-${a.number}`)}>
                {copied === `arch-${a.number}` ? 'Copied' : 'Copy text'}
              </button>
            </div>
          ))}
        </section>
      )}

      <style>{`
        .nl-container { display: flex; flex-direction: column; gap: 16px; padding: 8px 4px 40px; }
        .nl-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .nl-header h2 { display: flex; align-items: center; gap: 10px; font-family: var(--font-heading); margin: 0 0 6px; color: var(--text-primary); }
        .nl-sub { color: var(--text-secondary); max-width: 780px; margin: 0; line-height: 1.5; font-size: 0.92rem; }
        .nl-model-pill { font-size: 0.78rem; font-family: var(--font-mono); padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border-glass); color: var(--text-secondary); cursor: pointer; }
        .nl-model-pill.warn { border-color: var(--warning); color: var(--warning); }
        .nl-notice { display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: var(--success); font-size: 0.88rem; }
        .nl-error { display: flex; align-items: center; gap: 8px; padding: 10px 14px; color: var(--danger); border: 1px solid var(--danger); font-size: 0.88rem; }
        .nl-error span { flex: 1; }
        .nl-error button { background: none; border: none; color: inherit; cursor: pointer; }
        .nl-card { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
        .nl-card h3 { margin: 0; font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
        .nl-step { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 0.75rem; font-weight: 700; }
        .nl-step-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .nl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
        .nl-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
        .nl-field input, .nl-field textarea {
          background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary);
          border-radius: 8px; padding: 8px 10px; font-family: var(--font-body); font-size: 0.86rem; resize: vertical;
        }
        .nl-editor { font-family: var(--font-mono) !important; font-size: 0.82rem !important; line-height: 1.55; }
        .nl-hint { color: var(--text-muted); font-size: 0.8rem; line-height: 1.45; margin: 0; }
        .nl-ok-i { color: var(--success); vertical-align: -2px; }
        .nl-warn-i { color: var(--warning); vertical-align: -2px; }
        .nl-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .nl-chip { background: none; border: 1px solid var(--border-glass); color: var(--text-secondary); border-radius: 999px; padding: 4px 10px; font-size: 0.78rem; cursor: pointer; }
        .nl-chip:hover { border-color: var(--primary); color: var(--primary); }
        .nl-link-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; padding: 0; }
        .nl-link-btn:hover { color: var(--primary); }
        .nl-style { display: flex; flex-direction: column; gap: 10px; }
        .nl-check { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); }
        .nl-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 6px 12px; text-decoration: none; }
        .nl-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .nl-stories { display: flex; flex-direction: column; gap: 8px; max-height: 620px; overflow-y: auto; }
        .nl-story { display: flex; gap: 10px; padding: 10px 12px; border: 1px solid var(--border-glass); border-radius: 8px; cursor: pointer; opacity: 0.6; }
        .nl-story.on { opacity: 1; border-color: var(--border-glass-glow); }
        .nl-story-body { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .nl-story-top { display: flex; justify-content: space-between; gap: 10px; color: var(--text-primary); font-size: 0.88rem; }
        .nl-story-body p { margin: 0; color: var(--text-secondary); font-size: 0.82rem; line-height: 1.5; }
        .nl-meta { color: var(--text-muted); font-size: 0.75rem; font-family: var(--font-mono); }
        .nl-sources { display: flex; flex-wrap: wrap; gap: 10px; }
        .nl-sources a { color: var(--primary); font-size: 0.75rem; text-decoration: none; display: inline-flex; align-items: center; gap: 3px; }
        .nl-flag { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; white-space: nowrap; }
        .nl-flag.ok { color: var(--success); }
        .nl-flag.warn { color: var(--warning); }
        .nl-tabs { display: inline-flex; border: 1px solid var(--border-glass); border-radius: 8px; overflow: hidden; }
        .nl-tabs button { background: none; border: none; color: var(--text-secondary); padding: 6px 12px; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
        .nl-tabs button.on { background: var(--primary); color: #fff; }
        /* Preview mimics LinkedIn's light article page so it reads like the published version. */
        .nl-preview { background: #fff; color: #1d2226; border-radius: 10px; padding: 28px 32px; max-height: 760px; overflow-y: auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .nl-preview h1 { font-size: 1.9rem; line-height: 1.2; margin: 16px 0; color: #1d2226; }
        .nl-cover { width: 100%; border-radius: 8px; display: block; }
        .nl-article { font-size: 1rem; line-height: 1.65; }
        .nl-article h3 { font-size: 1.35rem; margin: 28px 0 10px; color: #1d2226; }
        .nl-article h4 { font-size: 1.12rem; margin: 22px 0 8px; color: #1d2226; }
        .nl-article p { margin: 0 0 14px; }
        .nl-article a { color: #0a66c2; }
        .nl-article ul { padding-left: 20px; margin: 0 0 14px; }
        .nl-images { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
        .nl-image { border: 1px solid var(--border-glass); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
        .nl-image img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; background: var(--bg-dark); }
        .nl-image-broken { aspect-ratio: 16 / 9; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: var(--text-muted); font-size: 0.78rem; text-align: center; padding: 12px; }
        .nl-image-meta { padding: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-primary); }
        .nl-steps-list { margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 0.86rem; display: flex; flex-direction: column; gap: 10px; }
        .nl-steps-list li .nl-btn { margin-left: 6px; }
        .nl-archive-row { display: flex; align-items: center; gap: 12px; font-size: 0.85rem; color: var(--text-primary); padding: 6px 0; border-bottom: 1px solid var(--border-glass); }
        .nl-archive-row span:first-child { flex: 1; }
        .nl-spin { animation: nl-spin 1s linear infinite; }
        @keyframes nl-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
