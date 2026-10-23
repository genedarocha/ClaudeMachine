#!/usr/bin/env node
// Snapshots the MIT-licensed agent library from https://github.com/msitarzewski/agency-agents into
// public/agency-agents/ so the app can load agents on demand (no runtime dependency on GitHub).
// Usage: node scripts/sync-agency-agents.mjs [path-to-local-clone]
// Without a path it shallow-clones the repo into a temp folder. Re-run any time to pick up new agents.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

const REPO = 'https://github.com/msitarzewski/agency-agents.git';
const OUT = path.resolve('public/agency-agents');

let src = process.argv[2];
if (!src) {
  src = fs.mkdtempSync(path.join(os.tmpdir(), 'agency-agents-'));
  execSync(`git clone --depth 1 -q ${REPO} "${src}"`, { stdio: 'inherit' });
}
const commit = execSync('git rev-parse --short HEAD', { cwd: src }).toString().trim();
const { divisions } = JSON.parse(fs.readFileSync(path.join(src, 'divisions.json'), 'utf8'));

// Minimal frontmatter reader: the agent files use simple `key: value` lines between --- markers.
const parseFrontmatter = text => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: text.slice(m[0].length).trim() };
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const agents = [];
for (const [division, info] of Object.entries(divisions)) {
  const dir = path.join(src, division);
  if (!fs.existsSync(dir)) continue;
  const files = [];
  const walk = d => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) files.push(full);
    }
  };
  walk(dir);
  for (const file of files.sort()) {
    const parsed = parseFrontmatter(fs.readFileSync(file, 'utf8'));
    if (!parsed?.meta.name || !parsed.body) continue; // READMEs and playbooks have no agent frontmatter
    const id = path.relative(src, file).replace(/\.md$/, '').replace(/[\\/]/g, '__');
    fs.writeFileSync(path.join(OUT, `${id}.md`), parsed.body);
    agents.push({
      id,
      name: parsed.meta.name,
      description: parsed.meta.description || '',
      emoji: parsed.meta.emoji || '🤖',
      vibe: parsed.meta.vibe || '',
      division,
      divisionLabel: info.label,
      color: info.color,
      source: `https://github.com/msitarzewski/agency-agents/blob/main/${path.relative(src, file)}`
    });
  }
}

fs.copyFileSync(path.join(src, 'LICENSE'), path.join(OUT, 'LICENSE'));
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({
  source: 'https://github.com/msitarzewski/agency-agents',
  license: 'MIT',
  commit,
  syncedAt: new Date().toISOString(),
  count: agents.length,
  agents
}, null, 1));
console.log(`Synced ${agents.length} agents from ${commit} into ${path.relative(process.cwd(), OUT)}`);
