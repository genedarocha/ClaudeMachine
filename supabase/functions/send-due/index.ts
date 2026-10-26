// send-due — the drip worker. Run on a schedule (pg_cron, see the migration) or trigger manually.
// Sends queued messages whose scheduled_at has passed, with tracking + unsubscribe, and stops the
// sequence for anyone who has replied or unsubscribed. This is the "auto-retry/follow-up" engine:
// later steps only go out if the lead hasn't replied.
import { cors, json, env, db, checkSecret, merge, renderHtml, sendEmail, token as mkToken } from '../_shared/util.ts';

interface Campaign { id: string; steps: { subject: string; body: string; waitDays: number }[]; from_name?: string; from_email?: string; reply_to?: string; signature?: string; physical_address?: string }
interface Lead { id: string; email: string; first_name?: string; company?: string; status?: string; replied_at?: string }
interface Msg { id: string; lead_id: string; campaign_id: string; step: number; token?: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (!checkSecret(req)) return json({ error: 'Unauthorized' }, 401);

  const base = env('PUBLIC_FUNCTIONS_URL').replace(/\/$/, ''); // e.g. https://<ref>.functions.supabase.co
  const batch = Number(env('SEND_BATCH', false) || '40');
  const d = db();
  const nowIso = new Date().toISOString();

  try {
    const due = await d.select<Msg[]>('messages', `?status=eq.queued&scheduled_at=lte.${nowIso}&select=id,lead_id,campaign_id,step,token&order=scheduled_at.asc&limit=${batch}`);
    if (!due.length) return json({ ok: true, sent: 0, note: 'nothing due' });

    const unsub = await d.select<{ email: string }[]>('unsubscribes', '?select=email');
    const suppressed = new Set(unsub.map((u) => u.email.toLowerCase()));

    // Cache campaigns and leads referenced in this batch.
    const campaignIds = [...new Set(due.map((m) => m.campaign_id))];
    const leadIds = [...new Set(due.map((m) => m.lead_id))];
    const campaigns = await d.select<Campaign[]>('campaigns', `?id=in.(${campaignIds.join(',')})&select=*`);
    const leads = await d.select<Lead[]>('leads', `?id=in.(${leadIds.join(',')})&select=id,email,first_name,company,status,replied_at`);
    const cMap = new Map(campaigns.map((c) => [c.id, c]));
    const lMap = new Map(leads.map((l) => [l.id, l]));

    let sent = 0, skipped = 0, failed = 0;
    for (const m of due) {
      const c = cMap.get(m.campaign_id);
      const lead = lMap.get(m.lead_id);
      if (!c || !lead) { await d.update('messages', `?id=eq.${m.id}`, { status: 'failed' }); failed++; continue; }

      // Stop conditions: unsubscribed, replied, or lead marked done.
      if (suppressed.has(lead.email.toLowerCase()) || lead.replied_at || lead.status === 'unsubscribed') {
        await d.update('messages', `?id=eq.${m.id}`, { status: 'cancelled' });
        skipped++;
        continue;
      }

      const step = c.steps[m.step - 1];
      if (!step) { await d.update('messages', `?id=eq.${m.id}`, { status: 'failed' }); failed++; continue; }

      const tok = m.token || mkToken();
      const subject = merge(step.subject, lead);
      const bodyText = `${merge(step.body, lead)}\n\n${c.signature || ''}\n\n—\n${c.physical_address || ''}`;
      const unsubscribeUrl = `${base}/unsubscribe?m=${m.id}&t=${tok}`;
      const html = renderHtml(bodyText, base, m.id, tok);

      try {
        const providerId = await sendEmail({
          to: lead.email,
          from: c.from_email ? `${c.from_name || ''} <${c.from_email}>`.trim() : env('FROM_EMAIL'),
          replyTo: c.reply_to,
          subject,
          html,
          text: `${bodyText}\n\nUnsubscribe: ${unsubscribeUrl}`,
          unsubscribeUrl
        });
        await d.update('messages', `?id=eq.${m.id}`, { status: 'sent', sent_at: new Date().toISOString(), token: tok, subject, body: bodyText });
        await d.insert('events', [{ message_id: m.id, type: 'sent', meta: { provider_id: providerId } }], 'return=minimal');
        if (m.step === 1) await d.update('leads', `?id=eq.${lead.id}&status=eq.queued`, { status: 'contacted' });
        sent++;
      } catch (e) {
        await d.update('messages', `?id=eq.${m.id}`, { status: 'failed' });
        await d.insert('events', [{ message_id: m.id, type: 'error', meta: { error: e instanceof Error ? e.message : String(e) } }], 'return=minimal');
        failed++;
      }
    }
    return json({ ok: true, sent, skipped, failed, considered: due.length });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
