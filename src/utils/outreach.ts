// Outreach: cold-email / sales-outreach cockpit. Leads live in the user's OWN Supabase project (BYO URL
// + anon key), reached directly over Supabase's REST API from the browser. The app imports CSV leads,
// writes AI sequences, and manages a suppression (unsubscribe) list.
//
// HONESTY — what a browser CANNOT do (needs a sending provider + server, see docs/OUTREACH.md):
//   actually send email, track opens/clicks, run scheduled drip retries, host unsubscribe/pixel pages.
// This tool prepares and stores everything and exports a send-ready file; a sending engine does the rest.
// It never claims a message was sent/opened when it wasn't.

import { type ApiKeys, type ModelSettings, generateText } from './ai';
import { buildRewritePrompt, checkHumanizer, tidyText, readVoiceSamples } from './humanizer';

export interface SupabaseConfig {
  url: string; // https://xxxx.supabase.co
  anonKey: string;
}

export interface Lead {
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  title?: string;
  extra?: Record<string, string>;
  status?: string; // new | queued | contacted | replied | bounced | unsubscribed
  created_at?: string;
}

const CFG_KEY = 'claude_machine_supabase';

export const loadSupabase = (): SupabaseConfig | null => {
  try { return JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); } catch { return null; }
};
export const saveSupabase = (c: SupabaseConfig) => { try { localStorage.setItem(CFG_KEY, JSON.stringify(c)); } catch { /* ignore */ } };
export const clearSupabase = () => { try { localStorage.removeItem(CFG_KEY); } catch { /* ignore */ } };

// SQL the user runs once in Supabase → SQL editor. RLS note included so they understand the tradeoff.
export const SCHEMA_SQL = `-- VoxPress Outreach schema. Run once in Supabase → SQL Editor.
create extension if not exists pgcrypto;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text, last_name text, company text, title text,
  extra jsonb default '{}'::jsonb,
  status text default 'new',
  consent_basis text,              -- e.g. 'legitimate interest', 'opt-in'
  created_at timestamptz default now()
);

create table if not exists unsubscribes (
  email text primary key,
  reason text,
  created_at timestamptz default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  steps jsonb default '[]'::jsonb, -- [{subject, body, waitDays}]
  from_name text, from_email text, reply_to text,
  physical_address text,           -- required by CAN-SPAM
  created_at timestamptz default now()
);

-- Used by the SENDING ENGINE (server), not the browser app:
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  step int, status text default 'queued', -- queued|sent|opened|clicked|replied|bounced
  scheduled_at timestamptz, sent_at timestamptz,
  created_at timestamptz default now()
);
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  type text, meta jsonb, created_at timestamptz default now()
);

-- SECURITY: the browser uses your anon key, which is public. Enable RLS and add policies you are
-- comfortable with. Simplest for a private single-user tool (your project only):
alter table leads enable row level security;
alter table unsubscribes enable row level security;
alter table campaigns enable row level security;
create policy "anon all leads" on leads for all to anon using (true) with check (true);
create policy "anon all unsub" on unsubscribes for all to anon using (true) with check (true);
create policy "anon all campaigns" on campaigns for all to anon using (true) with check (true);
-- NOTE: these allow anyone with your anon key to read/write these tables. Keep the key private,
-- and tighten with auth before storing large volumes of other people's personal data (GDPR).`;

// --- Supabase REST (no SDK, keeps the bundle small and easy to reason about) ----------------------

async function sb<T>(cfg: SupabaseConfig, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${cfg.url.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: cfg.anonKey,
      Authorization: `Bearer ${cfg.anonKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Supabase ${res.status}: ${body.slice(0, 200) || res.statusText}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const testConnection = (cfg: SupabaseConfig) => sb<Lead[]>(cfg, 'leads?select=email&limit=1');

export const fetchLeads = (cfg: SupabaseConfig, limit = 500) =>
  sb<Lead[]>(cfg, `leads?select=*&order=created_at.desc&limit=${limit}`);

export const fetchUnsubscribes = (cfg: SupabaseConfig) =>
  sb<{ email: string }[]>(cfg, 'unsubscribes?select=email&limit=5000');

// Upserts leads (on email conflict, ignores) in batches. Returns inserted count estimate.
export async function importLeads(cfg: SupabaseConfig, leads: Lead[]): Promise<number> {
  let n = 0;
  for (let i = 0; i < leads.length; i += 500) {
    const batch = leads.slice(i, i + 500);
    const res = await sb<Lead[]>(cfg, 'leads?on_conflict=email', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify(batch)
    });
    n += Array.isArray(res) ? res.length : 0;
  }
  return n;
}

export const addUnsubscribe = (cfg: SupabaseConfig, email: string, reason = 'manual') =>
  sb(cfg, 'unsubscribes?on_conflict=email', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify({ email: email.toLowerCase().trim(), reason }) });

export const setLeadStatus = (cfg: SupabaseConfig, id: string, status: string) =>
  sb(cfg, `leads?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status }) });

