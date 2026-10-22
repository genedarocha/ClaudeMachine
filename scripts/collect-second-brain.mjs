#!/usr/bin/env node
// Second Brain collector. Pulls Gene's published writing into the second brain's raw/ archive as
// markdown files with frontmatter (one file per article, original wording kept), then rebuilds INDEX.md.
//
//   node scripts/collect-second-brain.mjs                       # collect from every website source
//   node scripts/collect-second-brain.mjs --only atl-trust      # one source
//   node scripts/collect-second-brain.mjs --linkedin ~/Downloads/Basic_LinkedInDataExport_….zip
//   node scripts/collect-second-brain.mjs --refresh             # re-download files that already exist
//   SECOND_BRAIN_DIR=/path/to/brain node scripts/…              # default: ~/Documents/second-brain
//
// LinkedIn isn't scraped (that breaks LinkedIn's terms and needs your login). Use LinkedIn's own export:
// Settings & Privacy → Data privacy → Get a copy of your data → Articles + Shares (posts) → download the
// zip and pass it with --linkedin.
//
// Re-running is safe: existing files are skipped unless --refresh, so it only adds what's new.

import fs from 'fs';
import os from 'os';
import path from 'path';
import dns from 'dns';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { Agent } from 'undici';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

const BRAIN = process.env.SECOND_BRAIN_DIR || path.join(os.homedir(), 'Documents', 'second-brain');
const args = process.argv.slice(2);
const flag = name => args.includes(`--${name}`);
const option = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const REFRESH = flag('refresh');
const ONLY = option('only');
const UA = 'Mozilla/5.0 (Macintosh) SecondBrainCollector/1.0 (Gene Da Rocha personal archive)';

// Some networks resolve these domains to localhost (seen on Gene's Mac for genedarocha.com). When the
// system answer is a loopback address, ask public DNS instead.
const publicResolver = new dns.promises.Resolver();
publicResolver.setServers(['8.8.8.8', '1.1.1.1']);
const dispatcher = new Agent({
  connect: {
    lookup: (hostname, opts, cb) => {
      // Node may ask for one address or (opts.all) a list; answer in the shape it asked for.
      const reply = (ip, family) => (opts && opts.all ? cb(null, [{ address: ip, family }]) : cb(null, ip, family));
      dns.lookup(hostname, { family: 4 }, async (err, address, family) => {
        if (!err && !address.startsWith('127.')) return reply(address, family);
        try {
          const [ip] = await publicResolver.resolve4(hostname);
          reply(ip, 4);
        } catch (e) {
          cb(err || e);
        }
      });
    }
  }
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, asJson = false) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { dispatcher, headers: { 'User-Agent': UA }, redirect: 'follow' });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`${res.status}`);
      return asJson ? res.json() : res.text();
    } catch (err) {
      if (attempt === 3) { console.warn(`  ! ${url}: ${err.message}`); return null; }
      await sleep(800 * attempt);
    }
  }
}

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
turndown.remove(['script', 'style', 'noscript', 'iframe', 'form', 'button']);

const silent = new VirtualConsole();
function extract(html, url) {
  const dom = new JSDOM(html, { url, virtualConsole: silent });
  const doc = dom.window.document;
  const meta = name => doc.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.getAttribute('content') || '';
  const published = meta('article:published_time') || meta('datePublished') || meta('date') ||
    doc.querySelector('time[datetime]')?.getAttribute('datetime') || '';
  // Prefer the page's own headline: some sites (e.g. AIToolboard articles) reuse the homepage <title>.
  const h1 = doc.querySelector('article h1, main h1, h1')?.textContent?.replace(/\s+/g, ' ').trim() || '';
  const ogTitle = meta('og:title');
  const article = new Readability(doc).parse();
  const title = (h1.length > 8 ? h1 : '') || ogTitle || (article?.title || doc.title || '').trim();
  const markdown = article?.content ? turndown.turndown(article.content).trim() : '';
  return { title, markdown, published, description: meta('description') || meta('og:description') };
}

const slugify = s => (s || 'untitled').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80) || 'untitled';
const isoDate = d => { const t = new Date(d); return isNaN(t) ? '' : t.toISOString().slice(0, 10); };
const yaml = v => JSON.stringify(v ?? '');

