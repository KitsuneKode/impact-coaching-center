# PostHog and Convex platform research

Research date: 17 September 2026

## Decision

Use PostHog for product and conversion analytics and Convex for mutable operational data. At the expected 1,000–2,000 monthly visitors, both should fit comfortably within their free allowances if the public site is mostly statically rendered and large PDFs/images are served from object storage rather than Convex.

Use Google Search Console regardless of the analytics choice. GA4 is optional at launch. Add it when the business starts Google Ads, needs GA4-native advertising audiences/conversions, or an external marketing partner requires Google reporting.

## PostHog: what to learn and configure

### Learn first

1. **Events and properties.** An event is PostHog's core data unit and contains a name, distinct ID, timestamp, and properties. Learn manual capture, anonymous versus identified events, and event/property definitions before using autocapture broadly ([PostHog events](https://posthog.com/docs/data/events)).
2. **Funnels.** Learn sequential funnels, conversion windows, step filters, breakdowns, and viewing users who drop at a step. PostHog recommends starting with the simplest required flow because optional steps can skew results ([PostHog funnels](https://posthog.com/docs/product-analytics/funnels)).
3. **Dashboards and insights.** Dashboards are intended for recurring metrics; individual insights are better for analysis. Build a small operational dashboard rather than exposing staff to every PostHog feature ([PostHog dashboards](https://posthog.com/docs/product-analytics/dashboards)).
4. **Session replay privacy and sampling.** Inputs are masked by default and masking happens in the browser before data is sent. General page text is not masked by default. Learn selectors, recording rules, URL exclusions, and replay retention before enabling replay ([replay privacy controls](https://posthog.com/docs/session-replay/privacy), [replay retention](https://posthog.com/docs/session-replay/recording-retention)).
5. **Consent and collection controls.** PostHog supports opt-in/out, opt-out by default, consent-manager integration, cookieless tracking, IP controls, and filtering before transmission ([data collection controls](https://posthog.com/docs/privacy/data-collection)).

### Proposed event taxonomy

Use stable `snake_case` names for business actions. Centralize capture behind a typed adapter. Do not send names, phone numbers, email addresses, shipping addresses, payment payloads, resource form text, or staff notes.

| Event                          | Capture when                             | Safe properties                                                |
| ------------------------------ | ---------------------------------------- | -------------------------------------------------------------- |
| `cta_clicked`                  | A meaningful CTA is activated            | `cta_id`, `placement`, `destination`, `campaign_id`            |
| `lead_form_started`            | First interaction with an enquiry form   | `form_id`, `page_type`, `course_slug`, `campaign_id`           |
| `lead_submitted`               | Convex confirms lead creation            | `form_id`, `page_type`, `course_slug`, `source`, `campaign_id` |
| `resource_gate_viewed`         | A gated resource form opens              | `resource_id`, `resource_type`, `subject`                      |
| `resource_unlocked`            | Consent is stored and access is granted  | `resource_id`, `resource_type`, `subject`                      |
| `book_viewed`                  | A book detail view is rendered           | `book_id`, `category`, `availability`                          |
| `cart_item_added`              | A book is added to cart                  | `book_id`, `quantity`, `unit_price_paise`                      |
| `checkout_started`             | Checkout begins                          | `cart_size`, `subtotal_paise`, `delivery_paise`                |
| `payment_result`               | Server-verified status is known          | `order_id_internal`, `status`, `gateway`, `failure_class`      |
| `library_enrollment_submitted` | Convex confirms an application           | `plan_id`, `source`, `campaign_id`                             |
| `promotion_viewed`             | A promotion becomes meaningfully visible | `promotion_id`, `format`, `placement`                          |
| `promotion_clicked`            | Its CTA is activated                     | `promotion_id`, `format`, `destination`                        |
| `whatsapp_handoff`             | A WhatsApp CTA is activated              | `placement`, `intent`, `course_slug`                           |

Keep `payment_result` server-side and accept only a small enumerated status. An internal order ID is acceptable for operational correlation; never capture a Razorpay payload or customer details.

### Initial funnels and dashboards

Create four funnels:

- Course interest: course page → CTA → form started → lead submitted → WhatsApp handoff.
- Resource acquisition: resource listing → gate viewed → resource unlocked.
- Book purchase: book viewed → cart item added → checkout started → server-verified paid result.
- Promotion: promotion viewed → clicked → relevant lead/order/enrollment result, broken down by `campaign_id`.

Create one owner dashboard with unique visitors and top landing pages, leads by source/course, funnel conversion and abandonment, resource unlocks, WhatsApp handoffs, cart-to-paid conversion, revenue from verified orders, library applications, and promotion performance. Keep lead follow-up and order operations in the custom admin; PostHog is analysis, not the system of record.

### Privacy, consent, and retention

- Start opted out until the site's consent choice permits analytics. PostHog documents `opt_out_capturing_by_default` and integration with consent-management platforms ([collection controls](https://posthog.com/docs/privacy/data-collection)). Confirm the final consent policy with qualified legal advice for the jurisdictions served.
- Preserve default input masking. Additionally mask the full lead, checkout, library, login, and admin surfaces; do not record network payloads or console logs there. General text is otherwise visible in replay ([replay privacy controls](https://posthog.com/docs/session-replay/privacy)).
- Discard stored client IP addresses unless location enrichment has a specific approved use. PostHog can use an IP for enrichment/bot filtering and then discard the raw address ([data storage controls](https://posthog.com/docs/privacy/data-storage)).
- Prefer the EU Cloud region if contractual or privacy requirements call for EU storage; the storage region is selected when setting up the project ([data storage controls](https://posthog.com/docs/privacy/data-storage)).
- On the free plan, PostHog currently lists one-year project data retention. Free session replays can be configured up to 30 days; changing replay retention affects new recordings only ([PostHog pricing](https://posthog.com/pricing), [replay retention](https://posthog.com/docs/session-replay/recording-retention)). Use 30 days or less for this site.

### Current pricing and likely usage

PostHog's current public pricing lists, per month, 1 million analytics events and 5,000 session recordings free. The free plan has one project, unlimited members, one-year project retention, and stops ingestion at free limits rather than charging unexpectedly. Pay-as-you-go retains the same monthly allowances, supports six projects and seven-year analytics retention, and allows per-product billing limits ([PostHog pricing](https://posthog.com/pricing)). PostHog's official product page publishes overage reference rates of $0.00005 per analytics event and $0.005 per replay after the free allowances ([PostHog product overview](https://posthog.com/services)); verify the interactive calculator again before contracting because rates can change.

At 2,000 visitors/month, even an intentionally generous estimate of 50 captured events per visitor is 100,000 events, 10% of the free allowance. Recording every visitor once would be about 2,000 replays, below the 5,000 allowance. Prefer replay sampling or targeted recording on course, resource, cart, and checkout journeys for privacy and signal quality rather than cost alone.

### Is GA4 needed?

No for the initial product/conversion analysis. PostHog covers the proposed event funnels, behavior analysis, dashboards, and replay. Google Search Console remains necessary for search queries, indexing, and organic-search diagnostics.

Add GA4 when Google Ads becomes active or a marketer needs Google's reports and audience exchange. Google documents that linking GA4 and Ads makes Analytics key events available as Google Ads conversions and allows Analytics audiences and engagement data to be used in Ads ([Google Ads linking](https://support.google.com/analytics/answer/9379420?hl=en), [GA4 conversions](https://support.google.com/analytics/answer/9356034?hl=en)). If added, send the same agreed business events through the analytics adapter and document which system owns each KPI; do not create two competing versions of conversion performance.

## Convex: free allowance and traffic estimate

### Current limits

Convex states that limits are measured per team, so other projects in the same team consume the same pool. Free uses hard caps; Starter keeps the same included resources and charges for excess use ([Convex limits](https://docs.convex.dev/production/state/limits), [pricing FAQ](https://www.convex.dev/pricing/faq)). Current Free allowances are:

| Resource         |       Free allowance | What counts / practical implication                                     |
| ---------------- | -------------------: | ----------------------------------------------------------------------- |
| Function calls   |      1,000,000/month | Explicit calls, scheduled runs, subscription updates, and file accesses |
| Action compute   |    20 GB-hours/month | External APIs, Node actions, and long-running action work               |
| Database storage |         0.5 GB total | Documents plus indexes; each index adds storage                         |
| Database I/O     |           1 GB/month | Document and index bytes transferred between functions and database     |
| File storage     |           1 GB total | User files and backups                                                  |
| Data egress      |           1 GB/month | Served files, files accessed by functions, and backup transfer          |
| Search storage   |         0.5 GB total | Shared by text and vector indexes                                       |
| Search queries   | 3,000 query-GB/month | Shared by text and vector search                                        |
| Runtime tier     |                  S16 | 1,000 concurrent sessions, 16 concurrent queries and 16 mutations       |

Sources: [Convex platform limits](https://docs.convex.dev/production/state/limits) and [Convex pricing](https://www.convex.dev/pricing).

Starter currently includes the same amounts, then charges US-region rates of $2.20/additional million calls, $0.33/additional action GB-hour, $0.22/additional database-storage GB/month, $0.22/additional database-I/O GB, $0.033/additional file-storage GB/month, $0.132/additional egress GB, $0.55/additional search-storage GB/month, and $0.11/additional 1,000 query-GB. EU resource rates are documented as 1.3× US rates ([Convex limits](https://docs.convex.dev/production/state/limits)).

### Estimate for 1,000–2,000 visitors/month

This is a planning estimate, not a measured bill. Assumptions:

- 2,000 visitors, five public page views each: 10,000 page views.
- Mostly static course/book/resource catalogue pages; Convex queries only for mutable availability, promotions, and interactions.
- Five Convex calls per page view in a deliberately conservative design, plus 10,000 admin, form, cart/order, webhook, cron, and subscription-update calls.
- Small documents, indexed queries, fewer than 10,000 total business records in the first year.

That yields roughly **60,000 calls/month**, only 6% of the 1 million allowance. Even a wasteful 20 calls per page view plus 20,000 operational calls would be about **220,000 calls/month**. The function-call limit becomes plausible around 50 calls per visitor at 20,000 visitors/month, or earlier if realtime subscriptions update frequently, polling is used, per-row calls replace batched functions, or scheduled tasks fan out into many calls.

Database storage is unlikely to be the first constraint. At an assumed 5 KB per lead/order/product/resource record including index overhead, 50,000 records would be about 250 MB. Measure actual Convex usage; indexes count as copies of indexed data and large free-text/audit payloads can change this quickly.

Database I/O can become the first database constraint if public pages scan tables or return full catalogues repeatedly. With indexed, paginated queries averaging 20 KB of database I/O, 20,000 queries use about 0.4 GB. Full-table scans, oversized records, unbounded admin exports, and reactive updates that repeatedly reread large result sets can exceed 1 GB well before function calls reach one million.

Search should remain far below its allowance because the course/book/resource index is tiny. The avoidable risks are search on every keystroke without debouncing and placing large text bodies or embeddings in the search index.

**File egress is the credible early trigger.** A single 5 MB PDF downloaded 205 times is already about 1 GB. A catalogue of resources can fit under 1 GB storage but exceed the 1 GB monthly egress allowance quickly. Store PDFs, book images, and videos in Cloudflare R2 or another CDN-backed object store; keep metadata, consent records, access entitlements, and signed-link policy in Convex.

### When paid usage becomes necessary

Move from Free to Starter before production traffic can hit a hard cap, because Convex says sustained Free overages may return HTTP errors; successfully committed records are not deleted ([Convex pricing FAQ](https://www.convex.dev/pricing/faq)). Practical triggers are:

- Monthly usage repeatedly exceeds 70–80% of function-call or I/O allowance.
- A promotion produces burst traffic where write availability matters.
- Resource delivery remains on Convex and approaches 1 GB/month egress.
- Stored records plus indexes approach 0.5 GB.
- The team needs guaranteed continuation beyond included limits rather than a hard stop.
- The organization needs Professional-only operational features such as daily backups, log streaming, exception reporting, custom domains, or email support; Professional currently starts at $25 per developer/month ([Convex pricing](https://www.convex.dev/pricing)).

## Operational recommendations

1. Put the Convex and PostHog projects in client-owned organizations and invite the maintainer; keep production separate from development.
2. Render stable marketing/catalogue content statically or with cache/revalidation. Use Convex for mutable inventory, leads, orders, enrollments, promotions, consent, and admin workflows.
3. Use indexed and paginated Convex queries, batch related reads/writes into coherent functions, debounce search, avoid polling, and watch subscription fan-out.
4. Serve heavy assets from R2/CDN. Never treat Convex file storage as an unlimited download CDN under this traffic model.
5. Add usage alerts at 50%, 70%, and 85%; review function calls, database I/O, storage/index growth, action compute, file egress, and search monthly. Keep a tested export/backup procedure.
6. Use PostHog for aggregate analysis and Convex/admin for identifiable operations. Do not copy CRM personal data into analytics.
7. Validate analytics in development with synthetic traffic, then exclude staff/admin activity and localhost/preview hosts from production reporting.
8. Re-check both vendors' pricing and limits at proposal acceptance and before launch; record the chosen region, plan, retention, replay masking, consent behavior, and billing cap in the deployment handoff.

## Dated assumptions

- Pricing and limits were checked against official vendor pages on **17 September 2026** and may change.
- Traffic means 1,000–2,000 unique visitors per month, not concurrent users.
- The estimate assumes roughly five page views per visitor, indexed/paginated queries, small operational records, little action compute, and no AI workload in Convex.
- Physical books use a payment provider; Convex stores order/payment state and verified provider identifiers, never payment credentials.
- PDFs and media are assumed to move to object storage. If they remain in Convex, egress rather than visits determines the likely bill/limit.
- No availability or uptime guarantee is inferred from a free plan. Production risk tolerance may justify Starter or Professional before raw usage requires it.
