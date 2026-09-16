# ICT Growth Platform Design

**Date:** 17 September 2026  
**Status:** Draft for client and implementation review  
**Working commercial scope:** ₹39,500 launch package  
**Source requirements:** `Website Req.pdf`, current repository content, verified ICT public material, and the decisions recorded below

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
- A visitor can unlock a free resource after submitting a minimal consented lead form.
- A visitor can buy a physical book through a server-verified Razorpay flow.
- A visitor can submit a library application without payment.
- Staff can manage leads, books, orders, resources, library applications, and promotions from a small authenticated dashboard.
- ICT can publish or schedule a factual campaign without a code deployment.
- Search engines can crawl unique, truthful pages with correct metadata, canonical URLs, sitemaps, and supported structured data.
- PostHog can report the course, resource, promotion, book, and library funnels without receiving personal information.
- Routine staff work requires no developer intervention after onboarding.

## 3. Commercial boundary

### Included in the ₹39,500 launch

- Premium responsive redesign using the current real content and visual foundation.
- Homepage, courses, course details, results/success stories, free resources, physical books, cart, checkout, library, contact, and required policy pages.
- Convex operational backend and a minimal Clerk-protected admin.
- Razorpay Standard Checkout for physical books, including order creation, signature verification, idempotent webhooks, and manual fulfilment status.
- Cloudflare deployment, R2 file delivery, domain connection, PostHog, and Search Console setup.
- Technical and local SEO foundations.
- Scheduled announcement, inline, and restrained popup campaigns.
- Initial population of the existing course catalogue, up to 20 books, and up to 30 resources from client-supplied material.
- Two admin accounts, one Razorpay merchant, one location, one language at launch, and flat/manual delivery rules.
- Testing, staff onboarding, a short operating guide, and 30 days of defect support.

### Separately priced

- Public or internal AI assistant.
- Assamese translation of the full site.
- Courier API integration, automatic labels, automatic refunds, GST invoicing, multiple warehouses, or complex coupon rules.
- A student login, purchased digital content library, LMS, attendance, test engine, or migration from Classplus.
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

They need to find a relevant PDF quickly, understand what it contains, share minimal contact details with consent, and receive access immediately.

### Book buyer

They need to confirm the edition, contents, price, stock, delivery charge, and expected fulfilment before paying by UPI or card.

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
- Cloudflare Workers paid plan as the preferred production host, after a compatibility spike using Cloudflare's current recommended Next.js path.
- Cloudflare R2 for PDFs and uploaded media.
- Convex Cloud for mutable operational records and realtime admin updates.
- Clerk for admin authentication.
- Razorpay Standard Checkout for physical-book payments.
- PostHog for product/conversion analytics; Search Console for organic search.

No Docker is required for this deployment. If Cloudflare compatibility fails on a required Next.js feature, the fallback is a small managed Node deployment or AWS Lightsail, documented before launch. Raw EC2 is not the default because its maintenance burden conflicts with the low-touch operating goal.

### Ownership

Production Cloudflare, Convex, Clerk, PostHog, Razorpay, Search Console, and domain accounts must be owned by ICT. The developer receives the minimum role required to operate them. Development and production environments remain separate.

## 9. Convex domain model

Every mutable table includes creation/update timestamps and the actor or source responsible for material changes.

### Core tables

- `admins`: authenticated identity, role, display name, active state.
- `leads`: contact details, interest, source, campaign, status, assignee, next follow-up, consent.
- `leadActivities`: status transitions, notes, calls/WhatsApp handoffs, and actor.
- `courses`: mutable public presentation layered over imported catalogue identifiers.
- `resources`: title, slug, category, exam, subject, year, description, R2 object key, file metadata, publish state.
- `resourceAccesses`: resource, lead/contact reference, consent, source, granted timestamp.
- `books`: slug, title, authors, edition, category, price in paise, stock, cover, contents, dimensions/weight if used for fulfilment.
- `orders`: internal reference, customer/address, immutable totals, Razorpay identifiers, payment state, fulfilment state, tracking.
- `orderItems`: order, book snapshot, quantity, unit price.
- `paymentEvents`: verified provider event ID, event type, processing result, timestamps; unique for idempotency.
- `libraryPlans`: name, term, price display if relevant, facilities, rules, active state.
- `libraryApplications`: applicant, plan, preferred start, status, notes, consent.
- `promotions`: content, placement, target routes, CTA, schedule, priority, dismissal rule, campaign ID, publish state.
- `siteSettings`: approved contact, social, delivery, and small operational values.

### Rules

