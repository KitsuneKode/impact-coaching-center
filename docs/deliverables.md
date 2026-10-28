# ICT website: deliverables and handover

As of 27 Oct 2026. Branch `feat/launch`, PR #18. Everything that depends only
on us is built and checked; what remains is ICT's accounts and content, your
go-ahead, and manual testing (last section).

## 1. Where to see it

| Where                              | What works                                                  | How                                                                                                                                                                                                  |
| ---------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local production build             | Everything: shop, test payments, log-in, admin, sample data | `bunx convex dev` and `bunx next start -p 3010` in `.worktrees/launch`, open http://localhost:3010. Log-in codes appear in `scratchpad/convex-local.log` (or `bun run otp`). Owner number 8134827648 |
| Vercel preview of the PR           | Look, copy, layout, both languages                          | The newest "Preview" deployment on PR #18. Behind Vercel log-in; use **Share** in Vercel for a client link. No backend yet: shop, log-in, admin and sending enquiries do not work there              |
| Client walk-through with real data | Everything                                                  | Needs a Convex deployment set on Vercel's Preview environment (a new dev deployment recommended). Your decision                                                                                      |

## 2. Pages delivered

Every public page exists in English and Assamese (`/as/...`), in light and
dark mode, checked at 390, 820, 1280, 1440, 1920 and 2560 px wide.

### Public site (21 page types, 42 with Assamese)

| Page                                                   | What it does                                                                                                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home `/`                                               | Hero with the newest batch, proof links, the three exams, student videos, what's free, books, teachers, results, the centre, questions, enquiry form, join steps |
| Courses `/courses`                                     | Every course by exam, the course finder (4 questions), fees and timings                                                                                          |
| Course `/courses/[slug]`                               | Poster, fee, timing, what's included, teachers, videos, enquire or join                                                                                          |
| Exams `/exams`, `/exams/[slug]`                        | Each exam explained: pattern, syllabus, the batch for it                                                                                                         |
| Exam calendar `/exams/calendar`                        | Upcoming exam dates, managed in the admin                                                                                                                        |
| Books `/books`                                         | Book sets by exam, price per language                                                                                                                            |
| Book set `/books/[slug]`                               | The set, its books, sample pages, English or Assamese, add to cart (or order on WhatsApp)                                                                        |
| Free notes `/resources`, `/resources/[slug]`           | Folders of free PDFs; the reader with page progress and notes                                                                                                    |
| Results `/success-stories`                             | Officers from the official merit list, ICT-announced selections, 10 student videos, guest officers                                                               |
| Teachers `/teachers`                                   | Five teachers, subjects, exams, a full class each on YouTube                                                                                                     |
| Library `/library`                                     | The library (fees and hours shown once ICT confirms them)                                                                                                        |
| ASSIST `/assist`                                       | The scholarship test (details once ICT confirms them)                                                                                                            |
| Blog `/blog`, `/blog/[slug]`                           | Posts with contents rail, reading progress, share links, share cards                                                                                             |
| Contact `/contact`                                     | Address, map, phones, WhatsApp, directions                                                                                                                       |
| Policies `/privacy`, `/terms`, `/refunds`, `/shipping` | Drafts until ICT approves; kept out of Google until then                                                                                                         |
| Not found                                              | Any wrong address, in both languages                                                                                                                             |

### Buyer pages (English)

| Page                                                 | What it does                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Log in `/login`                                      | WhatsApp code to the mobile number; new people give their name                   |
| Checkout `/checkout`                                 | Delivery or collection, address, pay (Razorpay), confirmation and next steps     |
| Account `/account`                                   | Orders with a dated timeline and tracking, receipts, change name, delete account |
| Receipt `/account/receipt/[ref]`, `/receipt/[token]` | Printable receipt; the second is the WhatsApp link that opens without logging in |

### Admin (25 screens, phone and desktop)

| Screen                     | What it does                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| Overview                   | Today's work, who to call first, this week's numbers, where enquiries and visits come from                |
| Enquiries                  | Search, filters, bulk select, export (owner), the lead sheet with notes, follow-ups and calls             |
| Orders, order page, labels | Tabs by stage, bulk moves, ship with courier, cancel and refund, WhatsApp messages sent, printable labels |
| Shop                       | Book sets (price and availability per language), books, covers, sample pages                              |
| Courses                    | Classplus courses: which show, timings, start dates                                                       |
| Free notes                 | PDFs: upload, replace (old file restorable 30 days), publish                                              |
| Promotions                 | Bar, banner, pop-up and video reels, scheduled and aimed at pages, with views and clicks                  |
| Blog, Calendar             | Posts and exam dates                                                                                      |
| People, Settings           | Staff access by area (owner only); shipping charge, receipt details, order alerts number                  |

