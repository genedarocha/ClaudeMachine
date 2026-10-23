import React, { useState, useMemo } from 'react';
import {
  BookOpen, Plus, Loader2, AlertTriangle, Check, Download, Trash2, ChevronRight, FileText, Sparkles, Shield, RefreshCw
} from 'lucide-react';
import { type ApiKeys, type ModelSettings } from '../utils/ai';
import {
  type VoxProject, type VoxMode, type OutlineUnit, VOX_FORMATS, voxFormat, newProject, loadProjects, saveProject, deleteProject,
  runConcept, runBible, runOutline, runDraftUnit, runEditorial, projectToMarkdown
} from '../utils/voxpress';
import { SafeMarkdown } from './SpecialistRunner';

// Client-side core of the VoxPress v2 spec: staged, human-approved creative production on the user's AI.
// The spec's full production platform (backend/marketplace/multi-agent) is separate — see docs/VOXPRESS.md.

interface VoxPressStudioProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenSettings: () => void;
}

const STAGES: { key: VoxProject['stage']; label: string }[] = [
  { key: 'brief', label: 'Brief' },
  { key: 'concept', label: 'Concept' },
  { key: 'bible', label: 'Story Bible' },
  { key: 'outline', label: 'Outline' },
  { key: 'draft', label: 'Draft' },
  { key: 'editorial', label: 'Editorial' },
  { key: 'export', label: 'Export' }
];

