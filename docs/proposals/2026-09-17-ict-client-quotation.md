# Proposal and quotation

## Impact Career Tutorials digital admissions and commerce platform

**Prepared:** 17 September 2026  
**Project investment:** **₹37,500**  
**Estimated delivery:** 6–8 weeks from receipt of approved content, account access, and advance payment

## The proposed outcome

This project will turn the current website into a premium, mobile-first platform that helps prospective students understand ICT's programmes, trust the institute, contact the right team, access free study material, buy physical books, and apply for library membership.

ICT staff will receive a focused admin dashboard for daily work. They will be able to manage enquiries, catalogue content, books and orders, library applications, study resources, and time-bound promotional campaigns without asking a developer for every routine update.

## Included in the project

### Public website and conversion experience

- Premium responsive redesign for mobile, tablet, laptop, and large screens.
- Homepage, course listing and course detail pages, results and success stories, faculty and institute information, free resources, physical books, cart, checkout, library, contact, and required policy pages.
- Clear calls to action for enquiries, calls, WhatsApp, resource access, book purchases, and library applications.
- Fast loading, accessible navigation, forms, keyboard support, readable content, and low-bandwidth mobile use.
- Factual content structure based on the approved requirement document and client-supplied material.

### Enquiries and staff operations

- Enquiry forms with course and source tracking.
- Lead stages, staff assignment, notes, follow-up dates, search, filters, WhatsApp/call shortcuts, and CSV export.
- Duplicate-enquiry handling and an activity history for important changes.
- Mobile-friendly admin dashboard with role-protected access.

### WhatsApp messaging included at launch

- Verification codes so a student proves their mobile number once and is recognised on every later visit.
- Order updates as ICT moves a book from confirmed to packed, shipped, or ready for pickup.
- Library application acknowledgements.
- Staff replies sent from the dashboard while a student's 24-hour reply window is open, so follow-up history stays with the enquiry instead of on a personal phone.

Marketing broadcasts and an automated shared inbox are not included at launch; they are listed separately below. Meta charges ICT directly for each message it sends, currently a small fraction of a rupee for these message types; the exact rate is confirmed against Meta's own rate card during onboarding.

### Free resources

- Searchable catalogue of approved notes, current affairs, MCQs, and previous-year questions.
- Studied in a fast in-browser reader rather than handed over as a file, so material is not passed around as a public link. Anything on screen can still be photographed; no system prevents that.
- One-time mobile verification over WhatsApp before first access, with name, consent, and interest captured. Returning students go straight to the reader.
- Staff upload and publish material from the admin dashboard; files are served from Cloudflare R2.

### Physical-book selling

- Book catalogue and details, cart, address collection, delivery or centre pickup, order summary, and Razorpay Standard Checkout.
- Books are enabled or disabled rather than stock-counted; no inventory management is included.
- Server-side price validation, verified payment callbacks, duplicate-payment protection, and order records.
- Staff workflow for paid, packing, shipped, delivered, cancelled, and refunded statuses.
- Customer-facing success, pending, failed, and retry states.

Courier procurement, packaging, dispatch, returns handling, and payment-provider charges remain ICT's operational responsibility.

### Library applications

- Library facilities, rules, timings, plans, and application flow using approved details.
- Admin review and status management for submitted applications.
- Online library payment is excluded from this phase and can be added after ICT confirms the operational process.

### Promotion system

- Admin-controlled announcement bar, inline campaign cards, and one non-intrusive modal placement.
- Route targeting, start and end dates, priority, call to action, draft/published state, and visitor dismissal rules.
- Campaign-level analytics for impressions, clicks, enquiries, and resulting orders where attribution is available.
- No fake countdowns, misleading urgency, or overlapping popups.

### Search visibility and analytics foundation

- Unique page metadata, canonical URLs, sitemap, robots rules, structured data supported by visible content, internal linking, and crawlable course/book/resource pages.
- Google Search Console connection and indexing checks.
- Google Business Profile audit and handoff checklist so the website and profile use consistent business details.
- PostHog setup with a simple owner dashboard covering visitors, landing pages, course enquiries, resource unlocks, WhatsApp handoffs, cart-to-paid conversion, library applications, and promotion performance.
- Consent-aware analytics and sampled session replay with sensitive forms and admin screens masked.