### Behind the pages

Search (Ctrl K), WhatsApp and call tap counting, website visits by source,
enquiry spam protection, sitemap, robots, llms.txt, IndexNow, Google
structured data, share cards, PostHog (off until a key is added), security
headers, rate limits, account deletion, 587 automated tests.

## 3. Done and left

### Done

| Area      | What                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Design    | Pulse theme everywhere, Blue-field hero, dark mode, both languages typeset properly                                                  |
| Trust     | Merit-list links, student videos, guest officers, teacher classes, centre photos with videos                                         |
| Leads     | Enquiry form, course finder, WhatsApp everywhere, spam and fake-number checks, source tracking                                       |
| Shop      | Bundles per language, cart, checkout, receipts, courier tracking, WhatsApp order messages, orders on WhatsApp while payments are off |
| Admin     | Every screen above, built for phones as much as desktop                                                                              |
| Quality   | Accessibility audit (WCAG 2.2 AA), backend review closed, packages current, production build and smoke test pass                     |
| SEO       | Everything except switching indexing on (needs the domain)                                                                           |
| Documents | `docs/production.md` (setup runbook), `docs/plans/2026-10-27-launch-status.md` (status and audit), this file                         |

### Left

| Item                                                                                                               | Who                        | Blocks launch?                                    |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------- | ------------------------------------------------- |
| Domain access, then DNS and HTTPS                                                                                  | ICT                        | Yes                                               |
| Hosting decision (Vercel Pro recommended)                                                                          | You                        | Yes                                               |
| Production Convex, Vercel project, env vars (`docs/production.md` steps)                                           | Us, after the two above    | Yes                                               |
| New SIM, Meta Business, WhatsApp template                                                                          | ICT                        | No: log-in says to call or WhatsApp ICT meanwhile |
| Razorpay KYC and GSTIN                                                                                             | ICT                        | No: sets order on WhatsApp meanwhile              |
| Book sets, photos, bios, facts (section 4)                                                                         | ICT                        | Partly: placeholders show until they arrive       |
| Policy pages approved                                                                                              | ICT                        | Yes, before taking payments                       |
| Native Assamese read                                                                                               | ICT or a reader they trust | No                                                |
| Manual testing (section 6)                                                                                         | You and ICT                | Yes                                               |
| Merge #18 into `main`, production deploy                                                                           | You give the go            | Yes                                               |
| After launch: uptime alerts, more lint rules, splitting the big admin editors, Assamese reader toolbar (kitsu-lab) | Us                         | No                                                |

## 4. What ICT needs to send

### Accounts and access

| Item                                                     | Why                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| Domain registrar log-in (or someone to add DNS records)  | Point the domain, HTTPS, Search Console by DNS              |
| Razorpay account: KYC, GSTIN, bank account               | Online payment; live keys and webhook                       |
| A new SIM for WhatsApp, and Meta Business Manager access | Log-in codes and order messages from ICT's own number       |
| Google Business Profile access (owner or manager)        | Map listing, photos, reviews                                |
| Staff mobile numbers and what each may do                | Admin access (enquiries and orders; shop, promotions, blog) |
| The desk phone for order alerts                          | Each paid order is sent there on WhatsApp                   |

### Photos and files

Send originals straight from the phone or camera (not WhatsApp-compressed:
share as a document or by Google Drive). Uploads take images up to 8 MB.

| What                          | How many                       | Shape and minimum size                                    | Notes                                                                                                                                         |
| ----------------------------- | ------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| The centre                    | 8–12                           | Portrait 9:16, 1080 × 1920; or landscape 4:3, 1600 × 1200 | Outside with the signboard, entrance, each classroom, digital room, library, mock-test hall. Daylight. Today's six are 405 × 720 video frames |
| Teacher portraits             | 1 per teacher (5)              | Portrait 3:4, 1200 × 1600                                 | Shoulders up, plain background, same light for all. Today's are 320–380 px crops from videos                                                  |
| Toppers and selected students | As many as consented           | Portrait 3:4, 1200 × 1600                                 | Each with name, post, exam, year, rank or serial, the official result link, a quote under 30 words, and written consent                       |
| Book covers                   | 1 per book per language        | 3:4, 1200 × 1600                                          | Flat front cover, straight on, no shadow or angle                                                                                             |
| Sample pages                  | Up to 12 per book per language | A4 (1 : 1.414), 1240 × 1754 or a PDF                      | Pages a student would want to see before buying                                                                                               |
| Free notes                    | 3–5 to start                   | PDF, up to 60 MB and 300 pages                            | Text PDFs, not photos of pages, where possible                                                                                                |
| Result and admission posters  | Any                            | Original resolution                                       | Each result claim must be checkable in an official list                                                                                       |
| Videos for reels              | 3–6                            | Vertical 9:16, 1080 × 1920                                | Short (under 60 seconds), YouTube Shorts links are fine                                                                                       |
| Logo                          | 1                              | SVG, or PNG 2000 px with a transparent background         | Today's PNG works; a vector is sharper                                                                                                        |
| Blog post covers (optional)   | Per post                       | 16:9, 1600 × 900                                          | Otherwise a title card is generated                                                                                                           |