const counts = {};
function writeNote(folder, { title, url, site, type, published, markdown, description, extra = {} }) {
  // Some URLs end in a 13-digit millisecond timestamp (AIToolboard articles); use it when the page has no date.
  const stamp = !published && url.match(/-(1[5-9]\d{11})$/)?.[1];
  const date = isoDate(published || (stamp ? Number(stamp) : ''));
  const dir = path.join(BRAIN, 'raw', folder);
  fs.mkdirSync(dir, { recursive: true });
  let file = path.join(dir, `${date || 'undated'}-${slugify(title || url.split('/').pop())}.md`);
  counts[folder] ??= { added: 0, skipped: 0, empty: 0 };
  if (!markdown || markdown.split(/\s+/).length < 40) { counts[folder].empty++; return; }
  // A file with this name from a different URL is a different article with the same title: name it by URL.
  if (fs.existsSync(file) && readFrontmatter(file).source_url !== url) {
    file = path.join(dir, `${date || 'undated'}-${slugify(new URL(url).pathname.split('/').filter(Boolean).pop() || title)}.md`);
  }
  if (fs.existsSync(file) && !REFRESH) { counts[folder].skipped++; return; }
  const words = markdown.split(/\s+/).filter(Boolean).length;
  const fm = [
    '---',
    `title: ${yaml(title)}`,
    `type: ${type}`,
    `site: ${site}`,
    `source_url: ${yaml(url)}`,
    `published: ${yaml(date)}`,
    `collected: ${yaml(new Date().toISOString().slice(0, 10))}`,
    `visibility: public`,
    `words: ${words}`,
    ...(description ? [`description: ${yaml(description.slice(0, 300))}`] : []),
    ...Object.entries(extra).map(([k, v]) => `${k}: ${yaml(v)}`),
    '---',
    ''
  ].join('\n');
  fs.writeFileSync(file, `${fm}# ${title}\n\n${markdown}\n`);
  counts[folder].added++;
}

async function collectUrls(urls, folder, site, type) {
  for (const url of urls) {
    const html = await get(url);
    if (!html) continue;
    const page = extract(html, url);
    writeNote(folder, { ...page, url, site, type });
    await sleep(250);
  }
}

const sitemapUrls = async url => {
  const xml = await get(url);
  return xml ? [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()) : [];
};

// --- Sources ---------------------------------------------------------------------------------------

