// track — public endpoint hit by the tracking pixel and rewritten links.
//   GET /track?m=<id>&t=<token>&e=open          -> logs an open, returns a 1x1 gif
//   GET /track?m=<id>&t=<token>&e=click&u=<url>  -> logs a click, 302-redirects to the real url
// The per-message token prevents enumeration. No secret needed (it's public, called from the recipient).
import { cors, db, ONE_PX_GIF } from '../_shared/util.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const u = new URL(req.url);
  const m = u.searchParams.get('m') || '';
  const t = u.searchParams.get('t') || '';
  const e = u.searchParams.get('e') || 'open';
  const dest = u.searchParams.get('u') || '';

  const gif = () => new Response(ONE_PX_GIF, { headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, no-cache, must-revalidate', ...cors } });

  if (!m || !t) return gif();
  try {
    const d = db();
    const [msg] = await d.select<{ id: string; token: string; lead_id: string }[]>('messages', `?id=eq.${m}&token=eq.${t}&select=id,token,lead_id`);
    if (msg) {
      await d.insert('events', [{ message_id: m, type: e === 'click' ? 'clicked' : 'opened', meta: e === 'click' ? { url: dest } : {} }], 'return=minimal');
      // First open/click promotes message status (don't downgrade a later state).
      if (e === 'click') await d.update('messages', `?id=eq.${m}&status=in.(sent,opened)`, { status: 'clicked' });
      else await d.update('messages', `?id=eq.${m}&status=eq.sent`, { status: 'opened' });
    }
  } catch { /* never block the recipient on a logging failure */ }

  if (e === 'click' && dest) {
    try {
      const target = new URL(dest);
      if (target.protocol === 'http:' || target.protocol === 'https:') {
        return new Response(null, { status: 302, headers: { Location: target.toString(), ...cors } });
      }
    } catch { /* fall through to gif */ }
  }
  return gif();
});