### Facts and words

| Item                                                                                       | Where it shows                                 |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Book sets: which 2–3, the books in each, price per language, which languages are available | Books, set pages, checkout                     |
| Shipping charge, dispatch time, delivery days, collection hours, refund window             | Checkout, shipping and refund policies         |
| Legal name, grievance officer, support hours                                               | Policies, receipts                             |
| Centre opening hours                                                                       | Contact, Google                                |
| Library: included or separate fee, hours, seats, facilities, rules, outsiders allowed      | Library page (6 questions in `lib/library.ts`) |
| ASSIST: next date, who can sit it, fee, format, scholarship amounts                        | ASSIST page                                    |
| Timings for Radiant 2.0 and Diamond 3.0                                                    | Course pages                                   |
| Dhemaji centre: address, PIN, map pin, phone, opening date                                 | Contact, footer                                |
| Teacher bios: qualification, years teaching, subjects                                      | Teachers page                                  |
| Who answers enquiries, and whether "we reply the same day" is true                         | Join steps on every page                       |
| Spelling: Pallabi or Pallavi Neog                                                          | Teachers                                       |
| Is PRAGATI's "20+ selections" claim checkable?                                             | Course page                                    |
| Current Play Store link; Telegram channel if any                                           | Footer, app links                              |
| Consent to show students' names, photos and videos                                         | Results, reviews                               |
| Approval of the four policy pages                                                          | Before payments and indexing                   |

## 5. Decisions for you

1. Hosting: Vercel Pro (recommended) or another host.
2. A Convex backend for previews, so the client can click through the shop and admin.
3. Free notes: should page one of every note be public (better for Google and WhatsApp previews)?
4. The go-ahead to merge #18 and deploy once the accounts exist.

## 6. Manual test checklist

Do each on a real Android phone (Chrome) and a laptop. Note the page, what
you did and what happened.

**Visitor**

- [ ] Home loads fast on mobile data; hero, exam cards, videos, centre photos play
- [ ] Switch to Assamese and back; the choice is remembered on the next visit
- [ ] Courses: filter by exam, run the course finder, open a course, tap WhatsApp
- [ ] Send the enquiry form; it reaches the admin inbox; a wrong number is refused with a reason
- [ ] Free notes: log in, open a PDF, turn pages, leave and come back to the same page
- [ ] Blog: open a post, use the contents list, share it on WhatsApp and check the preview card
- [ ] Contact: Get directions opens Maps; Call opens the dialler
- [ ] Dark mode from the footer; text readable everywhere

**Buyer**

- [ ] Add a set in each language; change quantity; cart survives a reload
- [ ] Checkout with delivery: a PIN in Assam, the North East and elsewhere in India each shows its own charge; a non-Indian PIN is refused with a reason
- [ ] Pay (test card 4100 2800 0000 1007 or UPI `success@razorpay` in test mode); receipt and WhatsApp message arrive
- [ ] Close the payment window halfway; the cart is still there; pay again works
- [ ] Account: order timeline, tracking link once shipped, receipt prints to PDF
- [ ] Delete the account with the WhatsApp code (on a test number)

**Staff (admin, on a phone)**

- [ ] Log in with a staff number; owner-only screens are hidden
- [ ] Enquiries: search part of a number, filter, call and WhatsApp buttons, add a note, set a follow-up
- [ ] Orders: open a new order (it stops being "new"), mark shipped with a courier, the buyer gets the message
- [ ] Collection order: mark ready, then collected
- [ ] Cancel a paid order (owner): refund shows as due until Razorpay refunds it
- [ ] Print labels for several orders
- [ ] Shop: change a price, switch a language off, upload a cover and sample pages
- [ ] Free notes: upload a PDF, replace it, restore the old one
- [ ] Promotions: create a bar for one exam's pages, check it shows only there, pause it
- [ ] Settings: change the shipping charge; checkout shows the new charge

**Before going live**

- [ ] Lighthouse on the live address (mobile)
- [ ] Search Console: sitemap submitted, pages indexed in both languages
- [ ] Google Business Profile links to the site
