// Shared helpers for the VoxPress Outreach sending engine (Supabase Edge Functions, Deno).
// The service role key stays on the server (function env), never in the browser.

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-outreach-secret',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

export const env = (k: string, required = true): string => {
  const v = Deno.env.get(k) ?? '';
  if (required && !v) throw new Error(`Missing env var ${k}`);
  return v;
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

// Thin Supabase REST client using the service role key (full access, server-only).
export function db() {
  const url = env('SUPABASE_URL').replace(/\/$/, '');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const call = async (path: string, init: RequestInit = {}) => {
    const res = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init.headers || {}) }
    });
    if (!res.ok) throw new Error(`DB ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const t = await res.text();
    return t ? JSON.parse(t) : null;
  };
  return {
    select: <T = unknown>(table: string, query = '') => call(`${table}${query}`) as Promise<T>,
    insert: <T = unknown>(table: string, rows: unknown, prefer = 'return=representation') =>
      call(table, { method: 'POST', headers: { Prefer: prefer }, body: JSON.stringify(rows) }) as Promise<T>,
    update: (table: string, query: string, patch: unknown) =>
      call(`${table}${query}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) }),
    upsert: (table: string, rows: unknown, onConflict: string) =>
      call(`${table}?on_conflict=${onConflict}`, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) })
  };
}

// Constant-time-ish shared-secret check for the write endpoints (enqueue, send-due, inbound).
export function checkSecret(req: Request): boolean {
  const given = req.headers.get('x-outreach-secret') ?? new URL(req.url).searchParams.get('secret') ?? '';
  const want = env('OUTREACH_SECRET');
  if (given.length !== want.length) return false;
  let ok = 0;
  for (let i = 0; i < want.length; i++) ok |= given.charCodeAt(i) ^ want.charCodeAt(i);
  return ok === 0;
}

export const token = () => crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Merge {{first_name}} / {{company}} into text.
export function merge(text: string, lead: { first_name?: string; company?: string }): string {
  return (text || '')
    .replace(/\{\{\s*first_name\s*\}\}/g, lead.first_name || 'there')
    .replace(/\{\{\s*company\s*\}\}/g, lead.company || 'your team');
}

// Plain-text body → HTML with tracked links, a tracking pixel, and a one-click unsubscribe link.
export function renderHtml(bodyText: string, base: string, messageId: string, tok: string): string {
  const linkRe = /(https?:\/\/[^\s<>"]+)/g;
  const withLinks = escapeHtml(bodyText).replace(linkRe, (u) =>
    `<a href="${base}/track?m=${messageId}&t=${tok}&e=click&u=${encodeURIComponent(u)}">${u}</a>`);
  const html = withLinks.replace(/\n/g, '<br>');
  const unsub = `${base}/unsubscribe?m=${messageId}&t=${tok}`;
  const pixel = `<img src="${base}/track?m=${messageId}&t=${tok}&e=open" width="1" height="1" alt="" style="display:none">`;
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.5;color:#1d2226">${html}
<br><br><span style="font-size:12px;color:#888">If you'd rather not hear from me, <a href="${unsub}">unsubscribe</a>.</span>${pixel}</div>`;
}

// Sends one email via Resend. Returns the provider id or throws.
export async function sendEmail(opts: {
  to: string; from: string; replyTo?: string; subject: string; html: string; text: string; unsubscribeUrl: string;
}): Promise<string> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      reply_to: opts.replyTo || undefined,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      // RFC 8058 one-click unsubscribe — improves deliverability and compliance.
      headers: {
        'List-Unsubscribe': `<${opts.unsubscribeUrl}>, <mailto:${env('UNSUB_MAILBOX', false) || 'unsubscribe@example.com'}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    })
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.id as string;
}

export const ONE_PX_GIF = Uint8Array.from(
  atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
  (c) => c.charCodeAt(0)
);