- All public and admin writes validate on the server.
- Authentication never substitutes for role authorization in Convex functions.
- Queries are indexed, paginated, and scoped. Public pages never scan operational tables.
- Payment amounts, discounts, stock, and delivery charges are calculated from server-owned data.
- Personal data never enters analytics events.
- PDFs and media live in R2; Convex stores metadata and access policy.
- Sensitive admin actions create audit/activity records.

At 1,000–2,000 monthly visitors, expected function usage is far below Convex's current free allowance. File egress is the likely early constraint, which R2 avoids. Review usage monthly and move to Starter before any hard free cap approaches 70–80%.

## 10. Lead and CRM workflow

The pipeline is deliberately small:

`New -> Contacted -> Interested -> Enrolled` or `Lost`.

The Leads screen defaults to actionable work: new leads and overdue follow-ups. Staff can:

- Filter by status, course, source, assignee, campaign, and date.
- Call or open a prefilled WhatsApp message.
- Add a note and next follow-up date.
- Change status with a reason where useful.
- Export the filtered dataset to CSV.

The system should not reproduce HubSpot. There are no custom pipeline builders, email sequences, complex automations, or drag-and-drop board in the first release.

## 11. Resource gate

Resource discovery must remain useful before the gate. Search and filters expose title, category, exam, subject, year, type, size, and updated date.

Unlock flow:

1. Visitor selects a resource.
2. A focused dialog explains the resource and why ICT requests contact information.
3. Name and mobile are required; email is optional unless the client proves email delivery is necessary.
4. Consent is explicit and stored.
5. Convex records the lead/resource access.
6. Access is granted immediately through a short-lived or controlled R2 delivery path.
7. PostHog receives only the resource and campaign identifiers.

Rate limiting, bot mitigation, safe filenames, upload validation, and access logging are required. The site must never claim a PDF is private after providing a bearer download URL.

## 12. Physical-book commerce

### Cart

- Persistent on the device without requiring customer login.
- Quantity cannot exceed current stock.
- Prices are display hints until recalculated by the server at checkout.
- Desktop may use a quick cart sheet; the durable cart and checkout use full routes.

### Checkout

1. Collect name, mobile, email, and structured Indian delivery address.
2. Show delivery method/charge, item totals, and final amount before payment.
3. Server validates stock and creates an immutable pending order.
4. Server creates a Razorpay order using the server-calculated amount.
5. Client opens Razorpay Standard Checkout.
6. Client callback may show a processing state but cannot mark the order paid.
7. Server verifies the checkout signature and processes signed, idempotent Razorpay webhooks.
8. The order becomes paid only from verified server evidence.
9. Staff manually moves fulfilment through Packed, Shipped, and Delivered and may add courier/tracking information.

Stock decrement behavior, abandoned-order expiry, cancellation, refund ownership, delivery coverage, and customer notifications must be agreed before live payments.

## 13. Library workflow

The library page presents real facilities, timings, rules, plans, and a qualified availability statement. It does not display invented seat counts.

An application records applicant details, plan interest, preferred start, study/exam interest, source, and consent. Staff reviews applications through `New -> Contacted -> Approved/Waitlisted/Declined`. Payment is outside the first release.

## 14. Promotion system

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
- Urgency must use a real published date or stock fact.

## 15. Analytics

PostHog is the launch analytics system. Search Console owns organic-query and indexing evidence. GA4 is deferred until Google Ads or a Google-native reporting requirement exists.

Initial events:

- `cta_clicked`
- `lead_form_started`
- `lead_submitted`
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

Events use stable snake_case names and enumerated safe properties. Names, phone numbers, emails, addresses, payment payloads, form text, and staff notes are prohibited.

Create four funnels: course enquiry, resource unlock, book purchase, and promotion conversion. Give the owner one small dashboard; keep identifiable work in the admin.

Session replay starts sampled and consent-aware. Mask lead, checkout, library, login, and admin surfaces. Exclude staff, localhost, and preview deployments.

## 16. SEO and local discovery

No contract or UI may guarantee a first position for “best APSC coaching centre in Assam.” Google states local results depend mainly on relevance, distance, and prominence.

### Launch work

- Resolve domain, TLS, canonical production URL, robots, and sitemap.
- Verify Search Console and submit the sitemap.
- Create unique titles, descriptions, headings, and share images for every indexable route.
- Add truthful Organization, LocalBusiness, Course, Product, Offer, Breadcrumb, and applicable FAQ structured data.
- Validate structured data with Google's supported tools.
- Preserve server-rendered, crawlable course/resource/book content.
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

## 17. Owner experience and low-touch operation

The admin should behave like an operations inbox, not a developer tool.

