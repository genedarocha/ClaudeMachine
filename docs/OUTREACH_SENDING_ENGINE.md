# Outreach sending engine — deploy guide

This is the backend that makes Outreach send end-to-end: it **sends** email, **tracks opens/clicks**,
runs the **follow-up drip**, handles **unsubscribes**, and **stops on reply**. It runs as Supabase Edge
Functions (in `supabase/functions/`) on your own Supabase project, sending through **Resend**.

> I wrote and syntax-checked this code but could not deploy or live-test it against your Supabase (that
> needs your login). Deploy it, send a test to yourself first, then launch for real.

## What's in `supabase/`
- `functions/enqueue` — queues a campaign (one message per lead × step, scheduled by waitDays). Protected by `x-outreach-secret`.
- `functions/send-due` — the drip worker. Sends due messages, injects tracking + unsubscribe, stops on reply/unsubscribe. Run on a 5-min cron.
- `functions/track` — public pixel + click redirect (logs opens/clicks).
- `functions/unsubscribe` — public opt-out page + RFC 8058 one-click; cancels the lead's queued messages.
- `functions/inbound` — reply webhook; marks the lead replied and stops their follow-ups.
- `migrations/0001_outreach_sending.sql` — extra columns, indexes, and the cron schedule.

## Prerequisites
1. A Supabase project with the **base Outreach schema** already run (from the Outreach screen).
2. A **Resend** account (resend.com) with a **verified sending domain** and an API key.
3. The Supabase CLI: `npm i -g supabase`, then `supabase login`.

## Steps
1. **Run the migration:** Supabase → SQL Editor → paste `supabase/migrations/0001_outreach_sending.sql` → run.
2. **Link the project:** `supabase link --project-ref <your-ref>` (run from the repo root).
3. **Set function secrets** (server-side env, never in the browser):
   ```
   supabase secrets set \
     SUPABASE_URL=https://<ref>.supabase.co \
     SUPABASE_SERVICE_ROLE_KEY=<service_role key from Project Settings → API> \
     RESEND_API_KEY=<your Resend key> \
     FROM_EMAIL="Gene Da Rocha <gene@voxstar.com>" \
     PUBLIC_FUNCTIONS_URL=https://<ref>.functions.supabase.co \
     OUTREACH_SECRET=<a long random string you choose>
   ```
4. **Deploy the functions:**
   ```
   supabase functions deploy enqueue
   supabase functions deploy send-due
   supabase functions deploy track
   supabase functions deploy unsubscribe
   supabase functions deploy inbound
   ```
   (`track` and `unsubscribe` are public; `config.toml` already sets `verify_jwt = false` for all five, since the write ones use the secret instead.)
5. **Turn on the drip schedule:** in the SQL editor, enable the `pg_cron` and `pg_net` extensions, then run the cron block at the bottom of the migration with your `<PROJECT_REF>` and `<OUTREACH_SECRET>` filled in. It calls `send-due` every 5 minutes.
6. **Reply handling (optional but recommended):** point Resend's inbound/reply webhook at
   `https://<ref>.functions.supabase.co/inbound` and add header `x-outreach-secret: <your secret>`, so replies stop the follow-ups.

## Connect the app
In the Outreach screen → **Send** tab → Option 2: paste
`https://<ref>.functions.supabase.co` and your `OUTREACH_SECRET`, save, set the **From email**, then
**Launch campaign**. The stats tiles (Sent / Opened / Clicked / Replied / Queued) read live from your DB.

## Test before launching for real
1. Add one lead that's your own address. Write a short sequence. Launch.
2. Trigger a send now instead of waiting for cron:
   `curl -X POST https://<ref>.functions.supabase.co/send-due -H "x-outreach-secret: <secret>"`
3. Check the email arrives, open it (should log an "opened"), click a link (a "clicked"), and click
   unsubscribe (you should land on the opt-out page and be suppressed).

## Deliverability & legal (don't skip)
- **Warm up** a dedicated sending domain/subdomain; don't blast from day one.
- Set up **SPF, DKIM and DMARC** in Resend for your domain.
- Keep volumes low at first (tens/day) and ramp slowly.
- Only email people you have a **lawful basis** to contact (GDPR legitimate interest / consent; CAN-SPAM).
- The unsubscribe link and your physical address go out on every email automatically. Honour opt-outs
  immediately (the engine does this for you).