const SOURCES = {
  'genedarocha.com': async () => {
    const urls = (await sitemapUrls('https://www.genedarocha.com/sitemap.xml'));
    const list = urls.length ? urls : ['https://www.genedarocha.com/'];
    console.log(`genedarocha.com: ${list.length} pages`);
    await collectUrls(list, 'genedarocha.com', 'genedarocha.com', 'page');
  },
  'atl-trust': async () => {
    const html = await get('https://atl-trust.com/blog.html');
    const m = html?.match(/window\.ALL_BLOGS\s*=\s*(\[[\s\S]*?\]);/);
    let posts = [];
    try { posts = m ? JSON.parse(m[1]) : []; } catch { posts = []; }
    console.log(`atl-trust.com: ${posts.length} blog posts`);
    for (const p of posts) {
      const url = `https://atl-trust.com/blog/${p.filename}`;
      const page = await get(url);
      if (!page) continue;
      const ex = extract(page, url);
      const date = (p.meta || '').match(/[A-Z][a-z]+ \d{1,2}, \d{4}/)?.[0] || ex.published;
      writeNote('atl-trust.com', { ...ex, title: p.title || ex.title, url, site: 'atl-trust.com', type: 'blog', published: date, extra: { series_number: p.id } });
      await sleep(250);
    }
  },
  aitoolboard: async () => {
    // Posts live at /blog/article/<slug>. The site's sitemap lists them as /blog/<slug>, which 404s
    // (reported to Gene as an SEO fix), so use the blog page's own links plus corrected sitemap URLs.
    const found = new Set();
    for (let page = 1; page <= 20; page++) {
      const html = await get(`https://aitoolboard.com/blog${page > 1 ? `?page=${page}` : ''}`);
      const links = html ? [...html.matchAll(/href="(\/blog\/article\/[^"#?]+)"/g)].map(m => `https://aitoolboard.com${m[1]}`) : [];
      const before = found.size;
      links.forEach(l => found.add(l));
      if (found.size === before) break;
      await sleep(250);
    }
    for (const u of await sitemapUrls('https://aitoolboard.com/sitemap.xml')) {
      const m = u.match(/aitoolboard\.com\/blog\/(?!article\/)([^/]+-\d{10,})$/);
      if (m) found.add(`https://aitoolboard.com/blog/article/${m[1]}`);
    }
    const urls = [...found];
    console.log(`aitoolboard.com: ${urls.length} blog posts`);
    await collectUrls(urls, 'aitoolboard.com', 'aitoolboard.com', 'blog');
  },
  voxstar: async () => {
    // No sitemap or blog: collect the main page and the same-site pages it links to.
    for (const base of ['https://voxstar.com', 'https://voxstar.ai']) {
      const html = await get(base);
      if (!html) continue;
      const host = new URL(base).host;
      const links = [...new Set([...html.matchAll(/href="([^"#?]+)"/g)].map(m => { try { return new URL(m[1], base).href; } catch { return ''; } })
        .filter(u => u && new URL(u).host === host && !/\.(png|jpe?g|svg|css|js|ico|pdf|zip)$/i.test(u)))].slice(0, 25);
      const list = [base + '/', ...links.filter(u => u !== base + '/')];
      console.log(`${host}: ${list.length} pages`);
      await collectUrls(list, host, host, 'page');
    }
  },
  substack: async () => {
    for (const pub of ['genedarocha', 'voxstar']) {
      const posts = [];
      for (let offset = 0; offset < 2000; offset += 20) {
        const batch = await get(`https://${pub}.substack.com/api/v1/archive?sort=new&offset=${offset}&limit=20`, true);
        if (!batch?.length) break;
        posts.push(...batch);
        await sleep(300);
      }
      console.log(`${pub}.substack.com: ${posts.length} posts`);
      for (const p of posts) {
        const folder = `${pub}.substack.com`;
        const date = isoDate(p.post_date);
        const file = path.join(BRAIN, 'raw', folder, `${date || 'undated'}-${slugify(p.title)}.md`);
        const canonical = p.canonical_url || `https://${pub}.substack.com/p/${p.slug}`;
        if (fs.existsSync(file) && !REFRESH && readFrontmatter(file).source_url === canonical) { (counts[folder] ??= { added: 0, skipped: 0, empty: 0 }).skipped++; continue; }
        const full = await get(`https://${pub}.substack.com/api/v1/posts/${p.slug}`, true);
        const body = full?.body_html ? turndown.turndown(full.body_html).trim() : '';
        writeNote(folder, {
          title: p.title, url: p.canonical_url || `https://${pub}.substack.com/p/${p.slug}`, site: `${pub}.substack.com`,
          type: p.type === 'podcast' ? 'podcast-article' : 'blog', published: p.post_date, markdown: body,
          description: p.subtitle || p.description || '', extra: full?.audience && full.audience !== 'everyone' ? { audience: full.audience } : {}
        });
        await sleep(300);
      }
    }
  }
};

// --- LinkedIn export ---------------------------------------------------------------------------------

function parseCsv(text) {
  const rows = []; let row = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...data] = rows.filter(r => r.some(Boolean));
  return (data || []).map(r => Object.fromEntries((header || []).map((h, i) => [h.trim(), r[i] ?? ''])));
}

async function importLinkedIn(src) {
  let dir = path.resolve(src.replace(/^~/, os.homedir()));
  if (dir.endsWith('.zip')) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'li-export-'));
    execSync(`unzip -q -o "${dir}" -d "${tmp}"`);
    dir = tmp;
  }
  const findAll = (d, test, out = []) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) findAll(full, test, out); else if (test(full)) out.push(full);
    }
    return out;
  };
  // Articles (including newsletter issues) come as HTML files under Articles/.
  const articles = findAll(dir, f => /Articles/i.test(f) && f.endsWith('.html'));
  console.log(`LinkedIn export: ${articles.length} articles`);
  for (const f of articles) {
    const html = fs.readFileSync(f, 'utf8');
    const ex = extract(html, 'https://www.linkedin.com/');
    const created = html.match(/Created on (\d{4}-\d{2}-\d{2})/)?.[1] || html.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '';
    writeNote('linkedin/articles', { ...ex, title: ex.title || path.basename(f, '.html'), url: 'https://www.linkedin.com/in/genedarocha/recent-activity/articles/', site: 'linkedin', type: 'linkedin-article', published: created });
  }
  // Posts come as Shares.csv (Date, ShareLink, ShareCommentary, ...).
  for (const csv of findAll(dir, f => /Shares\.csv$/i.test(f))) {
    const rows = parseCsv(fs.readFileSync(csv, 'utf8'));
    console.log(`LinkedIn export: ${rows.length} posts`);
    for (const r of rows) {
      const text = (r.ShareCommentary || '').replace(/""/g, '"').trim();
      if (!text) continue;
      const firstLine = text.split('\n').find(l => l.trim()) || 'post';
      writeNote('linkedin/posts', { title: firstLine.slice(0, 90), url: r.ShareLink || 'https://www.linkedin.com/in/genedarocha/', site: 'linkedin', type: 'linkedin-post', published: r.Date, markdown: text });
    }
  }
}

