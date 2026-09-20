# ICT Growth Platform Design

**Date:** 17 September 2026  
**Status:** Draft for client and implementation review  
**Amended:** 18 September 2026 — phone-first identity, WhatsApp messaging, and the free-tier cost model (§10, §11)  
**Working commercial scope:** ₹37,500 launch package  
**Source requirements:** `Website Req.pdf`, current repository content, verified ICT public material, and the decisions recorded below

**Decisions confirmed with the maintainer, 19–20 September 2026:** Books use enabled/disabled availability with no inventory counts. Reader and checkout remain unavailable until phone verification works; there is no email OTP launch fallback. Production hosting remains undecided pending deployment comparison. Historical spike results below are candidate evidence, not production acceptance.

## Confirmed storefront scope — 20 September 2026

These decisions supersede conflicting launch assumptions in the historical detail
below. They are requirements, not claims of implemented functionality.

- Classplus remains the sole Course catalogue authority and handles course
  purchase and digital classrooms. Our site presents a published snapshot with
  automatic syncing and an owner-triggered Resync. Only local presentation and
  hide-from-website overrides belong here; never maintain a second course price.
- Supported Classplus API access is unconfirmed. Obtain ICT-account-specific
  integration documentation and approval before production use. The existing
  public-endpoint importer is not evidence of a supported API contract. Keep
  credentials server-side, fetch complete bounded datasets and publish validated
  snapshots atomically; failed syncs retain the last successful snapshot.
- The new site replaces the current main domain. Confirm an independent supported
  Classplus purchase/classroom destination before cutover; backend catalogue APIs
  do not solve checkout routing. No course account or payment mirroring is scoped.
- Books have no Classplus dependency. Our owner-managed catalogue is their only
  source of truth; our Orders use Razorpay. Availability is boolean, not inventory.
- Initial Book payments are online only, including collection at ICT. Cash,
  unpaid reservations and seller-created accounts are deferred for owner review,
  not approved features. Purchasing does not automatically imply marketing consent.
- Shipping and collection are supported design paths. Shipping must fail closed
  until confirmed PIN-code coverage, charges and dispatch rules are configured.
  "Most of Assam" is unverified and must not be advertised as guaranteed coverage.
  Collection instructions, hours and readiness expectations also need approval.
- Owner handles catalogue writes, resync, fulfilment, refunds, access changes and
  destructive actions. Staff start with backend-enforced read-only access to
  necessary operational fields; exports are not implicitly allowed. Changes and
  financial operations are auditable; payment and fulfilment are separate states.
- Reuse existing Base UI/shadcn controls and Razorpay checkout. Keep course sync,
  Book ordering and delivery rules focused; avoid speculative CRM, cash-counter,
  shared Course/Book cart or generic commerce framework work.