// --- CSV parsing ---------------------------------------------------------------------------------

export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = []; let row: string[] = []; let field = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); if (row.some(f => f.trim())) rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); if (row.some(f => f.trim())) rows.push(row); }
  const [headers = [], ...data] = rows;
  return { headers: headers.map(h => h.trim()), rows: data };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (s: string) => EMAIL_RE.test(s.trim());

// Best-guess mapping of CSV headers to lead fields.
export function guessMapping(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  const find = (...names: string[]) => headers.find(h => names.some(n => h.toLowerCase().replace(/[^a-z]/g, '').includes(n)));
  map.email = find('email', 'mail') || '';
  map.first_name = find('firstname', 'fname', 'first') || '';
  map.last_name = find('lastname', 'lname', 'surname', 'last') || '';
  map.company = find('company', 'organisation', 'organization', 'org', 'account') || '';
  map.title = find('title', 'role', 'position', 'jobtitle') || '';
  return map;
}

export function rowsToLeads(headers: string[], rows: string[][], mapping: Record<string, string>): { leads: Lead[]; invalid: number } {
  const idx = (field: string) => headers.indexOf(mapping[field]);
  const ei = idx('email');
  const leads: Lead[] = []; let invalid = 0; const seen = new Set<string>();
  for (const r of rows) {
    const email = (ei >= 0 ? r[ei] || '' : '').toLowerCase().trim();
    if (!isEmail(email) || seen.has(email)) { if (!isEmail(email)) invalid++; continue; }
    seen.add(email);
    const extra: Record<string, string> = {};
    headers.forEach((h, i) => { if (!Object.values(mapping).includes(h) && r[i]?.trim()) extra[h] = r[i].trim(); });
    leads.push({
      email,
      first_name: idx('first_name') >= 0 ? r[idx('first_name')]?.trim() : undefined,
      last_name: idx('last_name') >= 0 ? r[idx('last_name')]?.trim() : undefined,
      company: idx('company') >= 0 ? r[idx('company')]?.trim() : undefined,
      title: idx('title') >= 0 ? r[idx('title')]?.trim() : undefined,
      extra: Object.keys(extra).length ? extra : undefined
    });
  }
  return { leads, invalid };
}

// --- Sequence generation -------------------------------------------------------------------------

export interface SeqStep { subject: string; body: string; waitDays: number }

export async function generateSequence(opts: {
  offer: string; audience: string; fromName: string; signature: string; steps: number;
  humanize: boolean; keys: ApiKeys; settings: ModelSettings;
}): Promise<SeqStep[]> {
  const prompt = `# Task
Write a ${opts.steps}-step cold B2B outreach email sequence for ${opts.fromName}.

# What's being offered
${opts.offer}

# Who it's going to
${opts.audience}

# Rules
- Step 1 is the first email. Each later step is a short follow-up if there's no reply (2-4 days apart).
- Use merge fields exactly: {{first_name}}, {{company}}. Fall back gracefully if blank.
- Short: 50-110 words each. Specific, human, one clear ask (a quick reply or a short call). No hype.
- No fake personalisation ("I was impressed by your work"), no made-up facts about them.
- Plain British English. Each step must open differently.
- Do NOT include an unsubscribe line or address in the body — those are added automatically for compliance.

# Output
Return ONLY JSON: {"steps":[{"subject":"...","body":"...","waitDays":0}]} with ${opts.steps} steps (step 1 waitDays 0).`;
  const voice = readVoiceSamples();
  const raw = await generateText(voice ? `${prompt}\n\n# ${opts.fromName}'s writing style (match it)\n"""\n${voice.slice(0, 1500)}\n"""` : prompt, opts.keys, opts.settings, 8000, 0.8, { json: true });
  const s = raw.indexOf('{'); const e = raw.lastIndexOf('}');
  if (s === -1) throw new Error('No sequence returned. Try again.');
  const parsed = JSON.parse(raw.slice(s, e + 1)) as { steps?: SeqStep[] };
  let steps = (parsed.steps || []).map(st => ({ subject: String(st.subject || '').slice(0, 120), body: tidyText(String(st.body || ''), 'longform'), waitDays: Number(st.waitDays) || 0 }));
  if (opts.humanize && opts.settings.provider !== 'mock') {
    steps = await Promise.all(steps.map(async st => {
      const issues = checkHumanizer(st.body, 'longform');
      if (!issues.length) return st;
      const rewritten = tidyText(await generateText(buildRewritePrompt(st.body, issues, voice), opts.keys, opts.settings, 1000, 0.8), 'longform');
      return { ...st, body: rewritten || st.body };
    }));
  }
  if (!steps.length) throw new Error('Empty sequence. Try again.');
  return steps;
}

