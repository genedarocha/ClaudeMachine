import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clapperboard, Loader2, Download, Play, AlertTriangle, Volume2, Image as ImageIcon, CalendarPlus, Check, UserSquare, Copy, Film
} from 'lucide-react';
import { type ApiKeys, generateSpeech, TTS_VOICES } from '../utils/ai';
import { type VideoSpec, renderVideo, videoSupported, avatarScript } from '../utils/videoRender';
import { loadSiteProfiles } from '../data/siteProfiles';
import { type CalendarEntry, getAllEntries, updateEntry, CALENDAR_EVENT } from '../utils/contentStore';
import { imageUrl } from '../utils/newsletter';

// REAL: renderVideo() produces an actual 9:16 .webm in the browser (canvas + MediaRecorder); voiceover
// is real OpenAI TTS muxed in. The avatar tab is an honest handoff to HeyGen (no guessed API calls).
// Source plans are the ones the Daily generator already wrote to each calendar item.

interface ProduceVideosStudioProps {
  keys: ApiKeys;
  onOpenSettings: () => void;
}

type Mode = 'captions' | 'voiceover' | 'avatar';

export const ProduceVideosStudio: React.FC<ProduceVideosStudioProps> = ({ keys, onOpenSettings }) => {
  const sites = useMemo(() => loadSiteProfiles(), []);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [siteId, setSiteId] = useState<string>(sites[0]?.id ?? '');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('captions');
  const [useImages, setUseImages] = useState(false);
  const [voice, setVoice] = useState('onyx');
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  const reload = () => getAllEntries().then(setEntries).catch(() => {});
  useEffect(() => {
    reload();
    window.addEventListener(CALENDAR_EVENT, reload);
    return () => window.removeEventListener(CALENDAR_EVENT, reload);
  }, []);

  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);

  const site = sites.find(s => s.id === siteId);
  const withVideo = entries.filter(e => e.siteId === siteId && e.kind === 'daily' && e.video?.voiceover);
  const selected = withVideo.find(e => e.id === selectedId) ?? null;

  const spec: VideoSpec | null = useMemo(() => {
    if (!selected?.video || !site) return null;
    const scenes = selected.video.scenes.length
      ? selected.video.scenes.map((s, i) => ({ caption: s.onScreenText || s.visual.slice(0, 60), imageUrl: useImages ? imageUrl({ slot: `s${i}`, prompt: `${s.visual}. no text, no words, no logos`, seed: 1000 + i }) : undefined }))
      : [{ caption: selected.title }];
    return {
      title: selected.title,
      subtitle: selected.pillar,
      scenes,
      cta: site.cta,
      brandName: site.name,
      brandColor: site.color,
      website: site.url
    };
  }, [selected, site, useImages]);

  const hasOpenAI = !!keys.openai;

  const render = async () => {
    if (!spec || !selected?.video) return;
    setError(null);
    setRendering(true);
    setVideoUrl(null);
    setVideoBlob(null);
    try {
      let voiceover: Blob | undefined;
      if (mode === 'voiceover') {
        if (!hasOpenAI) throw new Error('Voiceover needs an OpenAI key (Settings). Or render with captions only.');
        setProgress('Generating voiceover…');
        voiceover = await generateSpeech(selected.video.voiceover, voice, keys);
      }
      const blob = await renderVideo(spec, { voiceover, onProgress: p => setProgress(p.detail) });
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setVideoUrl(url);
      setVideoBlob(blob);
      setNotice(`Rendered a ${(blob.size / 1e6).toFixed(1)} MB video.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rendering failed.');
    } finally {
      setRendering(false);
      setProgress(null);
    }
  };

  const download = () => {
    if (!videoUrl || !selected) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${siteId}-${selected.date}-${selected.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.webm`;
    a.click();
  };

  // Stores the rendered video on the calendar item as a data URL so it survives a reload.
  const attach = async () => {
    if (!videoBlob || !selected) return;
    if (videoBlob.size > 4_000_000) {
      setError('This video is too large to store on the calendar item. Download it and upload it to the platform instead.');
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(videoBlob);
    });
    try {
      await updateEntry(selected.id, { video: { ...selected.video!, renderedDataUrl: dataUrl } as CalendarEntry['video'] });
      setNotice('Saved the video on this calendar item.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not attach.');
    }
  };

  const copyAvatarScript = async () => {
    if (!spec || !selected?.video) return;
    await navigator.clipboard.writeText(avatarScript(spec, selected.video.voiceover)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!videoSupported()) {
    return <div className="pv-container"><div className="pv-empty glass-panel"><Clapperboard size={30} /><h2>Produce Videos</h2><p>Rendering video needs Chrome or Edge on a desktop. Open Claude Machine there.</p></div><style>{STYLES}</style></div>;
  }

  return (
    <div className="pv-container animate-fade">
      <header className="pv-header">
        <div>
          <h2><Clapperboard size={22} /> Produce Videos</h2>
          <p className="pv-sub">
            Turn the video plans your Daily content already wrote into real 9:16 videos, free, in your browser. Add a voiceover with your
            OpenAI key, or send the script to HeyGen for an avatar that looks like you. Then download and post, or attach to the calendar.
          </p>
        </div>
      </header>

      {notice && <div className="pv-notice glass-panel"><Check size={14} /> {notice}</div>}
      {error && <div className="pv-error glass-panel"><AlertTriangle size={14} /> <span>{error}</span><button onClick={() => setError(null)}>✕</button></div>}

      <div className="pv-body">
        <aside className="pv-side glass-panel">
          <label className="pv-field"><span>Brand</span>
            <select value={siteId} onChange={e => { setSiteId(e.target.value); setSelectedId(null); setVideoUrl(null); }}>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <p className="pv-muted">{withVideo.length} video plans for {site?.name}. {withVideo.length === 0 && 'Generate this site\'s 50 days first (Daily → ' + (site?.name || '') + ').'}</p>
          <div className="pv-list">
            {withVideo.map(e => (
              <button key={e.id} className={`pv-item ${e.id === selectedId ? 'on' : ''}`} onClick={() => { setSelectedId(e.id); setVideoUrl(null); }} style={{ borderLeftColor: site?.color }}>
                <strong>{e.title}</strong>
                <small>{e.date}{e.video && 'renderedDataUrl' in (e.video as object) ? ' · has video' : ''}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="pv-work glass-panel">
          {!selected ? (
            <div className="pv-empty"><Film size={26} /><p>Pick a day on the left to make its video.</p></div>
          ) : (
            <>
              <h3>{selected.title}</h3>
              <div className="pv-tabs">
                <button className={mode === 'captions' ? 'on' : ''} onClick={() => setMode('captions')}><ImageIcon size={13} /> Captions (free)</button>
                <button className={mode === 'voiceover' ? 'on' : ''} onClick={() => setMode('voiceover')}><Volume2 size={13} /> With voiceover</button>
                <button className={mode === 'avatar' ? 'on' : ''} onClick={() => setMode('avatar')}><UserSquare size={13} /> Avatar (HeyGen)</button>
              </div>

              {mode === 'avatar' ? (
                <div className="pv-avatar">
                  <p>An avatar that looks and sounds like you needs <a href="https://www.heygen.com" target="_blank" rel="noopener noreferrer">HeyGen</a> (a paid service). Create your avatar there once from a photo and a short recording, then:</p>
                  <ol>
                    <li>Copy this episode's script.</li>
                    <li>In HeyGen, make a video with your avatar and paste the script.</li>
                    <li>Download it, then post it or attach it on the calendar.</li>
                  </ol>
                  <button className="btn btn-primary pv-btn" onClick={copyAvatarScript}>{copied ? <Check size={14} /> : <Copy size={14} />} Copy script for HeyGen</button>
                  <pre className="pv-script">{selected.video?.voiceover}</pre>
                  <p className="pv-muted">For coding tutorials, record your screen separately and use the avatar only for the intro and outro.</p>
                </div>
              ) : (
                <>
                  <div className="pv-opts">
                    {mode === 'voiceover' && (
                      <label className="pv-field pv-inline"><span>Voice</span>
                        <select value={voice} onChange={e => setVoice(e.target.value)}>{TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}</select>
                      </label>
                    )}
                    <label className="pv-check"><input type="checkbox" checked={useImages} onChange={e => setUseImages(e.target.checked)} /> AI background images (slower: one every ~45s, free tier)</label>
                  </div>
                  {mode === 'voiceover' && !hasOpenAI && <p className="pv-muted">Voiceover uses OpenAI text-to-speech. <button className="pv-link" onClick={onOpenSettings}>Add an OpenAI key</button>, or use Captions.</p>}

                  <div className="pv-preview">
                    <span className="pv-muted">Slides: title → {selected.video?.scenes.length || 1} scene{(selected.video?.scenes.length || 1) === 1 ? '' : 's'} → call to action</span>
                    <ol className="pv-scenes">
                      {selected.video?.scenes.map((s, i) => <li key={i}><b>{s.onScreenText || '(caption)'}</b> — {s.visual}</li>)}
                    </ol>
                  </div>

                  <div className="pv-row">
                    <button className="btn btn-primary pv-btn" disabled={rendering || (mode === 'voiceover' && !hasOpenAI)} onClick={render}>
                      {rendering ? <Loader2 size={14} className="pv-spin" /> : <Play size={14} />} {rendering ? (progress || 'Rendering…') : 'Render video'}
                    </button>
                  </div>

                  {videoUrl && (
                    <div className="pv-result">
                      <video src={videoUrl} controls playsInline className="pv-video" />
                      <div className="pv-row">
                        <button className="btn btn-primary pv-btn" onClick={download}><Download size={14} /> Download .webm</button>
                        <button className="btn btn-secondary pv-btn" onClick={attach}><CalendarPlus size={14} /> Attach to calendar item</button>
                      </div>
                      <p className="pv-muted">TikTok, YouTube and Instagram accept .webm; if a platform rejects it, convert to .mp4 (e.g. CloudConvert) before uploading.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </div>
      <style>{STYLES}</style>
    </div>
  );
};

const STYLES = `
  .pv-container { display: flex; flex-direction: column; gap: 14px; padding: 8px 4px 40px; }
  .pv-empty { max-width: 620px; margin: 40px auto; padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; color: var(--text-secondary); }
  .pv-empty h2 { margin: 0; color: var(--text-primary); }
  .pv-header h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 4px; font-family: var(--font-heading); color: var(--text-primary); }
  .pv-sub { color: var(--text-secondary); max-width: 780px; margin: 0; font-size: 0.9rem; line-height: 1.5; }
  .pv-notice { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: var(--success); font-size: 0.85rem; }
  .pv-error { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: var(--danger); font-size: 0.85rem; }
  .pv-error span { flex: 1; } .pv-error button { background: none; border: none; color: inherit; cursor: pointer; }
  .pv-body { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 14px; align-items: start; }
  .pv-side { padding: 12px; display: flex; flex-direction: column; gap: 10px; position: sticky; top: 8px; }
  .pv-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
  .pv-field select, .pv-field input { background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 8px; padding: 7px 10px; font-size: 0.85rem; }
  .pv-inline { flex-direction: row; align-items: center; gap: 8px; }
  .pv-muted { color: var(--text-muted); font-size: 0.8rem; margin: 0; line-height: 1.45; }
  .pv-link { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.8rem; padding: 0; }
  .pv-list { display: flex; flex-direction: column; gap: 4px; max-height: calc(100vh - 220px); overflow-y: auto; }
  .pv-item { display: flex; flex-direction: column; gap: 2px; background: none; border: 1px solid var(--border-glass); border-left: 3px solid; border-radius: 6px; padding: 7px 9px; text-align: left; cursor: pointer; color: var(--text-primary); }
  .pv-item.on, .pv-item:hover { background: var(--bg-card-hover); }
  .pv-item strong { font-size: 0.8rem; font-weight: 500; }
  .pv-item small { font-size: 0.7rem; color: var(--text-muted); }
  .pv-work { padding: 18px; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  .pv-work h3 { margin: 0; color: var(--text-primary); }
  .pv-tabs { display: inline-flex; border: 1px solid var(--border-glass); border-radius: 8px; overflow: hidden; width: fit-content; }
  .pv-tabs button { background: none; border: none; color: var(--text-secondary); padding: 7px 13px; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
  .pv-tabs button.on { background: var(--primary); color: #fff; }
  .pv-opts { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
  .pv-check { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-secondary); }
  .pv-preview { border: 1px solid var(--border-glass); border-radius: 8px; padding: 10px 14px; }
  .pv-scenes { margin: 6px 0 0; padding-left: 18px; color: var(--text-secondary); font-size: 0.82rem; line-height: 1.5; }
  .pv-scenes b { color: var(--text-primary); }
  .pv-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .pv-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; padding: 7px 12px; }
  .pv-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .pv-result { display: flex; flex-direction: column; gap: 10px; }
  .pv-video { width: 240px; aspect-ratio: 9/16; border-radius: 10px; background: #000; align-self: flex-start; }
  .pv-avatar { display: flex; flex-direction: column; gap: 10px; color: var(--text-secondary); font-size: 0.88rem; line-height: 1.55; }
  .pv-avatar a { color: var(--primary); }
  .pv-avatar ol { margin: 0; padding-left: 18px; }
  .pv-script { background: var(--bg-dark); border: 1px solid var(--border-glass); border-radius: 8px; padding: 12px; font-size: 0.82rem; white-space: pre-wrap; color: var(--text-primary); max-height: 260px; overflow-y: auto; }
  .pv-spin { animation: pv-spin 1s linear infinite; }
  @keyframes pv-spin { to { transform: rotate(360deg); } }
  @media (max-width: 900px) { .pv-body { grid-template-columns: 1fr; } .pv-side { position: static; } }
`;