Execution dependencies are recorded in
`docs/plans/2026-09-19-person-foundation.md`. Classplus's public
[product information](https://classplusapp.com/new-web) describes its branded
website/course offering, but does not establish ICT's API entitlements. The
20 September research did not locate a verified public catalogue API contract;
this is an unresolved dependency, not evidence that no private API exists.

## 1. Purpose

Turn the existing Impact Career Tutorials pitch site into a production-ready admissions, resources, physical-book commerce, library-enrollment, and staff-operations platform.

The system must do four jobs well:

1. Help an Assam exam candidate quickly decide whether ICT is credible and relevant.
2. Convert interest into a traceable enquiry, resource unlock, book order, or library application.
3. Let ICT staff operate routine content, campaigns, leads, and orders without depending on the developer.
4. Give the developer a reusable, maintainable foundation for future education clients without turning ICT into a generic template.

The launch excludes public AI features. AI-assisted staff replies remain an independently priced follow-up.

## 2. Success criteria

The launch is successful when:

- A visitor can find the right course, understand the syllabus and price, verify ICT's proof, and enquire from any common mobile or desktop size.
- A visitor can verify their phone once and then unlock any free resource without repeating verification.
- A signed-in student can buy a physical book through a server-verified Razorpay flow and later find that order in their account.
- Staff and students sign in through one system, with roles enforced in Convex rather than in the client.
- A visitor can submit a library application without payment.
- Staff can manage leads, books, orders, resources, library applications, and promotions from a small authenticated dashboard.
- ICT can publish or schedule a factual campaign without a code deployment.
- Search engines can crawl unique, truthful pages with correct metadata, canonical URLs, sitemaps, and supported structured data.
- PostHog can report the course, resource, promotion, book, and library funnels without receiving personal information.
- Routine staff work requires no developer intervention after onboarding.

## 3. Commercial boundary

### Included in the ₹37,500 launch

- Premium responsive redesign using the current real content and visual foundation.
- Homepage, courses, course details, results/success stories, free resources, physical books, cart, checkout, library, contact, and required policy pages.
- Convex operational backend, phone-verified student and staff accounts on Better Auth, and a minimal role-protected admin.
- WhatsApp Business sender for verification codes, order-status messages, and staff replies inside the service window.
- Razorpay Standard Checkout for physical books, including order creation, signature verification, idempotent webhooks, and manual fulfilment status.
- Deployment on the host selected after comparison, R2 file delivery, domain connection, PostHog, and Search Console setup.
- Technical and local SEO foundations.
- Scheduled announcement, inline, and restrained popup campaigns.
- Initial population of the existing course catalogue, up to 20 books, and up to 30 resources from client-supplied material.
- Two admin accounts, one Razorpay merchant, one location, one language at launch, and flat/manual delivery rules.
- Testing, staff onboarding, a short operating guide, and 30 days of defect support.

### Separately priced

- Public or internal AI assistant.
- Assamese translation of the full site.
- Courier API integration, automatic labels, automatic refunds, GST invoicing, multiple warehouses, or complex coupon rules.
- A purchased digital-content library, LMS, attendance, test engine, or migration from Classplus.
- WhatsApp marketing broadcasts, opt-in list management, and campaign template approval.
- Ongoing copywriting, photography, backlink campaigns, daily social media, or guaranteed search positions.
- Bulk content entry beyond the launch allowances.

### Payment schedule

- 50% on acceptance.
- 30% after prototype and responsive-flow approval.
- 20% before production launch.

## 4. Users and their jobs

### Prospective student or parent

They arrive from Google, WhatsApp, YouTube, Instagram, or a shared course link. They need to assess credibility, compare the right programme, see real prices and schedules, and take a low-risk next step.

### Resource seeker

They need to find a relevant PDF quickly, understand what it contains, verify their phone once with explicit consent, and receive access immediately — and on every later visit without being asked again.

### Book buyer

They need to confirm the edition, contents, price, stock, delivery charge, and expected fulfilment before paying by UPI or card, and to find that order again later without contacting anyone.

### Library applicant

They need to understand plans, facilities, timings, rules, availability language, and how ICT will confirm enrollment.

### ICT staff member

They need to follow up leads, update mutable content, fulfil orders, review library applications, and run promotions from a phone or laptop without learning a complex CRM.

### Developer/maintainer

They need observable deployments, narrow modules, reversible releases, documented ownership, predictable vendor costs, and a clean separation between routine staff operations and technical maintenance.

## 5. Product information architecture

### Public routes

| Route                                         | Purpose                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/`                                           | Focused introduction, course discovery, proof, resources, books, library, and primary enquiry |
| `/courses`                                    | Compare current programmes by exam and mode                                                   |
| `/courses/[slug]`                             | Price, schedule, syllabus, inclusions, faculty, sample class, proof, and enquiry              |
| `/results`                                    | Evidence-tiered outcomes and student stories                                                  |
| `/resources`                                  | Search and filter free notes, current affairs, MCQs, and PYQs                                 |
| `/resources/[slug]`                           | Resource description and lead-gated access                                                    |
| `/books`                                      | Physical-book catalogue                                                                       |
| `/books/[slug]`                               | Edition, contents, price, stock, fulfilment, and add to cart                                  |
| `/cart`                                       | Persistent cart and totals                                                                    |
| `/checkout`                                   | Contact, address, delivery charge, summary, and Razorpay hand-off                             |
| `/order/[reference]`                          | Safe order result and fulfilment status                                                       |
| `/sign-in`                                    | Phone verification and sign-in for the Reader and checkout                                    |
| `/account`                                    | Own orders, unlocked resources, saved addresses, and profile                                  |
| `/library`                                    | Plans, facilities, rules, timings, and application                                            |
| `/contact`                                    | Phone, WhatsApp, Telegram, address, hours, and map                                            |
| `/privacy`, `/terms`, `/shipping`, `/refunds` | Required operational and payment policies                                                     |

Existing `/success-stories` links should redirect to the final results route or remain canonical if changing the URL would lose useful history.

### Admin routes

| Route               | Primary job                                                                            |
| ------------------- | -------------------------------------------------------------------------------------- |
| `/admin`            | Today's leads, overdue follow-ups, orders, low stock, applications, and campaigns      |
| `/admin/leads`      | Search, filter, assign, update status, add notes, set follow-up, call/WhatsApp, export |
| `/admin/courses`    | Update approved mutable course fields without replacing the Classplus sync blindly     |
| `/admin/resources`  | Upload file metadata, categories, visibility, and publish state                        |
| `/admin/books`      | Manage catalogue, stock, covers, price, and fulfilment details                         |
| `/admin/orders`     | Verify status and manage `Paid -> Packed -> Shipped -> Delivered`                      |
| `/admin/library`    | Review and process applications                                                        |
| `/admin/promotions` | Schedule and target campaign placements                                                |
| `/admin/users`      | Staff roles, student lookup, and audited phone-number changes                          |
| `/admin/settings`   | Contact details, delivery rules, staff roles, and safe site-level settings             |

## 6. Visual and interaction direction

The public site should feel like a serious Assamese academic institution expressed through a contemporary editorial system. It should retain the existing warm paper surface, graphite ink, ICT blue, restrained amber marker, real classroom imagery, and truth-first content.

Changes from the current pitch build:

- Increase first-screen authority through stronger scale, clearer hierarchy, and a single dominant course-discovery action.
- Shorten the homepage and move depth into dedicated routes.
- Reduce repeated two-tone ledes so the pattern stays distinctive.
- Use documentary proof, dated resources, real syllabus information, and verifiable results as the premium material.
- Give courses, resources, books, and the library distinct page rhythms while sharing tokens and controls.
- Keep promotions factual and quiet. No marquees, fake countdowns, auto-rotating carousels, or stacked popups.
- Verify layouts at 320 px, common phones, tablet portrait/landscape, laptop, and wide desktop.

Premium means clarity, evidence, and care. It does not mean decorative gradients, glass effects, excessive motion, or large generic dashboard cards.

## 7. Reuse strategy

Keep the existing Base UI-flavoured shadcn system, Tabler icons, Tailwind 4 tokens, and Motion dependency.

- Use official shadcn `dashboard-01` as a parts donor for the admin shell, metric rhythm, and responsive navigation.
- Add official shadcn primitives only as needed: Sidebar, Table, Field, Input, Select, Textarea, Dialog, Sheet/Drawer, Dropdown Menu, Alert Dialog, Empty, Skeleton, Pagination, and optionally Command.
- Add TanStack Table v9 when the first server-paginated Leads table is implemented.
- Add Recharts v3 only after a chart is defined that changes a staff decision. Every chart needs a numeric or table equivalent.
- Start lead management with tables/lists and explicit status controls. Defer Kanban and drag-and-drop.
- Build the cart, resource gate, and promotion renderers from existing primitives instead of importing ecommerce or popup frameworks.
- Use 21st.dev and Shoogle only to discover patterns. Every candidate must have a verified commercial licence, compatible dependencies, accessible behavior, and a reviewed source diff before adoption.

## 8. Architecture

### Runtime

- Next.js 16 App Router and React 19.
- Server Components by default; client components only around actual interaction.
- Production host undecided. Compare Cloudflare Workers via `@opennextjs/cloudflare` with a managed Node host using the same application and dynamic flows. The 19 September Cloudflare spike is preliminary evidence; see §11.
- Cloudflare R2 for PDFs and uploaded media.
- Convex Cloud for mutable operational records and realtime admin updates.
- Better Auth as a Convex component (`@convex-dev/better-auth`) with the Phone Number plugin, for both staff and student authentication. See §10.
- WhatsApp Business Cloud API, used directly rather than through a reseller, for verification codes and transactional messages.
- Cloudflare Turnstile for bot mitigation on every public form that can trigger a billed message.
- Razorpay Standard Checkout for physical-book payments.
- PostHog for product/conversion analytics; Search Console for organic search.

No Docker is required for this deployment. If Cloudflare compatibility later fails on a required Next.js feature, the fallback is a small managed Node deployment or AWS Lightsail, documented before launch. Raw EC2 is not the default because its maintenance burden conflicts with the low-touch operating goal.

**Next.js version floor.** `@opennextjs/cloudflare` declares `next: ">=15.5.24 <16 || >=16.3.3"`. Next.js 16.0 through 16.3.2 cannot be deployed to Workers through this adapter at all. The repository was moved from 16.2.6 to 16.3.5 for this reason. Any future Next.js upgrade must be checked against the adapter's peer range **before** it is applied.

**Incremental cache.** Prerendered pages are served from the incremental cache, not from static assets, so a cache override is mandatory. Two options:

| Override                          | Cost                          | Limitation                                                                                             |
| --------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `static-assets-incremental-cache` | No R2 or KV needed            | Read-only: no ISR, and it throws on the `composable` cache type, so Next.js `use cache` is unsupported |
| `r2-incremental-cache`            | R2, within the free allowance | Required if any route needs ISR or `use cache`                                                         |

Launch uses the static-assets override because the public site is prerendered. Introducing ISR or `use cache` anywhere means moving to the R2 override first; this is a deliberate decision, not a default.

**Local verification.** `wrangler dev` alone returns 404 for every prerendered dynamic route, because it does not populate the cache. Use `opennextjs-cloudflare preview`, which runs `populateCache` first.

### Ownership

Production Cloudflare, Convex, PostHog, Razorpay, Meta WhatsApp Business, Search Console, and domain accounts must be owned by ICT. The developer receives the minimum role required to operate them. Development and production environments remain separate.

## 9. Convex domain model

Every mutable table includes creation/update timestamps and the actor or source responsible for material changes.

### Core tables

- `persons`: one record per mobile number in E.164, which is the natural key — name, optional real email, `verifiedAt`, role (`student` / `staff` / `owner`), lead status (`new` / `contacted` / `interested` / `enrolled` / `lost`), assignee, next follow-up, source, campaign, interest Track, consent (granted flag, timestamp, wording version), and WhatsApp service-window expiry. There is no separate lead table: an unverified enquirer and a verified account holder are the same record, distinguished by `verifiedAt`. See ADR-0001. Better Auth's own credential, session, and verification tables belong to the component and are not written directly; a verified Better Auth identity attaches to the Person with the matching phone number.
- `addresses`: saved delivery addresses belonging to a Person.
- `messages`: outbound and inbound WhatsApp or email records — purpose, template, direction, related Person, provider message identifier, delivery status, error, and timestamps.
- `activities`: status transitions, notes, calls and WhatsApp handoffs against a Person, with the actor. Free text lives here, never on the Person record.
- `courses`: mutable public presentation layered over imported catalogue identifiers.
- `resources`: title, slug, category, Exam, subject, year, description, R2 key of the source document, publish state (`draft` / `processing` / `published`), and page count.
- `resourcePages`: resource, page number, R2 keys for each rendered width, and conversion state. Rasterization is per page so a failure resumes rather than restarting. See ADR-0003.
- `resourceAccesses`: resource, Person, consent, source, granted timestamp. Written once per Person per Resource, not per page view.
- `books`: slug, title, authors, edition, category, list price and selling price in paise, `active` flag, cover, contents, optional approved sample pages, and dimensions/weight if used for fulfilment. ICT does not want inventory management, so there are no stock counts and nothing is ever deleted — a book is enabled or disabled.
- `orders`: a human-readable reference such as `ICT-2609-0143`, owning Person, immutable customer/address snapshot, immutable totals, delivery method (`ship` or `pickup`), Razorpay identifiers, payment state, fulfilment state, courier name and tracking number.
- `orderItems`: order, book snapshot, quantity, unit price.
- `paymentEvents`: verified provider event ID, event type, processing result, timestamps; unique for idempotency.
- `libraryPlans`: name, term, price display if relevant, facilities, rules, active state.
- `libraryApplications`: applicant Person, plan, preferred start, status, notes, consent.
- `promotions`: content, placement, target routes, CTA, schedule, priority, dismissal rule, campaign ID, publish state.
- `siteSettings`: approved contact, social, delivery, and small operational values.

### Rules

- All public and admin writes validate on the server.
- Authentication never substitutes for role authorization in Convex functions. Better Auth establishes identity; every function still checks the role and record ownership itself.
- Every endpoint that can trigger a billed message is rate limited and Turnstile-protected, and fails closed.
- Queries are indexed, paginated, and scoped. Public pages never scan operational tables.
- Payment amounts, discounts, book availability, quantity limits and delivery charges are calculated or validated from server-owned data.
- Personal data never enters analytics events.
- PDFs and media live in R2; Convex stores metadata and access policy.
- Sensitive admin actions create audit/activity records.

At 1,000–2,000 monthly visitors, expected function usage is far below Convex's current free allowance. File egress is the likely early constraint, which R2 avoids. Review usage monthly and move to Starter before any hard free cap approaches 70–80%.

## 10. Identity, phone verification, and messaging

### Decision

Students and staff share one authentication system: Better Auth running as a Convex component (`@convex-dev/better-auth`) with the Phone Number plugin. The phone number is the identity anchor. Clerk is no longer part of the stack.

This reverses the earlier staff-only position. ICT sells physical books, so order history, reusable delivery addresses, and a phone number that provably belongs to the buyer are operational requirements rather than conveniences. Phone-first sign-in also matches how ICT's audience already identifies itself.

Clerk remains a capable product, but its phone and SMS OTP require a paid production plan whose monthly cost exceeds the entire Care maintenance fee, for a capability Better Auth provides on Convex at no platform cost. The Convex Better Auth component supports the Phone Number, Email OTP, Magic Link, Two Factor, Generic OAuth, Username, Anonymous, One Tap, and JWT plugins.

**Accepted risk: the component is pre-1.0 and lags upstream.** `@convex-dev/better-auth` 0.12.5 pins `better-auth` to `>=1.6.11 <1.7.0` while upstream Better Auth is already at 1.7.x, so the project pins `better-auth` at 1.6.33. When Better Auth ships features or security fixes in 1.7 and later, ICT waits for the component to catch up. This is acceptable for the cost saved, but it is a real maintenance obligation: the component and its pin must be reviewed on the same schedule as dependency updates in §21, and a security advisory against the pinned range is an escalation, not a routine upgrade.

### Account model

One domain `persons` table with a `role` field. Better Auth owns its internal account and session tables; those IDs are never domain Person IDs. Resolve a verified auth identity to the matching Person before checking role or ownership. There is no separate admin identity system.

| Role      | Capabilities                                                        |
| --------- | ------------------------------------------------------------------- |
| `student` | Own orders, own unlocked Resources, own profile and saved addresses |
| `staff`   | Leads, orders, applications, catalogue, resources, promotions       |
| `owner`   | Staff capabilities plus user roles and site settings                |

Roles are enforced inside Convex functions. A valid session proves identity only.

### Where authentication is required

| Flow                                                   | Requires account        |
| ------------------------------------------------------ | ----------------------- |
| Browsing, course pages, results, library info, contact | No                      |
| Course enquiry and lead forms                          | No                      |
| Library application                                    | No                      |
| Cart                                                   | No                      |
| Reading a free Resource                                | Yes                     |
| Checkout and order history                             | Yes                     |
| Admin                                                  | Yes, `staff` or `owner` |

Enquiries and library applications stay open because they are top-of-funnel and ICT's priority is more of them, not fewer better ones. Reading a Resource and checking out require a verified account.

Verification is per Person, not per action. Once someone verifies their mobile number, a durable 90-day sliding session makes every later Resource a single tap, so expected volume is roughly one OTP per new Person rather than one per Resource. Staff sessions are shorter, at 7 days, because they hold everyone else's data.

Gating the document does not gate the page. Resource detail pages remain server-rendered, indexable, and fully descriptive; only the Reader is behind the account.

### OTP mechanics

- Phone Number plugin configured with `otpLength: 6`, `expiresIn: 300`, `allowedAttempts: 5`.
- Await delivery acceptance so failures cannot be reported as successful sends. Do not use untracked background promises. A future durable outbox must define retries, expiry, invalidation after failure and truthful queued/delivered states before replacing this behavior.
- Client resend cooldown of at least 30 seconds.
- The code is never returned in a response and never written to a production log.

A development logger transport must be gated on deployment environment. The plugin stores the code even when `sendOTP` does nothing and raises no runtime warning, so a no-op transport reaching production is a silent authentication bypass.

**Known constraint: synthetic email addresses.** Better Auth's core requires a unique email, so `signUpOnVerification` must supply `getTempEmail` and students are created with a placeholder address. The consequences must be honored rather than hidden:

- Email is not a recovery channel. Account recovery is phone-only.
- A student who loses access to their number needs a staff-assisted number change. The admin must support it and record actor, previous number, new number, and reason.
- Placeholder addresses must never receive mail and must never appear in an export presented as contactable email.
- A real email is optional and collected at checkout, where it has a purpose.

### Delivery channel

WhatsApp Business Cloud API, used directly rather than through a reseller:

- Authentication template for OTP; approved language variants, English at minimum.
- Sender number: verify coexistence eligibility against ICT's own Meta Business account before requiring a new number. Meta's Coexistence feature, released in May 2025 and generally available since, allows one number to run the WhatsApp Business app and the Cloud API together while retaining chat history. It does not cover personal WhatsApp, and feature support varies, so this is a verification step rather than an assumption in either direction.
- Verification orchestrators such as Twilio Verify are rejected: their WhatsApp channel falls back to SMS for India, which reintroduces the DLT registration and deliverability problems this channel exists to avoid.

**Launch dependency, no email fallback.** Until the phone sender is approved and end-to-end verification works, Reader and checkout stay unavailable. Public discovery and enquiries remain usable. Email verification must never mark a phone verified or attach a session to a Person by an unverified supplied number. Confirmed by the maintainer on 19–20 September 2026.

### Cost and abuse controls

Every OTP is a billed message, so rate limiting here is a cost control, not only an abuse control.

- Cloudflare Turnstile is verified server-side before any send, not after.
- Convex rate limiting per phone number, per IP, and a global daily send ceiling that fails closed with a truthful message.
- Repeated failed verification locks the number for a cooling period and records the event.
- Send outcomes are recorded with provider message identifier and delivery status, so staff can distinguish "never received" from "entered incorrectly".

### Transactional and staff messaging

Launch scope for the WhatsApp sender:

| Message                           | Category                  | Trigger                   |
| --------------------------------- | ------------------------- | ------------------------- |
| Sign-in verification code         | Authentication template   | Student requests an OTP   |
| Order confirmed, packed, shipped  | Utility template          | Staff advances fulfilment |
| Library application received      | Utility template          | Application submitted     |
| Staff reply to a lead or customer | Free-form, service window | Staff action in the admin |

Free-form staff replies are free and permitted only inside the 24-hour service window opened when the student messages ICT first. The admin must display the remaining window truthfully and disable free-form sending once it closes, rather than failing silently or silently sending a billable template instead.

Marketing broadcasts are out of scope at launch. They cost roughly six times a utility message and require explicit opt-in records, separate template approval, and honored opt-outs. They are a separately priced campaign add-on.

### Consent, opt-out, and retention

- Verification consent and messaging consent are recorded separately, each with timestamp, wording version, and source.
- Every WhatsApp thread supports opt-out. An opt-out immediately suppresses all non-authentication messages.
- Staff conversation bodies are operational records. They never enter analytics and are covered by the retention policy in §25.

### Verified behavior

A spike on 19 September 2026 ran the full flow against a local Convex deployment and confirmed:

- `send-otp` accepts a number, the transport receives the phone number and code, `verify` succeeds, the user is created with `phoneNumberVerified: true`, a session is issued, and an authenticated Convex query returns that user. An anonymous request returns no user.
- The synthetic-email constraint is real, not theoretical. The created user carried `email: "+919876543210@spike.invalid"`, `name` set to the phone number, and `emailVerified: false`. Phone-only recovery is therefore a committed consequence.

It also found one trap that the documentation does not lead with:

**`authComponent.getAuthUser()` throws `ConvexError: Unauthenticated` for anonymous visitors.** It does not return null. A public page that calls it renders a 500 for every signed-out visitor. Public surfaces must use `safeGetAuthUser` instead, and `getAuthUser` belongs only behind an already-authenticated boundary. This applies to the marketing site, resource detail pages, book pages, and the cart — every surface an anonymous visitor can reach.

### Testing strategy

Three layers, only the last of which costs money:

1. **Logger transport.** `sendOTP` writes to the Convex development log. Free, offline, and exercises identical plugin behavior for expiry, attempt limits, and rate limiting. This covers most of the build.
2. **Meta test number.** Cloud API provisions a test WhatsApp Business account and test business number that sends free template messages to up to five verified recipients with no payment method on file. Used to verify template rendering, the copy-code button, language variants, and real delivery latency to Assam numbers.
3. **Live sender smoke test.** After verification and display-name approval, a small number of real messages confirm production template approval and the sender name students will see.

Automated tests exercise the installed phone plugin and its real OTP verifier with in-memory delivery capture, a memory auth adapter and a Convex test database. Cover canonical identity, names, expiry, attempt exhaustion, replay, prohibited phone changes and callback failure without sending messages. Do not override `verifyOTP` to bypass the security behavior being tested.

## 11. Vendor cost model and free-tier boundaries

The platform runs on free tiers wherever a free tier genuinely covers production use. The residual cost must be small, predictable, and billed directly to ICT.

| Service                        | Free allowance                                        | Expected cost at launch            |
| ------------------------------ | ----------------------------------------------------- | ---------------------------------- |
| Convex                         | 1M function calls, 0.5 GB database, 1 GB egress/month | None                               |
| Cloudflare R2                  | 10 GB storage, 10M reads, free egress                 | None                               |
| PostHog                        | 1M events, 5,000 replays/month                        | None                               |
| Cloudflare Turnstile           | Unlimited                                             | None                               |
| Better Auth on Convex          | No platform fee                                       | None                               |
| Transactional email (fallback) | Approximately 3,000 messages/month                    | None                               |
| GitHub Actions                 | Free tier minutes                                     | None                               |
| Cloudflare Workers             | 100k requests/day, 10 ms CPU per request              | Possibly none at launch; see below |
| WhatsApp Cloud API             | Service-window replies free                           | Per delivered template message     |
| Razorpay                       | No monthly fee                                        | Percentage per order plus GST      |
| Domain                         | None                                                  | Annual registration                |

Two honest exclusions from "free":

**Hosting may or may not be free, and we do not yet know which.** Workers Free permits 100,000 requests per day but caps CPU at 10 ms per request. Bundle size is not the constraint: Cloudflare raised the worker size limit to 64 MiB on all plans in September 2026, and the spike measured this application at 26 MiB uncompressed.

The open question is CPU. The 19 September spike could not measure it, because the local runtime reports `cpu_time_ms` as zero on every request. It is also not yet a live question: every route in the application today is static or SSG, so the worker performs almost no rendering work. CPU pressure begins only when the dynamic routes arrive — sign-in, account, checkout, admin, and the Better Auth handler.

This must be measured on a real preview deployment as soon as the first dynamic route exists, and the result recorded here. Until then, treat Workers Paid at roughly $5 per month as a budgeted contingency rather than a confirmed cost, and do not present either figure to the client as settled.

Vercel's Hobby tier is not an alternative because its terms prohibit commercial use.

**OTP delivery is not free.** Meta withdrew the free monthly conversation allowance; authentication and utility templates are billed per delivered message. At roughly one OTP per new student the expected spend is small, but it is metered and must be rate limited.

Per-message rates must be verified against Meta's official rate card before they appear in any client-facing quotation. Reseller pricing pages are not an acceptable source for a commercial commitment.

### Review triggers

- Convex: move to Starter before any hard free cap reaches 70–80%, per the research in §26.
- PostHog: reduce replay sampling before the 5,000 recording allowance is reached.
- WhatsApp: alert the owner when monthly message spend exceeds an agreed ceiling.
- R2: review before stored objects pass 8 GB.

Infrastructure and usage fees are billed to ICT directly. The maintenance fee in §20 pays for developer work and availability; it must not become a pass-through for vendor costs.

## 12. Lead and CRM workflow

The pipeline is deliberately small:

`New -> Contacted -> Interested -> Enrolled` or `Lost`.

The Leads screen defaults to actionable work: new leads and overdue follow-ups. Staff can:

- Filter by status, course, source, assignee, campaign, and date.
- Call, reply on WhatsApp from the admin while the service window is open, or send an approved template once it has closed.
- Add a note and next follow-up date.
- Change status with a reason where useful.
- Export the filtered dataset to CSV.

The system should not reproduce HubSpot. There are no custom pipeline builders, email sequences, complex automations, or drag-and-drop board in the first release.

## 13. Resource gate

Resource discovery must remain useful before the gate. Search and filters expose title, category, exam, subject, year, type, size, and updated date.

Unlock flow:

1. Visitor selects a Resource. The detail page is public, indexable, and describes the document fully before anything is asked of them.
2. If the visitor already has a session, the Reader opens immediately. This is the common case after the first unlock.
3. Otherwise a focused dialog explains that ICT asks for a verified mobile number once, and what it will and will not be used for.
4. Name and mobile are required. Turnstile is verified server-side, then an OTP is sent over WhatsApp.
5. Consent is explicit and stored with its wording version.
6. On verification, Convex creates or matches the Person by phone number and records the resource access.
7. The Reader opens on the rendered pages, served from R2 through short-lived, controlled URLs. The source document is never handed to the browser.
8. PostHog receives only the resource and campaign identifiers.

Rate limiting, bot mitigation, safe filenames, upload validation, and access logging are required.

Verification happens once per Person, not once per Resource, so the expected volume is roughly one OTP per new Person. Per ADR-0003 there is no download: the client's requirement is that documents not be directly downloadable, and the Reader is how that is honoured. Serving images does not make a Resource private — anything rendered can be screenshotted — and the site must never claim otherwise.

## 14. Physical-book commerce

### Cart

- Persistent on the device without requiring customer login.
- Only enabled books can be ordered. Quantity must be a positive bounded integer; agree the per-order business limit before commerce implementation. There are no stock counts, reservations or decrements.
- Prices are display hints until recalculated by the server at checkout.
- Desktop may use a quick cart sheet; the durable cart and checkout use full routes.

### Checkout

1. The student signs in, then confirms name, mobile, optional real email, and a structured Indian delivery address, which may be saved for reuse.
2. Show delivery method/charge, item totals, and final amount before payment.
3. Server rechecks each book's enabled state, quantity limits and delivery rules, then creates an immutable pending order. A book disabled after cart creation cannot start a new payment. Late verified payments for existing orders need explicit reconciliation, never silent rejection.
4. Server creates a Razorpay order using the server-calculated amount.
5. Client opens Razorpay Standard Checkout.
6. Client callback may show a processing state but cannot mark the order paid.
7. Server verifies the checkout signature and processes signed, idempotent Razorpay webhooks.
8. The order becomes paid only from verified server evidence.
9. Staff manually moves fulfilment through Packed, Shipped, and Delivered and may add courier/tracking information.

Abandoned-order expiry, cancellation, refund ownership, delivery coverage, inability-to-fulfil handling and customer notifications must be agreed before live payments. Staff disable unavailable books; the site never implies inventory guarantees.

## 15. Library workflow

The library page presents real facilities, timings, rules, plans, and a qualified availability statement. It does not display invented seat counts.

An application records applicant details, plan interest, preferred start, study/exam interest, source, and consent. Staff reviews applications through `New -> Contacted -> Approved/Waitlisted/Declined`. Payment is outside the first release.

## 16. Promotion system

One data model supports three renderers:

- Announcement bar for concise site-wide information.
- Inline campaign panel where the offer is contextually relevant.
- Restrained dialog or bottom sheet for important timed campaigns.

Each promotion includes title, message, optional approved asset, CTA, target routes, start/end, priority, placement, campaign ID, dismissal rule, and publish state.

Behavior rules:

- Only one intrusive campaign may be active for a visitor at a time.
- Popups appear after meaningful engagement, never immediately on arrival.
- Dismissal is easy, stored, and respected.
- No popup appears during checkout or competes with the mobile action bar.
- Each placement emits safe impression/click events.
- Urgency must use a real published date. Do not show remaining-stock claims when quantities are not tracked.

## 17. Analytics

PostHog is the launch analytics system. Search Console owns organic-query and indexing evidence. GA4 is deferred until Google Ads or a Google-native reporting requirement exists.

Initial events:

- `cta_clicked`
- `lead_form_started`
- `lead_submitted`
- `sign_in_started`
- `otp_requested`
- `phone_verified`
- `resource_gate_viewed`
- `resource_unlocked`
- `book_viewed`
- `cart_item_added`
- `checkout_started`
- `payment_result`
- `library_enrollment_submitted`
- `promotion_viewed`
- `promotion_clicked`
- `whatsapp_handoff`

Events use stable snake_case names and enumerated safe properties. Names, phone numbers, emails, addresses, payment payloads, form text, staff notes, verification codes, and message bodies are prohibited.

Create four funnels: course enquiry, resource unlock, book purchase, and promotion conversion. Give the owner one small dashboard; keep identifiable work in the admin.

Session replay starts sampled and consent-aware. Mask lead, checkout, library, sign-in, OTP entry, and admin surfaces. Exclude staff, localhost, and preview deployments.

## 18. SEO and local discovery

No contract or UI may guarantee a first position for “best APSC coaching centre in Assam.” Google states local results depend mainly on relevance, distance, and prominence.

### Launch work

- Resolve domain, TLS, canonical production URL, robots, and sitemap.
- Verify Search Console and submit the sitemap.
- Create unique titles, descriptions, headings, and share images for every indexable route.
- Add truthful Organization, LocalBusiness, Course, Product, Offer, Breadcrumb, and applicable FAQ structured data.
- Validate structured data with Google's supported tools.
- Preserve server-rendered, crawlable course/resource/book content.
- Keep resource detail pages fully indexable even though the Reader requires an account; gate the document, never the page.
- Establish internal links between exam hubs, courses, resources, books, faculty, results, and contact.
- Optimize Core Web Vitals, images, fonts, and low-bandwidth behavior.
- Verify and complete the Google Business Profile with consistent name, address, phone, categories, hours, services, photographs, and website.
- Create a compliant review-request workflow after real student interactions.

### Content clusters

- APSC coaching in Assam and North Lakhimpur.
- APSC syllabus, fees, preparation, test series, and current affairs.
- ADRE, Assam Police, banking, SSC, and railway preparation.
- Dated PYQs, MCQs, notes, and current-affairs resources.
- Course-specific syllabi, schedules, faculty, and answers.
- Physical books with unique descriptions, editions, and availability.

Results and testimonials must carry internal evidence and consent. Unsupported “best,” “No. 1,” guaranteed selection, aggregate results, or institutional affiliations are prohibited.

## 19. Owner experience and low-touch operation

The admin should behave like an operations inbox, not a developer tool.

- Dashboard begins with what needs attention today.
- Mutations provide explicit success/failure feedback and recovery guidance.
- Mobile layouts become task-focused lists instead of squeezed desktop tables.
- Forms use plain language and sensible defaults.
- Staff can preview public content before publishing.
- Destructive actions require confirmation and create audit records.
- The onboarding session uses real tasks: publish a banner, add a book, upload a resource, follow up a lead, and fulfil an order.
- A short owner guide documents those five workflows plus how to request support.

## 20. Agency operating model

The build should become a reference account and reusable education-platform foundation without compromising ICT's identity or data.

### Developer responsibilities during build

- Maintain the delivery backlog, scope decisions, and evidence log.
- Provide weekly working software or a reviewable increment.
- Record client approvals for claims, pricing, policies, and payment behavior.
- Keep vendor accounts client-owned and credentials out of source control.
- Train staff and measure whether they can complete routine tasks unaided.

### Client responsibilities

- Supply and approve factual copy, results evidence, consented portraits, book data, PDFs, library rules, policies, delivery charges, and contact ownership.
- Complete Razorpay KYC and vendor account verification.
- Name the staff member responsible for leads, fulfilment, and content.
- Respond to approval requests within agreed review windows.

### Change control

- Defects against the approved specification are fixed without additional charge during the support window.
- New workflows, integrations, bulk content, or changed business rules receive a written estimate.
- Small requests consume included maintenance time; unused monthly time does not accumulate unless the contract says otherwise.

### Maintenance offers

**Care — ₹2,500/month or ₹25,000/year**

- Monitoring, dependency/security updates, backup/export checks, payment/form health, monthly analytics summary, and up to two hours of content/campaign changes.

**Growth — ₹5,000/month or ₹50,000/year**

- Care plus monthly SEO/PostHog review, Google Business Profile work, up to two content/landing-page improvements, campaign setup, and up to five hours of changes.

Infrastructure and usage fees are paid directly by ICT. Monthly reporting should connect work to enquiries, resource unlocks, orders, and organic visibility rather than listing technical activity.

### Referral posture

After the first measurable win, request a testimonial and two introductions. Build a private case study using approved before/after evidence: site availability, indexed pages, lead response workflow, conversion baseline, and operational time saved. Never expose personal student or sales data.

## 21. Security, privacy, and reliability

- Enforce least-privilege roles inside Convex authorization checks. A session proves identity and never implies a permission.
- Never log or return an OTP. Any development OTP transport must be gated on deployment environment, because the plugin stores a code even when delivery does nothing.
- Rate limit and Turnstile-protect every endpoint that can trigger a billed message, and fail closed with a truthful message.
- Record staff-assisted phone-number changes with actor, previous number, new number, and reason.
- Validate and rate-limit public mutations.
- Keep secrets server-only and rotate them during ownership transfer.
- Verify Razorpay signatures against the raw required material and deduplicate webhooks.
- Never store card or UPI credentials.
- Minimize collected personal data and document its purpose, access, retention, export, and deletion process.
- Mask sensitive analytics/replay surfaces.
- Maintain tested Convex data export and R2 object inventory procedures. Scheduled backups are not available on the free plan, so run `convex export` on a schedule into R2 and rehearse a restore rather than assuming one works.
- Add structured logs around payment, lead, resource, and admin failures without logging sensitive fields.
- Provide truthful empty, pending, retry, failure, and reconciliation states.

## 22. Performance and accessibility

- Render stable catalogue and marketing content statically or with controlled revalidation.
- Avoid querying Convex for data already present in the rendered page.
- Use indexed, paginated queries and debounced search.
- Serve media through optimized formats and sizes; lazy-load below-fold imagery.
- Keep essential pages usable on slow connections and with images unavailable.
- Meet keyboard, focus, semantic HTML, labels, error association, contrast, zoom, and reduced-motion requirements.
- Keep touch targets at least 44 CSS pixels where practical.
- Test checkout, dialogs, tables/lists, menus, and forms across mobile, tablet, and desktop.

## 23. Delivery stages

1. Production foundations: environment model, Cloudflare compatibility spike, Convex and Better Auth setup, R2 policy, schemas, rate limiting, Turnstile, backups, and shared UI primitives.
2. Public information architecture and premium visual refinement.
3. Identity and messaging: phone sign-in, roles, local logger and test-number OTP transports, and the message log. Reader/checkout remain unavailable until real phone verification passes. Measure dynamic-route performance on hosting candidates and record the comparison in §11 before selecting production hosting.
4. Lead CRM and conversion instrumentation, including staff replies inside the WhatsApp service window.
5. Resource library, upload workflow, consent gate, account gate, and R2 delivery.
6. Physical books, cart, checkout, Razorpay verification, and order fulfilment.
7. Library page, applications, and staff processing.
8. Promotions, owner dashboard, and operational exports.
9. SEO, structured data, Search Console, Google Business Profile handoff, accessibility, performance, and responsive qualification.
10. Staff onboarding, documentation, production launch, and 30-day defect support.

Each stage must end in a reviewable, testable state. Live payments, indexability, and production data are separate launch gates.

## 24. Acceptance gates

Before production launch:

- Client has approved all visible claims, prices, results, policies, schedules, contacts, and book/library information.
- `bun run check` and `bun run build` pass.
- Critical public and admin flows pass keyboard and mobile testing.
- Razorpay Test Mode passes success, failure, abandonment, duplicate webhook, delayed webhook, and amount-tampering scenarios.
- Live keys are installed only after KYC and Test Mode approval.
- Lead, resource, order, and library records appear correctly in Convex/admin, each linked to the right user.
- Phone verification succeeds end to end on the live WhatsApp sender, and cooldowns, attempt limits, rate limits, and the daily send ceiling behave as specified.
- No OTP appears in any production log or response, and the development OTP transport cannot run in production.
- A staff-assisted phone-number change works and is audited.
- A Convex export has been restored successfully at least once.
- Worker CPU per dynamic route has been measured on a real deployment, and the Workers plan decision in §11 is settled on evidence rather than assumption.
- Public pages render correctly for signed-out visitors, confirming no surface calls `getAuthUser` where `safeGetAuthUser` is required.
- Staff complete the five onboarding tasks without developer intervention.
- PostHog events and funnels contain no personal information; replay masks are verified.
- Search Console, sitemap, canonical URL, robots, and supported structured data are validated.
- Backup/export and rollback steps are recorded.
- Production accounts, billing ownership, maintenance scope, and incident contacts are documented.

## 25. Required client inputs

- Confirmation of the official business name, spelling, address, hours, phone/WhatsApp, Telegram, and responsible staff.
- Google Business Profile ownership or authorization to create/repair it.
- Approved course catalogue, schedules, syllabi, fulfilment links, and Classplus ownership rules.
- Result evidence, participant relationship, portrait consent, and quote approval.
- Physical-book catalogue: covers, edition, authors, ISBN if available, contents, price, enabled/disabled availability, per-order quantity limit, weight/dimensions, delivery coverage, and fulfilment owner.
- Shipping charge rules, dispatch promise, cancellation/refund policy, and support contact.
- Resource PDFs, categories, update dates, authorship/review ownership, and lead-consent wording.
- Library plans, capacity language, facilities, timings, rules, review owner, and follow-up promise.
- Razorpay account/KYC, settlement owner, refund owner, and reconciliation process.
- The WhatsApp sender number, and confirmation of whether it can run under Meta Coexistence alongside ICT's existing WhatsApp Business app or must be a new number.
- Meta business verification documents, the approved display name, and approved template wording and languages.
- Approved consent wording for phone verification and for operational messages.
- The named staff member responsible for audited phone-number changes.
- Privacy/terms approval and data-retention choices, including how long message history is kept.

## 26. Research references

- Platform and cost findings: `docs/research/posthog-convex-platform-research.md`.
- Component, registry, licensing, and success-story findings: `docs/research/component-and-design-research.md`.
- Existing content/source verification and launch gaps: `docs/CHECKPOINT.md` and `docs/PITCH.md`.
- Compatibility spike, 19 September 2026: Next.js version floor for the Cloudflare adapter, incremental-cache trade-off, and the end-to-end Better Auth phone flow. Findings are recorded inline in §8, §10, and §11; the spike code was throwaway and has been deleted.
- Identity, messaging, and free-tier cost decisions are recorded in §10 and §11 of this document. Per-message WhatsApp rates cited during design came from reseller pricing pages and must be verified against Meta's official rate card before any client-facing use.
