// unsubscribe — public opt-out endpoint (link in every email + RFC 8058 one-click POST).
//   GET  /unsubscribe?m=<id>&t=<token>  -> shows a confirmation page and opts the lead out
//   POST /unsubscribe?m=<id>&t=<token>  -> one-click (List-Unsubscribe-Post), returns 200
// Opting out: add to unsubscribes, mark the lead, and cancel their queued messages immediately.
import { cors, db, escapeHtml } from '../_shared/util.ts';

async function optOut(m: string, t: string): Promise<string | null> {
  const d = db();
  const [msg] = await d.select<{ id: string; lead_id: string; token: string }[]>('messages', `?id=eq.${m}&token=eq.${t}&select=id,lead_id`);
  if (!msg) return null;
  const [lead] = await d.select<{ email: string }[]>('leads', `?id=eq.${msg.lead_id}&select=email`);
  if (!lead) return null;
  const email = lead.email.toLowerCase();
  await d.upsert('unsubscribes', [{ email, reason: 'link' }], 'email');
  await d.update('leads', `?id=eq.${msg.lead_id}`, { status: 'unsubscribed' });
  await d.update('messages', `?lead_id=eq.${msg.lead_id}&status=eq.queued`, { status: 'cancelled' });
  await d.insert('events', [{ message_id: m, type: 'unsubscribed', meta: {} }], 'return=minimal').catch(() => {});
  return email;
}

const page = (title: string, msg: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:80px auto;padding:0 20px;color:#1d2226;text-align:center">
<h2>${title}</h2><p style="color:#555;line-height:1.5">${msg}</p></body></html>`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const u = new URL(req.url);
  const m = u.searchParams.get('m') || '';
  const t = u.searchParams.get('t') || '';

  if (req.method === 'POST') {
    // RFC 8058 one-click: opt out, return 200, no body needed.
    try { await optOut(m, t); } catch { /* ignore */ }
    return new Response('OK', { status: 200, headers: cors });
  }

  try {
    const email = await optOut(m, t);
    const html = email
      ? page('You have unsubscribed', `${escapeHtml(email)} won't receive any further emails. Sorry to have bothered you.`)
      : page('Link not recognised', 'This unsubscribe link is invalid or has expired. If you keep receiving emails, reply with "unsubscribe".');
    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...cors } });
  } catch {
    return new Response(page('Something went wrong', 'Please reply to the email with "unsubscribe" and you will be removed.'), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...cors } });
  }
});
