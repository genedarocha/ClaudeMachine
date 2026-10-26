# Cold-email warm-up schedule (4 weeks)

Sending too much too soon from a new domain lands you in spam and can get the domain blocklisted. Ramp
slowly and watch the numbers. Use a **dedicated subdomain** (e.g. `mail.voxstar.com` or `go.voxstar.com`),
not your main domain, so your primary email reputation is protected.

## Before you send anything
- Set up **SPF, DKIM and DMARC** for the sending domain in Resend.
- Put a real reply-to you monitor, a real physical address, and a working unsubscribe (the engine does this).
- Have a lawful basis for every contact (GDPR legitimate interest / consent; CAN-SPAM).

## The ramp (new domain)
| Week | New leads/day (step-1 emails) | Notes |
|---|---|---|
| 1 | 5–10 | Mostly warm/known contacts first. Reply to a few of your own test sends to build positive signals. |
| 2 | 10–20 | Only increase if opens look healthy and bounces are near zero. |
| 3 | 20–35 | Keep follow-ups on (they count toward volume). |
| 4 | 35–50 | ~50/day is a sensible ceiling per sending mailbox on a free plan. |

After week 4, add a **second sending mailbox/domain** rather than pushing one mailbox past ~50/day.

## Watch these (Send tab stats)
- **Bounces/failed:** should be < 2–3%. If higher, your list is stale — clean it (verify emails) before continuing.
- **Opens:** healthy is ~30–60% for good B2B lists. Very low opens = spam folder; slow down and check DKIM/DMARC.
- **Unsubscribes/spam complaints:** if these climb, your targeting or copy is off. Stop and fix.
- **Replies:** the goal. Pause sequences on reply (the engine does this automatically).

## Follow-up cadence (what the sample sequence uses)
- Step 1: day 0
- Step 2 (follow-up): 3 days later, only if no reply
- Optional step 3: 4 more days later, only if no reply
Keep it to 2–3 touches. More than that annoys people and hurts your domain.

## Deliverability hygiene
- One clear ask per email; no links in step 1 if you can avoid it (links lower inbox rates early on).
- Avoid spammy words and ALL CAPS and lots of images.
- Verify your list (e.g. a bulk email-verification tool) before a big send to cut bounces.
