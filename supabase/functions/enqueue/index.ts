// enqueue — queues a campaign: one message row per eligible lead × step, scheduled by the step waitDays.
// Called from the app's "Launch campaign" button (with x-outreach-secret). Idempotent-ish: skips leads
// that already have messages for this campaign.
import { cors, json, db, checkSecret, token } from '../_shared/util.ts';

interface Step { subject: string; body: string; waitDays: number }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!checkSecret(req)) return json({ error: 'Unauthorized' }, 401);

  try {
    const { campaign_id } = await req.json();
    if (!campaign_id) return json({ error: 'campaign_id required' }, 400);
    const d = db();

    const [campaign] = await d.select<{ id: string; steps: Step[] }[]>('campaigns', `?id=eq.${campaign_id}&select=id,steps`);
    if (!campaign) return json({ error: 'Campaign not found' }, 404);
    const steps: Step[] = campaign.steps || [];
    if (!steps.length) return json({ error: 'Campaign has no steps' }, 400);

    const unsub = await d.select<{ email: string }[]>('unsubscribes', '?select=email');
    const suppressed = new Set(unsub.map((u) => u.email.toLowerCase()));

    // Leads not yet in this campaign and not suppressed.
    const existing = await d.select<{ lead_id: string }[]>('messages', `?campaign_id=eq.${campaign_id}&select=lead_id`);
    const already = new Set(existing.map((m) => m.lead_id));
    const leads = await d.select<{ id: string; email: string }[]>('leads', '?select=id,email&status=in.(new,queued)&limit=5000');

    const now = Date.now();
    const rows: unknown[] = [];
    let queued = 0;
    for (const lead of leads) {
      if (suppressed.has(lead.email.toLowerCase()) || already.has(lead.id)) continue;
      let offsetDays = 0;
      steps.forEach((step, i) => {
        offsetDays += i === 0 ? 0 : Math.max(0, step.waitDays || 0);
        rows.push({
          lead_id: lead.id,
          campaign_id,
          step: i + 1,
          status: 'queued',
          token: token(),
          scheduled_at: new Date(now + offsetDays * 86400000).toISOString()
        });
      });
      queued++;
    }
    if (rows.length) {
      for (let i = 0; i < rows.length; i += 500) await d.insert('messages', rows.slice(i, i + 500), 'return=minimal');
      await d.update('leads', `?status=eq.new`, { status: 'queued' });
    }
    return json({ ok: true, leads_queued: queued, messages_created: rows.length });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