Ongoing Google Business Profile publishing, review operations, local citation work, competitive content, and ranking improvement are offered separately. Search placement cannot be guaranteed because Google also considers the searcher's location and competitors' prominence.

### Deployment and handoff

- Production deployment, domain connection, and separate development and production environments.
- Initial entry of the existing course catalogue, up to 20 physical books, and up to 30 resources using complete client-supplied data.
- One recorded staff onboarding session covering promotions, books, resources, enquiries, applications, and order fulfilment.
- Technical documentation and 30 days of post-launch defect support.

Production accounts for the domain, Cloudflare, Convex, Clerk, PostHog, Razorpay, Google Search Console, and Google Business Profile will be owned by ICT. Any paid third-party usage is billed directly to ICT.

## Delivery stages

1. Confirm content, business details, policies, delivery rules, catalogue data, and acceptance criteria.
2. Approve the visual direction and main mobile/desktop journeys.
3. Build the public pages, resources, enquiries, and admin foundation.
4. Build books, checkout, order fulfilment, library applications, and promotions.
5. Configure analytics, search foundations, deployment, and staff onboarding.
6. Complete acceptance testing and production launch.

## Client responsibilities

ICT will provide and approve its official name, address, hours, contacts, course information, fees, schedules, faculty information, results evidence and permissions, resource files, book data and covers, stock, delivery charges, library rules, legal policies, payment account, and responsible staff contacts.

Delays in content, approvals, account verification, or payment-provider onboarding may move the delivery date. New functionality requested after scope approval will be estimated separately before work begins.

## Commercial terms

- **50% — ₹18,750:** booking and discovery start.
- **30% — ₹11,250:** approved public experience and admin preview.
- **20% — ₹7,500:** production acceptance and handoff.
- Two consolidated revision rounds are included at each design approval stage.
- The quotation is valid for 15 days.
- Taxes, if legally applicable, are additional.

## Optional services after launch

### Care — ₹2,500/month or ₹25,000/year

Monitoring, dependency and security updates, backups and operational checks, and up to two hours of minor content or configuration changes each month.

### Local growth — ₹5,000/month, minimum three months

Care plus Search Console and PostHog review, Google Business Profile optimization and publishing, review-request workflow support, local visibility tracking, campaign reporting, and up to five hours of approved content or landing-page improvements each month. The service targets measurable visibility and enquiry growth; it does not promise a fixed search rank.

### AI enquiry assistant — separately scoped after launch

A staged assistant can answer from approved ICT material, understand common English and Assamese-English transliterated questions, capture enquiry context, and hand uncertain, sensitive, payment, complaint, or explicit human requests to staff.

Recommended commercial stages:

- **Knowledge and language pilot — ₹7,500:** approved source library, 100-question mixed-language evaluation set, retrieval prototype, and escalation rules.
- **Website assistant — ₹15,000:** public chat, abuse controls, lead capture, citations to approved material, analytics, and human handoff.
- **Assistant on WhatsApp — ₹18,000–₹25,000:** extending the assistant to answer on WhatsApp, with conversation history, shared-inbox workflow, and staff escalation. This is the assistant only. The WhatsApp messaging the website itself needs — verification codes, order updates, application acknowledgements, and staff replies from the dashboard — is already included in the launch package below. The final amount depends on the chosen shared-inbox workflow.
- **AI operations — from ₹3,000/month:** answer review, knowledge updates, quality reports, and up to two hours of tuning. Meta, messaging-provider, and model usage charges are paid directly by ICT.

The AI assistant will not confirm unapproved fees, schedules, availability, admissions, refunds, or payment outcomes. Low-confidence answers and defined high-risk intents will always create a staff handoff.

## Acceptance

Work begins after written acceptance of this scope, receipt of the first payment, and delivery of the initial content and account-access checklist.

**For Impact Career Tutorials**  
Name:  
Signature:  
Date:

**Service provider**  
Name:  
Signature:  
Date:
