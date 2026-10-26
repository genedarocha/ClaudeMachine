# Outreach

Cold-email / sales-outreach cockpit inside Claude Machine. Leads live in **your own Supabase project**;
the browser talks to it directly over Supabase's REST API with your anon key.

## What this screen does (real, now)
- Connect your Supabase project (URL + anon key, stored in your browser).
- Import leads from **CSV** into a `leads` table, with column mapping, email validation, de-duplication,
  and automatic skipping of anyone on the suppression list.
- Write AI **multi-step follow-up sequences** (up to 5 steps, humanized, merge fields `{{first_name}}`,
  `{{company}}`), with the required unsubscribe line + physical address appended automatically.
- Maintain an **unsubscribe / suppression** list; suppressed people are never exported.
- **Export a send-ready CSV** (one row per lead × step) for a sending platform.

## What a browser CANNOT do (needs a sending provider + server)
- **Send email**, **track opens/clicks**, run **automated drip retries**, host **unsubscribe/pixel pages**.
  These require SMTP/an email API plus hosted endpoints and a scheduler. No web page can do them, and an
  email-send key must never sit in a browser. This tool never marks anything "sent" or "opened" that wasn't.

## How to actually send
1. **A sending platform (recommended):** import the exported CSV into Instantly, Smartlead, Lemlist or
   Mailchimp. They do the sending, open/click tracking, follow-up scheduling and unsubscribe links, and
   protect deliverability.
2. **Your own server:** SendGrid/Resend/SES + Supabase Edge Functions, using the `messages`/`events`
   tables plus a tracking-pixel and unsubscribe endpoint. That's a separate backend; ask Claude Code to
   scaffold it.

## Setup
1. Create a free project at supabase.com.
2. Supabase → SQL Editor → run the schema SQL from the Outreach screen ("Copy SQL").
3. Project Settings → API → copy the URL and the **anon** key into the Outreach screen → Connect.

## Security & legal
- The anon key lives in the browser and is public. Keep the project private; RLS is enabled by the schema.
- These are other people's personal data. Follow GDPR / CAN-SPAM: lawful basis to contact, real opt-out,
  honour unsubscribes immediately, include your physical address, warm up your sending domain.
