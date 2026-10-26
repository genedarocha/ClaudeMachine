# Startup Outreach — runbook

A step-by-step guide to getting the Outreach sending engine running and sending your first real campaign.
Pairs with [OUTREACH.md](OUTREACH.md) (the cockpit), [OUTREACH_SENDING_ENGINE.md](OUTREACH_SENDING_ENGINE.md)
(deploy details) and [outreach-test/warm-up-schedule.md](outreach-test/warm-up-schedule.md) (the ramp).

## One-time setup (~20–30 min)

1. **Supabase project** — create one at supabase.com (free).
2. **Base schema** — Outreach screen → "Copy SQL" → Supabase → SQL Editor → run it.
3. **Sending engine schema** — run `supabase/migrations/0001_outreach_sending.sql` in the SQL Editor.
4. **Resend account** — resend.com → verify a **dedicated sending subdomain** (e.g. `mail.voxstar.com`)
   with **SPF, DKIM and DMARC**. Create an API key.
5. **Deploy the functions** (Supabase CLI):
   ```
   npm i -g supabase && supabase login
   supabase link --project-ref <your-ref>
   supabase secrets set \
     SUPABASE_URL=https://<ref>.supabase.co \
     SUPABASE_SERVICE_ROLE_KEY=<service_role key> \
     RESEND_API_KEY=<resend key> \
     FROM_EMAIL="Gene Da Rocha <gene@mail.voxstar.com>" \
     PUBLIC_FUNCTIONS_URL=https://<ref>.functions.supabase.co \
     OUTREACH_SECRET=<a long random string>
   supabase functions deploy enqueue
   supabase functions deploy send-due
   supabase functions deploy track
   supabase functions deploy unsubscribe
   supabase functions deploy inbound
   ```
6. **Drip schedule** — enable `pg_cron` + `pg_net` extensions, then run the cron block at the bottom of
   the migration (fills `<PROJECT_REF>` and `<OUTREACH_SECRET>`). It calls `send-due` every 5 minutes.
7. **Reply handling (optional)** — point Resend's inbound/reply webhook at
   `https://<ref>.functions.supabase.co/inbound` with header `x-outreach-secret: <your secret>`.

## First end-to-end test (use your own inbox)

1. **Connect** — Outreach screen → paste your Supabase URL + anon key → Connect.
2. **Test leads** — Leads tab → **Download a 3-row test CSV** → change all three emails to your own
   address (Gmail `you+test1@gmail.com`, `+test2`, `+test3` all reach one inbox) → import.
3. **Sequence** — Sequence tab → **Load sample sequence** → set your **From email** (the verified sender).
4. **Launch** — Send tab → Option 2 → paste your functions URL + `OUTREACH_SECRET` → Save → **Launch campaign**.
5. **Trigger a send now** (instead of waiting for cron):
   ```
   curl -X POST https://<ref>.functions.supabase.co/send-due -H "x-outreach-secret: <secret>"
   ```
6. **Check the round-trip:** the email arrives → open it (logs an **open**) → click a link (**click**) →
   click unsubscribe (lands on the opt-out page and suppresses you). Watch the Send-tab stat tiles update
   (Sent / Opened / Clicked / Replied / Queued).

If all of that works on your own address, the engine is good to go.

## Going live with real prospects

1. Build your list (CSV) — verify the emails first to keep bounces low.
2. Import → write/adjust the sequence → set From email → Launch.
3. **Follow the warm-up ramp:** week 1 ~5–10 new leads/day, up to ~50/day by week 4, per mailbox.
4. Watch the stats: bounces < 2–3%, opens ~30–60%, stop and fix if unsubscribes/complaints climb.
5. Replies pause that person's follow-ups automatically — reply to them personally and move the deal forward.

## Legal / deliverability (not optional)
- Only email people you have a lawful basis to contact (GDPR legitimate interest / consent; CAN-SPAM).
- Send from a dedicated subdomain with SPF/DKIM/DMARC; warm it up slowly.
- The unsubscribe link and your physical address go out on every email, and opt-outs are honoured
  immediately — the engine does this. Targeting, consent and ramp speed are on you.
- Keep volumes modest and the copy human; the humanizer and the 2–3 touch cap help.

## The money point
Outreach brings conversations; the offer closes them. Lead with a concrete pilot (e.g. AlbionLM early
access, an AIToolboard listing, a paid audit), one clear ask per email, and a real reply-to you watch.