// --- Index ---------------------------------------------------------------------------------------

function readFrontmatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) { try { fm[kv[1]] = JSON.parse(kv[2]); } catch { fm[kv[1]] = kv[2]; } }
  }
  return fm;
}

export function buildIndex(brain = BRAIN) {
  const all = [];
  const walk = d => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.md') && !['INDEX.md', 'CLAUDE.md', 'README.md'].includes(e.name)) all.push(full);
    }
  };
  walk(brain);
  const groups = {};
  for (const f of all) {
    const rel = path.relative(brain, f);
    const fm = readFrontmatter(f);
    const group = rel.split(path.sep).slice(0, rel.startsWith('raw') ? 2 : 1).join('/');
    (groups[group] ||= []).push({ rel, title: fm.title || path.basename(f, '.md'), date: fm.published || fm.date || '', type: fm.type || '', visibility: fm.visibility || 'public', words: fm.words || '' });
  }
  const order = ['identity', 'projects', 'knowledge', 'lenses', 'docs'];
  const keys = Object.keys(groups).sort((a, b) => {
    const ia = order.indexOf(a.split('/')[0]); const ib = order.indexOf(b.split('/')[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });
  const lines = [
    '# INDEX',
    '',
    `Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} by scripts/collect-second-brain.mjs (also rebuilt by the Second Brain screen). Do not edit by hand.`,
    '',
    `${all.length} notes.`,
    ''
  ];
  for (const k of keys) {
    const items = groups[k].sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));
    lines.push(`## ${k} (${items.length})`, '');
    for (const it of items) lines.push(`- [${it.title.replace(/[[\]]/g, '')}](${it.rel.split(path.sep).join('/')})${it.date ? ` · ${it.date}` : ''}${it.type ? ` · ${it.type}` : ''}${it.visibility !== 'public' ? ` · ${it.visibility}` : ''}`);
    lines.push('');
  }
  fs.writeFileSync(path.join(brain, 'INDEX.md'), lines.join('\n'));
  return all.length;
}

// --- Main ----------------------------------------------------------------------------------------

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (!fs.existsSync(path.join(BRAIN, 'CLAUDE.md'))) {
    console.error(`No second brain found at ${BRAIN}. Create it first (see docs/USER-GUIDE.md → Second Brain).`);
    process.exit(1);
  }
  const li = option('linkedin');
  if (li) await importLinkedIn(li);
  else {
    for (const [name, run] of Object.entries(SOURCES)) {
      if (ONLY && !name.includes(ONLY)) continue;
      await run();
    }
  }
  const total = buildIndex();
  console.log('\nResult (added / already there / too short to keep):');
  for (const [k, v] of Object.entries(counts)) console.log(`  raw/${k}: ${v.added} / ${v.skipped} / ${v.empty}`);
  console.log(`INDEX.md rebuilt: ${total} notes in ${BRAIN}`);
}
