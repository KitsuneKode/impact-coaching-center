# Demo runbook

How to run the site and dashboard for a demo, how to sign in without WhatsApp,
and what to show. Everything runs against the Convex **dev** deployment
`peaceful-emu-861`, which is the only deployment allowed to print sign-in
codes (`lib/dev-deployment.ts`).

## Run it locally

Two terminals in the repo:

```sh
bun run dev        # the site, http://localhost:3000
bun run otp        # prints each sign-in code as it is sent
```

`bunx convex dev` is only needed while changing files under `convex/`; it
pushes them as you save. For a demo the deployment is already up to date.

The morning of a demo, refresh the sample data so dates read "3 hours ago",
not last week:

```sh
bun run seed:dev
```

This clears only the rows the seed made. Real sign-ups and enquiries stay.

## Sign in

1. Open `/login`, enter a number, press Continue.
2. The code appears in the `bun run otp` terminal:
   `+91 99999 00001  →  123456`.
   No terminal? Convex dashboard → `peaceful-emu-861` → Logs, search `[otp]`.
   This works on a phone too.
3. Enter the code. It submits on its own.

| Who     | Number     | Sees                                                |
| ------- | ---------- | --------------------------------------------------- |
| Owner   | 8134827648 | Everything, plus Export and People (roles)          |
| Staff   | 9999900001 | Enquiries, lead sheets, orders; no export or roles  |
| Student | any other  | Name, then three questions, then their account page |

A new number goes through the student path: name, three skippable questions,
account page. Staff and owners skip the questions.

## Without the laptop

The branch preview runs on Vercel against the same deployment:
`https://impact-coaching-center-git-feat-client-demo-3d5491-kitsunekode.vercel.app`

Vercel Deployment Protection asks visitors to log in. Before the demo, open
the deployment in the Vercel dashboard and use **Share** to make a link that
skips it. Test the whole script on your phone once, including reading a code
from the Convex dashboard Logs. Take the laptop anyway as the fallback.

## What to show (about 15 minutes)

1. **The site on a phone.** Home, a course page, success stories, contact.
2. **An enquiry.** Fill the form on the home page. Then open `/admin/leads` as
   owner: it is at the top, "just now".
3. **Working a lead.** Open it: Call and WhatsApp buttons, status, a
   follow-up date, a note. The "Follow-up due" view is tomorrow's call list.
4. **A student account.** Sign in with a new number: name, three questions,
   the account page, and account deletion (what the privacy policy promises).
5. **Orders.** `/admin/orders` with sample orders: the status flow staff use
   to pack and ship. Online ordering is the next phase.
6. **People.** The owner gives and removes staff access by number.
7. **Their homework.** `/privacy`, `/refunds`, `/shipping`: highlighted
   parts are theirs to fill. Hand over
   `docs/proposals/2026-09-26-what-we-need-from-ict.md`.
8. **Next phase, from Kitsu-Lab:** the promotions system and the book/PDF
   reader.
9. **Colours.** The switcher at the bottom: neither palette is final.

Say plainly: sign-in codes go to WhatsApp once the WhatsApp sender is set up;
online book payments are not live; the policy pages are drafts.

## If something goes wrong

- "We could not confirm receipt" on the enquiry form: `LEAD_INGEST_SECRET` is
  missing or differs between `.env.local` and Convex. They must match.
- Sign-in says "We could not sign you in just now": the site's address is
  missing from `SITE_URL` on the Convex deployment
  (`bunx convex env get SITE_URL`); add it comma-separated.
- No code appears: check `bun run otp` is running against `peaceful-emu-861`
  and `OTP_TRANSPORT=logger` and `DEV_DEPLOYMENT_NAME` are set there.