- Dashboard begins with what needs attention today.
- Mutations provide explicit success/failure feedback and recovery guidance.
- Mobile layouts become task-focused lists instead of squeezed desktop tables.
- Forms use plain language and sensible defaults.
- Staff can preview public content before publishing.
- Destructive actions require confirmation and create audit records.
- The onboarding session uses real tasks: publish a banner, add a book, upload a resource, follow up a lead, and fulfil an order.
- A short owner guide documents those five workflows plus how to request support.

## 18. Agency operating model

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

## 19. Security, privacy, and reliability

- Use least-privilege Clerk roles and Convex authorization checks.
- Validate and rate-limit public mutations.
- Keep secrets server-only and rotate them during ownership transfer.
- Verify Razorpay signatures against the raw required material and deduplicate webhooks.
- Never store card or UPI credentials.
- Minimize collected personal data and document its purpose, access, retention, export, and deletion process.
- Mask sensitive analytics/replay surfaces.
- Maintain tested Convex data export and R2 object inventory procedures.
- Add structured logs around payment, lead, resource, and admin failures without logging sensitive fields.
- Provide truthful empty, pending, retry, failure, and reconciliation states.

## 20. Performance and accessibility

- Render stable catalogue and marketing content statically or with controlled revalidation.
- Avoid querying Convex for data already present in the rendered page.
- Use indexed, paginated queries and debounced search.
- Serve media through optimized formats and sizes; lazy-load below-fold imagery.
- Keep essential pages usable on slow connections and with images unavailable.
- Meet keyboard, focus, semantic HTML, labels, error association, contrast, zoom, and reduced-motion requirements.
- Keep touch targets at least 44 CSS pixels where practical.
- Test checkout, dialogs, tables/lists, menus, and forms across mobile, tablet, and desktop.

## 21. Delivery stages

1. Production foundations: environment model, Cloudflare compatibility spike, Convex/Clerk setup, R2 policy, schemas, and shared UI primitives.
2. Public information architecture and premium visual refinement.
3. Lead CRM and conversion instrumentation.
4. Resource library, upload workflow, consent gate, and R2 delivery.
5. Physical books, cart, checkout, Razorpay verification, and order fulfilment.
6. Library page, applications, and staff processing.
7. Promotions, owner dashboard, and operational exports.
8. SEO, structured data, Search Console, Google Business Profile handoff, accessibility, performance, and responsive qualification.
9. Staff onboarding, documentation, production launch, and 30-day defect support.

Each stage must end in a reviewable, testable state. Live payments, indexability, and production data are separate launch gates.

## 22. Acceptance gates

Before production launch:

- Client has approved all visible claims, prices, results, policies, schedules, contacts, and book/library information.
- `bun run check` and `bun run build` pass.
- Critical public and admin flows pass keyboard and mobile testing.
- Razorpay Test Mode passes success, failure, abandonment, duplicate webhook, delayed webhook, and amount-tampering scenarios.
- Live keys are installed only after KYC and Test Mode approval.
- Lead, resource, order, and library records appear correctly in Convex/admin.
- Staff complete the five onboarding tasks without developer intervention.
- PostHog events and funnels contain no personal information; replay masks are verified.
- Search Console, sitemap, canonical URL, robots, and supported structured data are validated.
- Backup/export and rollback steps are recorded.
- Production accounts, billing ownership, maintenance scope, and incident contacts are documented.

## 23. Required client inputs

- Confirmation of the official business name, spelling, address, hours, phone/WhatsApp, Telegram, and responsible staff.
- Google Business Profile ownership or authorization to create/repair it.
- Approved course catalogue, schedules, syllabi, fulfilment links, and Classplus ownership rules.
- Result evidence, participant relationship, portrait consent, and quote approval.
- Physical-book catalogue: covers, edition, authors, ISBN if available, contents, price, stock, weight/dimensions, delivery coverage, and fulfilment owner.
- Shipping charge rules, dispatch promise, cancellation/refund policy, and support contact.
- Resource PDFs, categories, update dates, authorship/review ownership, and lead-consent wording.
- Library plans, capacity language, facilities, timings, rules, review owner, and follow-up promise.
- Razorpay account/KYC, settlement owner, refund owner, and reconciliation process.
- Privacy/terms approval and data-retention choices.

## 24. Research references

- Platform and cost findings: `docs/research/posthog-convex-platform-research.md`.
- Component, registry, licensing, and success-story findings: `docs/research/component-and-design-research.md`.
- Existing content/source verification and launch gaps: `docs/CHECKPOINT.md` and `docs/PITCH.md`.
