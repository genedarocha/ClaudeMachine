-- VoxPress Outreach — sending engine schema additions.
-- Run AFTER the base schema from the Outreach screen, in Supabase → SQL Editor.
-- Idempotent: safe to run more than once.

-- leads: track replies so the drip stops on reply
alter table leads add column if not exists replied_at timestamptz;

-- campaigns: fields the sender needs
alter table campaigns add column if not exists signature text;
alter table campaigns add column if not exists from_name text;
alter table campaigns add column if not exists from_email text;
alter table campaigns add column if not exists reply_to text;
alter table campaigns add column if not exists physical_address text;

-- messages: per-message token for public pixel/unsub links + a snapshot of what was sent
alter table messages add column if not exists token text;
alter table messages add column if not exists subject text;
alter table messages add column if not exists body text;

create index if not exists messages_due_idx on messages (status, scheduled_at);
create index if not exists messages_lead_idx on messages (lead_id);
create index if not exists events_message_idx on events (message_id);

-- The sending engine uses the service role key, so it bypasses RLS. No extra policies needed for it.
-- (The browser app still uses the anon key + the policies from the base schema.)

-- ---------------------------------------------------------------------------
-- Drip scheduler: call the send-due Edge Function every 5 minutes with pg_cron + pg_net.
-- Requires: enable "pg_cron" and "pg_net" under Database → Extensions.
-- Replace <PROJECT_REF> and <OUTREACH_SECRET> below with your real values, then run this block.
-- ---------------------------------------------------------------------------
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
--
-- select cron.schedule(
--   'outreach-send-due',
--   '*/5 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://<PROJECT_REF>.functions.supabase.co/send-due',
--     headers := jsonb_build_object('x-outreach-secret', '<OUTREACH_SECRET>', 'Content-Type', 'application/json'),
--     body := '{}'::jsonb
--   );
--   $$
-- );
--
-- To stop it later:  select cron.unschedule('outreach-send-due');
