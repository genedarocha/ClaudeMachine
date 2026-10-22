import React, { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import guide from '../../docs/USER-GUIDE.md?raw';
import { SafeMarkdown } from './SpecialistRunner';

// Renders docs/USER-GUIDE.md (the single source for the guide, also readable on GitHub), one ## section
// at a time, with search across all sections.

interface Section {
  title: string;
  body: string;
}

const sections: Section[] = guide
  .split(/\n(?=## )/)
  .filter(part => part.startsWith('## '))
  .map(part => {
    const [first, ...rest] = part.split('\n');
    return { title: first.replace(/^##\s+/, '').trim(), body: rest.join('\n').trim() };
  });

export const UserGuide: React.FC = () => {
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return sections.map((s, i) => ({ ...s, i })).filter(s => `${s.title}\n${s.body}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="ug-container animate-fade">
      <header>
        <h2><BookOpen size={22} /> User Guide</h2>
        <p className="ug-sub">How every screen, field and process in Claude Machine works.</p>
      </header>
      <div className="ug-body">
        <nav className="ug-toc glass-panel">
          <div className="ug-search"><Search size={13} /><input placeholder="Search the guide" value={query} onChange={e => setQuery(e.target.value)} /></div>
          {(matches ?? sections.map((s, i) => ({ ...s, i }))).map(s => (
            <button key={s.i} className={s.i === active && !matches ? 'on' : ''} onClick={() => { setActive(s.i); setQuery(''); }}>{s.title}</button>
          ))}
          {matches && matches.length === 0 && <p className="ug-muted">No matches.</p>}
        </nav>
        <article className="ug-content glass-panel">
          <h3>{sections[active]?.title}</h3>
          <SafeMarkdown text={sections[active]?.body || ''} />
          <div className="ug-pager">
            {active > 0 && <button onClick={() => setActive(active - 1)}>← {sections[active - 1].title}</button>}
            {active < sections.length - 1 && <button onClick={() => setActive(active + 1)}>{sections[active + 1].title} →</button>}
          </div>
        </article>
      </div>
      <style>{`
        .ug-container { display: flex; flex-direction: column; gap: 14px; padding: 8px 4px 40px; }
        .ug-container h2 { display: flex; align-items: center; gap: 10px; font-family: var(--font-heading); margin: 0 0 6px; color: var(--text-primary); }
        .ug-sub { color: var(--text-secondary); margin: 0; font-size: 0.9rem; }
        .ug-body { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 14px; align-items: start; }
        .ug-toc { padding: 10px; display: flex; flex-direction: column; gap: 2px; position: sticky; top: 8px; }
        .ug-toc button { background: none; border: none; text-align: left; color: var(--text-secondary); font-size: 0.82rem; padding: 6px 8px; border-radius: 6px; cursor: pointer; }
        .ug-toc button:hover, .ug-toc button.on { background: var(--bg-card-hover); color: var(--text-primary); }
        .ug-search { display: flex; align-items: center; gap: 6px; border: 1px solid var(--border-glass); border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; color: var(--text-muted); }
        .ug-search input { background: none; border: none; outline: none; color: var(--text-primary); width: 100%; font-size: 0.82rem; }
        .ug-muted { color: var(--text-muted); font-size: 0.8rem; padding: 6px 8px; margin: 0; }
        .ug-content { padding: 20px 26px; line-height: 1.6; color: var(--text-secondary); }
        .ug-content h3 { margin: 0 0 12px; color: var(--text-primary); font-size: 1.2rem; }
        .ug-content a { color: var(--primary); }
        .ug-pager { display: flex; justify-content: space-between; gap: 10px; margin-top: 20px; border-top: 1px solid var(--border-glass); padding-top: 12px; }
        .ug-pager button { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.82rem; }
        @media (max-width: 800px) { .ug-body { grid-template-columns: 1fr; } .ug-toc { position: static; } }
      `}</style>
    </div>
  );
};
