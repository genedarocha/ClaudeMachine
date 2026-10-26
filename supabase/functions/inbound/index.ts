// inbound — reply webhook. Point your email provider's inbound/reply webhook here (Resend inbound,
// or forward replies to a parser that POSTs {email} or {from}). When a lead replies, mark them replied
// and cancel their remaining queued follow-ups (so the drip stops on reply, as intended).
// Secured with x-outreach-secret (set the same secret in the provider webhook config).
import { cors, json, db, checkSecret } from '../_shared/util.ts';

function extractEmail(payload: Record<string, unknown>): string {
  // Accept a few shapes: {email}, {from}, {from:{email}}, Resend-style {data:{from}}.
  const from = (payload.email || payload.from || (payload.from as { email?: string })?.email ||
    (payload.data as { from?: string })?.from || '') as string;
  const m = String(from).match(/[^\s<>"]+@[^\s<>"]+\.[^\s<>"]+/);
  return m ? m[0].toLowerCase() : '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!checkSecret(req)) return json({ error: 'Unauthorized' }, 401);

  try {
    const payload = await req.json().catch(() => ({}));
    const email = extractEmail(payload);
    if (!email) return json({ ok: false, note: 'no sender email found' });

    const d = db();
    const [lead] = await d.select<{ id: string }[]>('leads', `?email=eq.${encodeURIComponent(email)}&select=id`);
    if (!lead) return json({ ok: true, note: 'sender is not a known lead' });

    await d.update('leads', `?id=eq.${lead.id}`, { status: 'replied', replied_at: new Date().toISOString() });
    await d.update('messages', `?lead_id=eq.${lead.id}&status=eq.queued`, { status: 'cancelled' });
    return json({ ok: true, lead_id: lead.id, stopped_followups: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
