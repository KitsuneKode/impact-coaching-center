# Launch status and audit, 27 Oct 2026

Branch `feat/launch` (draft PR #18), 167 commits ahead of `main`, pushed
through `92518f2`. Checked today on a production build against local Convex:
587 tests, typecheck, lint, format, `bun run smoke` (41 pages, both languages),
and a browser crawl of about 100 public and admin routes on desktop and phone
(no console errors, no 500s, one `h1` per page, no sideways scroll).

## 1. Where things stand

| Area                                                                                | Done                                                                                                                                                      | %       | Left                                                                        | Blocked on                     |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------- | ------------------------------ |
| Public site (home, courses, exams, results, teachers, library, blog, notes, reader) | All pages built in English and Assamese, light and dark, axe-clean                                                                                        | 90      | Native Assamese read; content gaps below                                    | ICT content                    |
| Trust and proof                                                                     | Merit-list PDF links, 10 video reviews, guest officers, teacher videos, proof line in the hero                                                            | 75      | Centre photos, topper photos, fuller teacher bios, consent to show students | ICT content, consent           |
| Lead capture                                                                        | Enquiry form (honeypot, Turnstile, per-number and per-network limits, duplicate window, fake-number check), WhatsApp and call taps counted, course finder | 95      | Turnstile keys on production                                                | Cloudflare account             |
| Admin                                                                               | Inbox, orders queue and order page, labels, shop, courses, notes, promotions, blog, calendar, people, settings, overview with sources and visits          | 90      | Real-phone pass by the desk                                                 | Owner's time                   |
| Books shop                                                                          | Bundles per language, cart, checkout, receipts, courier tracking, WhatsApp order messages                                                                 | 90      | Live Razorpay; until then it takes orders on WhatsApp automatically         | Razorpay KYC, GSTIN            |
| Sign-in                                                                             | WhatsApp code, abuse ceilings, account deletion                                                                                                           | 85      | Meta number, template approval, webhook                                     | New SIM, Meta Business         |
| SEO                                                                                 | Sitemap with hreflang, robots, canonical, JSON-LD (organisation, course, article, FAQ, breadcrumbs), llms.txt, IndexNow, share cards, verification tags   | 90      | Switch indexing on, Search Console, Google Business Profile                 | Domain                         |
| Production setup                                                                    | Documented step by step (`docs/production.md`)                                                                                                            | 20      | Convex production, Vercel project, env, R2, DNS                             | Hosting decision, ICT accounts |
| **Overall**                                                                         |                                                                                                                                                           | **≈85** |                                                                             |                                |

Everything that depends only on us is done or listed under "What I would
do next". What remains is ICT's accounts and content.

## 2. Blockers, in the order they stop launch

1. **Domain access** (registrar login): no DNS, no HTTPS, no indexing.
2. **Hosting decision**: Vercel Pro recommended (Hobby forbids commercial use
   and rate-limits deploys, which hit us on 13 Oct).
3. **WhatsApp sign-in**: new SIM, Meta Business, the authentication template.
   Without it the site still runs; logging in says "We can't send codes right
   now. Call or WhatsApp ICT" and the free notes stay behind log-in.
4. **Razorpay KYC and GSTIN**: without it every set orders on WhatsApp, so
   this no longer blocks launch.
5. **Book sets**: which 2–3 bundles, prices per language, covers.
6. **Policy pages approved**: four drafts with `{{proposed}}` facts (dispatch
   times, refund window, hours).

## 3. A parent's audit: can the site answer it in a minute?

| Question                | Answer on the site                                                | Gap                                                                  |
| ----------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| What does it cost?      | Fees on every course card and in the FAQ                          | None                                                                 |
| When are classes?       | Per batch, morning, noon, evening, night                          | Radiant 2.0 and Diamond 3.0 timings missing                          |
| Does it get results?    | APSC CCE 2022 list with serials, linked to the commission's PDF   | Only 2 verified officers; more results needed                        |
| Who teaches?            | Five teachers with a full class each on YouTube                   | Bios thin for two; no years of experience                            |
| Can I see the place?    | Photo wall in the hero, mock-test photo on results                | No "visit the centre" gallery: classrooms, library, building outside |
| Is it safe and serious? | Library mentioned; hostel "ask us"                                | Hours, rules, seats (the library questions)                          |
| What's free?            | "What's free" in the hero, free workshop, free notes, past papers | None                                                                 |
| How do I join?          | Free workshop on WhatsApp, enquiry form, call                     | Same-day reply promise not confirmed                                 |
| Where is it?            | Address, map link, contact page                                   | Opening hours not recorded anywhere                                  |

## 4. Principal-engineer audit

| Dimension             | Rating | Why                                                                                                                                                       |
| --------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Correctness and tests | 8.5/10 | 587 tests on real Convex (convex-test), money paths idempotent, every 22 Oct review finding closed or accepted with a reason                              |
| Architecture          | 8.5    | One Person record verified by WhatsApp (ADR-0001), orders only once paid (ADR-0005), server is the price authority, typed validators on all 133 functions |
| Security              | 8      | Auth routes allow-listed, OTP ceilings, Turnstile, CSP and security headers, no secrets in the browser, typed confirmations for destructive admin acts    |
| Performance           | 8      | Static pages with ISR, observed LCP about 180 ms locally; the Convex and auth client bundle is the main weight                                            |
| Scalability           | 8      | Bounded reads everywhere, counters instead of scans; comfortably beyond ICT's realistic traffic on Convex Starter                                         |
| Accessibility         | 8.5    | axe WCAG 2.2 AA clean in both themes, reduced motion respected, real labels                                                                               |
| Internationalisation  | 7.5    | Full Assamese; type fixed today (leading, measure, display face). Needs a native reader                                                                   |
| Design                | 8.5    | One Pulse system across site and admin; today's pass unified admin headers and form controls                                                              |
| Content               | 6      | The weakest area, and ICT's: photos, bios, results, hours                                                                                                 |
| Operations            | 6.5    | Runbooks written, but no production yet, no uptime alert, no error reporting service                                                                      |

### Edge cases handled

Payment captured after the buyer closed the tab (webhook settles; the page
waits and says "Don't pay again"). The same payment arriving twice. A cart
priced, then changed. Account deleted mid-order (refused while an order is
open). Guest cart from another account. A code requested from a script.
Unpaid legacy orders (migration). Payments off (WhatsApp ordering). No OTP
transport (log-in refused, pages fine). The placeholder phone number typed
into the form. Assamese headings on every page.

### Edge cases still open

- A refund made in the Razorpay dashboard: checked on 27 Oct, a full refund
  closes the order, so it leaves "To send" and cannot be shipped. Staff see
  it under Done; no WhatsApp alert (that needs another Meta template).
- Two staff moving the same order at once: revision checks refuse the second,
  but the message could name who moved it.
- Free notes when sign-in is down: still gated. Decide whether page one of
  every note is public (recommended for search and WhatsApp previews).

## 5. Who the visitors are, and what that means

North Lakhimpur and Lakhimpur district first, then Dhemaji and upper Assam.
Aspirants of 18–30 deciding with their parents, often on mid-range Android
phones on Jio or Airtel 4G, arriving from WhatsApp forwards, Facebook and
YouTube. Many read Assamese first. Traffic will be modest (hundreds of visits
a day) with spikes when APSC or ADRE notifications and results come out.

What the site already does for them: phone-first layouts, pages that work
static and fast on 4G, WhatsApp as the main way in, Assamese everywhere,
Latin digits that match ICT's posters, and no card details needed to start.

## 6. Where the business should focus

1. **Answer enquiries within the hour.** The overview ranks who to call
   first; speed of the first call converts more than any page change.
2. **Tag every link ICT shares** (`?utm_source=whatsapp`, `facebook`,
   `instagram`, `youtube`). The new "Website visits" panel then shows which
   channel brings people who enquire.
3. **Publish results as they come**, each linked to its source. The merit
   list is the strongest proof on the site.
4. **One post a week on the blog** around notifications and syllabi:
   that is what aspirants search for, and each post is shareable.
5. **Google Business Profile** with photos of the centre: most local
   search for "APSC coaching North Lakhimpur" will land there first.

## 7. Decisions recorded today

- **Held back:** better-auth 1.7 (the Convex adapter supports only 1.6) and
  TypeScript 7 (the native compiler is too new to adopt four days before
  launch). Everything else is on its latest version.
- **shadcn lint:** 0.2.3 is installed with `no-raw-colors`,
  `no-unknown-classes` and `require-static-classes` enforced. The three new
  rules flagged about 1,600 lines, mostly deliberate (grid templates, print
  sizes in millimetres, motion's style props). They are deferred until after
  launch rather than churned now.
- **Kobra components:** their pages now show Pro markers; nothing is
  installed from them without ICT's licence. Our button already has the
  press feel (scale on press, nudge on hover).
- **React review:** react-doctor scores 53/100 with no confirmed bugs; its
  two error-level effect findings were read and are false positives. The
  score is pulled down by large editor components and sequential awaits in
  static pages (they run only at build and revalidation): refactor after
  launch, not before.
- **Share cards:** generated for English posts; Assamese posts keep the
  photo card because next/og cannot shape Assamese script.

## 8. What I would do next

- Done 27 Oct: "Come and see the centre" on the home page (ICT's six centre
  photos, each playing its video, with directions and a call button), and the
  admin order page's next move pinned to the bottom on phones.
- Book set page: already deals its books out of one stack on wide screens and
  becomes a swipe carousel on phones; a full 3D ring needs four or more books.
- The reader's toolbar is English on Assamese pages: needs a strings option
  in kitsu-lab's component (about 60 strings), not a fork here.
- Uptime and error alerts once production exists.