export const VoxPressStudio: React.FC<VoxPressStudioProps> = ({ keys, settings, onOpenSettings }) => {
  const [projects, setProjects] = useState<VoxProject[]>(loadProjects);
  const [project, setProject] = useState<VoxProject | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftingN, setDraftingN] = useState<number | null>(null);

  const isDemo = settings.provider === 'mock';
  const persist = (p: VoxProject) => { saveProject(p); setProject(p); setProjects(loadProjects()); };

  const create = () => { const p = newProject(); persist(p); };
  const open = (p: VoxProject) => { setError(null); setProject(p); };
  const remove = (id: string) => { deleteProject(id); setProjects(loadProjects()); if (project?.id === id) setProject(null); };

  const patch = (u: Partial<VoxProject>) => { if (project) persist({ ...project, ...u }); };

  const run = async (label: string, fn: () => Promise<Partial<VoxProject>>) => {
    if (!project) return;
    if (isDemo) { onOpenSettings(); return; }
    setBusy(label);
    setError(null);
    try {
      persist({ ...project, ...(await fn()) });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    } finally {
      setBusy(null);
    }
  };

  const f = project ? voxFormat(project.formatId) : null;
  const canRun = project && (project.mode === 'create' ? project.idea.trim() : project.sourceText.trim() && project.rightsConfirmed);

  const draftUnit = async (unit: OutlineUnit) => {
    if (!project) return;
    setDraftingN(unit.n);
    setError(null);
    try {
      const text = await runDraftUnit(project, unit, keys, settings);
      persist({ ...project, outline: project.outline.map(u => (u.n === unit.n ? { ...u, draft: text } : u)) });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Draft failed.');
    } finally {
      setDraftingN(null);
    }
  };

  const draftedCount = project?.outline.filter(u => u.draft).length ?? 0;

  const download = () => {
    if (!project) return;
    const blob = new Blob([projectToMarkdown(project)], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const downloadJson = () => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}.voxpress.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const stageIndex = useMemo(() => (project ? STAGES.findIndex(s => s.key === project.stage) : 0), [project]);

  return (
    <div className="vx-container animate-fade">
      <header className="vx-header">
        <div>
          <h2><BookOpen size={22} /> VoxPress Creative Factory v2</h2>
          <p className="vx-sub">
            Turn an idea or an existing document into a professionally structured creative work — book, screenplay, play, audio drama or
            course — in staged steps you approve. AI-assisted drafts for your review, on your own AI key.
          </p>
        </div>
        <span className={`vx-pill ${isDemo ? 'warn' : ''}`} onClick={onOpenSettings}>{isDemo ? 'Demo Mode — set a real AI' : `${settings.provider} · ${settings.model}`}</span>
      </header>

      {error && <div className="vx-error glass-panel"><AlertTriangle size={15} /> <span>{error}</span><button onClick={() => setError(null)}>✕</button></div>

      }
      <div className="vx-body">
        <aside className="vx-side glass-panel">
          <button className="btn btn-primary vx-new" onClick={create}><Plus size={14} /> New project</button>
          <div className="vx-plist">
            {projects.length === 0 && <p className="vx-muted">No projects yet.</p>}
            {projects.map(p => (
              <div key={p.id} className={`vx-pitem ${project?.id === p.id ? 'on' : ''}`} onClick={() => open(p)}>
                <div>
                  <strong>{p.name}</strong>
                  <small>{voxFormat(p.formatId).label} · {p.stage}</small>
                </div>
                <button className="vx-del" onClick={e => { e.stopPropagation(); remove(p.id); }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </aside>

        {!project ? (
          <section className="vx-work glass-panel vx-empty">
            <BookOpen size={28} /><p>Create a project, or open one on the left.</p>
          </section>
        ) : (
          <section className="vx-work glass-panel">
            <input className="vx-name" value={project.name} onChange={e => patch({ name: e.target.value })} />
            <div className="vx-stages">
              {STAGES.map((s, i) => (
                <span key={s.key} className={`vx-stage ${i === stageIndex ? 'on' : ''} ${i < stageIndex ? 'done' : ''}`}>{i < stageIndex && <Check size={10} />} {s.label}{i < STAGES.length - 1 && <ChevronRight size={11} className="vx-arrow" />}</span>
              ))}
            </div>

            {/* BRIEF */}
            <div className="vx-card">
              <h3>1. Brief</h3>
              <div className="vx-grid">
                <label className="vx-field"><span>Mode</span>
                  <select value={project.mode} onChange={e => patch({ mode: e.target.value as VoxMode })}>
                    <option value="create">Create — from an idea</option>
                    <option value="transform">Transform — improve my document</option>
                    <option value="adapt">Adapt — my work into another format</option>
                  </select>
                </label>
                <label className="vx-field"><span>Format</span>
                  <select value={project.formatId} onChange={e => patch({ formatId: e.target.value })}>
                    {VOX_FORMATS.map(fo => <option key={fo.id} value={fo.id}>{fo.label}</option>)}
                  </select>
                </label>
                <label className="vx-field"><span>Audience</span><input value={project.audience} onChange={e => patch({ audience: e.target.value })} placeholder="who it's for" /></label>
                <label className="vx-field"><span>Tone</span><input value={project.tone} onChange={e => patch({ tone: e.target.value })} placeholder="e.g. warm, authoritative, noir" /></label>
                <label className="vx-field"><span>Target length</span><input value={project.lengthHint} onChange={e => patch({ lengthHint: e.target.value })} placeholder="e.g. 10 chapters, 90-page screenplay" /></label>
              </div>
              {project.mode === 'create' ? (
                <label className="vx-field"><span>Your idea</span>
                  <textarea rows={3} value={project.idea} onChange={e => patch({ idea: e.target.value })} placeholder="Describe the book/film/play you want. The more specific, the better." />
                </label>
              ) : (
                <>
                  <label className="vx-field"><span>Source material (paste your own / licensed text)</span>
                    <textarea rows={6} value={project.sourceText} onChange={e => patch({ sourceText: e.target.value })} placeholder="Paste the document, manuscript or work you own or are licensed to use." />
                  </label>
                  <div className="vx-grid">
                    <label className="vx-field"><span>How much to change</span>
                      <select value={project.transformMode} onChange={e => patch({ transformMode: e.target.value as VoxProject['transformMode'] })}>
                        <option value="preserve">Preserve — layout/clarity only</option>
                        <option value="enhance">Enhance — keep content, improve it</option>
                        <option value="transform">Transform — substantial redesign</option>
                      </select>
                    </label>
                    <label className="vx-field"><span>Direction (optional)</span><input value={project.idea} onChange={e => patch({ idea: e.target.value })} placeholder="e.g. adapt into a screenplay" /></label>
                  </div>
                  <label className={`vx-rights ${project.rightsConfirmed ? 'ok' : ''}`}>
                    <input type="checkbox" checked={project.rightsConfirmed} onChange={e => patch({ rightsConfirmed: e.target.checked })} />
                    <Shield size={14} /> I own this material or am licensed to transform it. VoxPress won't adapt third-party work you don't have rights to, or imitate a living author.
                  </label>
                </>
              )}
              <label className="vx-check"><input type="checkbox" checked={project.humanize} onChange={e => patch({ humanize: e.target.checked })} /> Run drafts through the humanizer (for non-fiction you'll publish as yourself)</label>
              {!canRun && <p className="vx-muted">{project.mode === 'create' ? 'Add your idea to begin.' : 'Paste the source and confirm rights to begin.'}</p>}
            </div>

            {/* CONCEPT */}
            <Stage n="2" title="Concept" done={!!project.concept} busy={busy === 'concept'} disabled={!canRun}
              onRun={() => run('concept', async () => ({ concept: await runConcept(project, keys, settings), stage: 'concept' }))} runLabel={project.concept ? 'Regenerate concept' : 'Develop concept'}>
              {project.concept && <div className="vx-out"><SafeMarkdown text={project.concept} /></div>}
            </Stage>

            {/* BIBLE */}
            <Stage n="3" title="Story Bible" done={!!project.bible} busy={busy === 'bible'} disabled={!project.concept}
              onRun={() => run('bible', async () => ({ bible: await runBible(project, keys, settings), stage: 'bible' }))} runLabel={project.bible ? 'Regenerate bible' : 'Build story bible'}>
              {project.bible && <div className="vx-out"><SafeMarkdown text={project.bible} /></div>}
            </Stage>

            {/* OUTLINE */}
            <Stage n="4" title="Outline" done={project.outline.length > 0} busy={busy === 'outline'} disabled={!project.bible}
              onRun={() => run('outline', async () => ({ outline: await runOutline(project, keys, settings), stage: 'outline' }))} runLabel={project.outline.length ? 'Rebuild outline' : 'Build outline'}>
              {project.outline.length > 0 && (
                <ol className="vx-outline">
                  {project.outline.map(u => <li key={u.n}><strong>{u.title}</strong> {u.draft && <Check size={11} className="vx-ok" />}<br /><span className="vx-muted">{u.summary}</span></li>)}
                </ol>
              )}
            </Stage>

            {/* DRAFT */}
            {project.outline.length > 0 && (
              <div className="vx-card">
                <h3>5. Draft <span className="vx-muted">({draftedCount}/{project.outline.length} {f?.unit}s)</span></h3>
                <p className="vx-muted">Write each {f?.unit} on its own so you can review and regenerate before moving on.</p>
                <div className="vx-units">
                  {project.outline.map(u => (
                    <div key={u.n} className="vx-unit">
                      <div className="vx-unit-head">
                        <strong>{u.n}. {u.title}</strong>
                        <button className="btn btn-secondary vx-btn" disabled={draftingN !== null || isDemo} onClick={() => draftUnit(u)}>
                          {draftingN === u.n ? <Loader2 size={13} className="vx-spin" /> : u.draft ? <RefreshCw size={13} /> : <Sparkles size={13} />} {u.draft ? 'Redraft' : 'Draft'}
                        </button>
                      </div>
                      {u.draft && <div className="vx-out vx-unit-out"><SafeMarkdown text={u.draft} /></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDITORIAL */}
            {draftedCount > 0 && (
              <Stage n="6" title="Editorial review" done={!!project.editorial} busy={busy === 'editorial'} disabled={false}
                onRun={() => run('editorial', async () => ({ editorial: await runEditorial(project, keys, settings), stage: 'editorial' }))} runLabel={project.editorial ? 'Review again' : 'Run editorial review'}>
                {project.editorial && <div className="vx-out"><SafeMarkdown text={project.editorial} /></div>}
              </Stage>
            )}

            {/* EXPORT */}
            {draftedCount > 0 && (
              <div className="vx-card">
                <h3>7. Export</h3>
                <p className="vx-muted">Download the full work as Markdown (open in Word/Docs/Scrivener), or as a portable .voxpress.json project. PDF/EPUB/KDP packaging is roadmap (see docs).</p>
                <div className="vx-row">
                  <button className="btn btn-primary vx-btn" onClick={download}><Download size={14} /> Download manuscript (.md)</button>
                  <button className="btn btn-secondary vx-btn" onClick={downloadJson}><FileText size={14} /> Download project (.json)</button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <style>{STYLES}</style>
    </div>
  );
};

const Stage: React.FC<{ n: string; title: string; done: boolean; busy: boolean; disabled: boolean; onRun: () => void; runLabel: string; children?: React.ReactNode }> =
  ({ n, title, done, busy, disabled, onRun, runLabel, children }) => (
    <div className="vx-card">
      <div className="vx-card-head">
        <h3>{n}. {title} {done && <Check size={14} className="vx-ok" />}</h3>
        <button className="btn btn-primary vx-btn" disabled={busy || disabled} onClick={onRun}>
          {busy ? <Loader2 size={14} className="vx-spin" /> : <Sparkles size={14} />} {runLabel}
        </button>
      </div>
      {children}
    </div>
  );

const STYLES = `
  .vx-container { display: flex; flex-direction: column; gap: 14px; padding: 8px 4px 40px; }
  .vx-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
  .vx-header h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 4px; font-family: var(--font-heading); color: var(--text-primary); }
  .vx-sub { color: var(--text-secondary); max-width: 760px; margin: 0; font-size: 0.9rem; line-height: 1.5; }
  .vx-pill { font-size: 0.78rem; font-family: var(--font-mono); padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border-glass); color: var(--text-secondary); cursor: pointer; }
  .vx-pill.warn { border-color: var(--warning); color: var(--warning); }
  .vx-error { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: var(--danger); font-size: 0.85rem; }
  .vx-error span { flex: 1; } .vx-error button { background: none; border: none; color: inherit; cursor: pointer; }
  .vx-body { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 14px; align-items: start; }
  .vx-side { padding: 12px; display: flex; flex-direction: column; gap: 10px; position: sticky; top: 8px; }
  .vx-new { width: 100%; justify-content: center; display: flex; align-items: center; gap: 6px; }
  .vx-plist { display: flex; flex-direction: column; gap: 6px; max-height: calc(100vh - 200px); overflow-y: auto; }
  .vx-pitem { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 10px; border: 1px solid var(--border-glass); border-radius: 8px; cursor: pointer; }
  .vx-pitem.on, .vx-pitem:hover { background: var(--bg-card-hover); }
  .vx-pitem strong { font-size: 0.84rem; color: var(--text-primary); display: block; }
  .vx-pitem small { font-size: 0.72rem; color: var(--text-muted); }
  .vx-del { background: none; border: none; color: var(--text-muted); cursor: pointer; }
  .vx-del:hover { color: var(--danger); }
  .vx-work { padding: 18px; display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  .vx-empty { align-items: center; justify-content: center; color: var(--text-muted); min-height: 300px; }
  .vx-name { background: none; border: none; border-bottom: 1px solid var(--border-glass); color: var(--text-primary); font-size: 1.3rem; font-family: var(--font-heading); padding: 4px 0; }
  .vx-stages { display: flex; flex-wrap: wrap; gap: 4px; font-size: 0.74rem; }
  .vx-stage { display: inline-flex; align-items: center; gap: 3px; color: var(--text-muted); }
  .vx-stage.on { color: var(--primary); font-weight: 600; }
  .vx-stage.done { color: var(--success); }
  .vx-arrow { opacity: 0.4; }
  .vx-card { border: 1px solid var(--border-glass); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
  .vx-card-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
  .vx-card h3 { margin: 0; font-size: 0.98rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
  .vx-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
  .vx-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
  .vx-field input, .vx-field select, .vx-field textarea, .vx-name {
    background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary); border-radius: 8px; padding: 8px 10px; font-family: var(--font-body); font-size: 0.86rem; resize: vertical;
  }
  .vx-name { background: none; border: none; border-bottom: 1px solid var(--border-glass); border-radius: 0; }
  .vx-rights { display: flex; align-items: flex-start; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); border: 1px solid var(--warning); border-radius: 8px; padding: 10px; }
  .vx-rights.ok { border-color: var(--success); }
  .vx-check { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); }
  .vx-muted { color: var(--text-muted); font-size: 0.8rem; margin: 0; }
  .vx-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 6px 12px; }
  .vx-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .vx-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .vx-out { border: 1px solid var(--border-glass); border-radius: 8px; padding: 10px 14px; background: var(--bg-dark); font-size: 0.86rem; line-height: 1.55; color: var(--text-secondary); max-height: 420px; overflow-y: auto; }
  .vx-outline { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; color: var(--text-primary); font-size: 0.85rem; }
  .vx-ok { color: var(--success); vertical-align: -1px; }
  .vx-units { display: flex; flex-direction: column; gap: 8px; }
  .vx-unit { border: 1px solid var(--border-glass); border-radius: 8px; padding: 10px 12px; }
  .vx-unit-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .vx-unit-head strong { font-size: 0.86rem; color: var(--text-primary); }
  .vx-unit-out { margin-top: 10px; }
  .vx-spin { animation: vx-spin 1s linear infinite; }
  @keyframes vx-spin { to { transform: rotate(360deg); } }
  @media (max-width: 900px) { .vx-body { grid-template-columns: 1fr; } .vx-side { position: static; } }
`;