// Merges a lead into a step and appends the required compliance footer.
export function renderStep(step: SeqStep, lead: Lead, signature: string, address: string): { subject: string; body: string } {
  const sub = step.subject.replace(/\{\{first_name\}\}/g, lead.first_name || 'there').replace(/\{\{company\}\}/g, lead.company || 'your team');
  let body = step.body.replace(/\{\{first_name\}\}/g, lead.first_name || 'there').replace(/\{\{company\}\}/g, lead.company || 'your team');
  body += `\n\n${signature}`;
  body += `\n\n—\nYou're receiving this as a business contact. Reply "unsubscribe" to opt out.\n${address}`;
  return { subject: sub, body };
}

// Export a send-ready CSV (one row per lead × step) for a sending platform (Instantly, Smartlead, etc.).
export function campaignToCsv(leads: Lead[], steps: SeqStep[], signature: string, address: string, suppressed: Set<string>): string {
  const esc = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
  const header = ['email', 'first_name', 'company', 'step', 'wait_days', 'subject', 'body'];
  const rows: string[] = [header.join(',')];
  for (const lead of leads) {
    if (suppressed.has(lead.email)) continue;
    steps.forEach((step, i) => {
      const { subject, body } = renderStep(step, lead, signature, address);
      rows.push([lead.email, lead.first_name || '', lead.company || '', String(i + 1), String(step.waitDays), subject, body].map(esc).join(','));
    });
  }
  return rows.join('\n');
}

// --- Sending engine (optional Supabase Edge Functions backend) -----------------------------------

export interface EngineConfig { functionsUrl: string; secret: string }
const ENGINE_KEY = 'claude_machine_outreach_engine';
export const loadEngine = (): EngineConfig | null => { try { return JSON.parse(localStorage.getItem(ENGINE_KEY) || 'null'); } catch { return null; } };
export const saveEngine = (e: EngineConfig) => { try { localStorage.setItem(ENGINE_KEY, JSON.stringify(e)); } catch { /* ignore */ } };

export interface CampaignRow {
  name: string; steps: SeqStep[]; from_name: string; from_email: string; reply_to?: string; signature: string; physical_address: string;
}

// Creates the campaign in Supabase and tells the engine to queue it. Returns the enqueue result.
export async function launchCampaign(cfg: SupabaseConfig, engine: EngineConfig, campaign: CampaignRow): Promise<{ leads_queued: number; messages_created: number }> {
  const [created] = await sb<{ id: string }[]>(cfg, 'campaigns', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(campaign) });
  if (!created?.id) throw new Error('Could not create the campaign in Supabase.');
  const res = await fetch(`${engine.functionsUrl.replace(/\/$/, '')}/enqueue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-outreach-secret': engine.secret },
    body: JSON.stringify({ campaign_id: created.id })
  });
  if (!res.ok) throw new Error(`Engine ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

export interface SendStats { sent: number; opened: number; clicked: number; replied: number; queued: number; cancelled: number; failed: number }

// Reads message/event counts straight from Supabase for a live dashboard.
export async function fetchStats(cfg: SupabaseConfig): Promise<SendStats> {
  const head = async (query: string): Promise<number> => {
    const res = await fetch(`${cfg.url.replace(/\/$/, '')}/rest/v1/${query}`, {
      method: 'HEAD',
      headers: { apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}`, Prefer: 'count=exact', Range: '0-0' }
    });
    const cr = res.headers.get('content-range') || '*/0';
    return Number(cr.split('/')[1]) || 0;
  };
  const [sent, opened, clicked, queued, cancelled, failed, replied] = await Promise.all([
    head('messages?status=eq.sent&select=id'),
    head('messages?status=eq.opened&select=id'),
    head('messages?status=eq.clicked&select=id'),
    head('messages?status=eq.queued&select=id'),
    head('messages?status=eq.cancelled&select=id'),
    head('messages?status=eq.failed&select=id'),
    head('leads?status=eq.replied&select=id')
  ]);
  return { sent: sent + opened + clicked, opened: opened + clicked, clicked, queued, cancelled, failed, replied };
}
