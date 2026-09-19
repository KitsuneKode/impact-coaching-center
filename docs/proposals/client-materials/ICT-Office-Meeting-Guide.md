# ICT office meeting guide

This is a private guide for presenting the proposal. Do not send it to the client because it contains negotiation limits and internal positioning.

## Before leaving for the meeting

- Keep the presentation PDF, editable PowerPoint, and quotation PDF available offline on the laptop and iPad.
- Open the current website, the proposed presentation, and the PostHog references in separate browser tabs.
- Download the files locally rather than depending on office internet.
- Carry a printed copy of the quotation, a pen, and a blank page for final decisions.
- Confirm who can approve the project and who will operate enquiries, orders, library applications, and promotions.
- Do not show an empty analytics account. Use the illustrative dashboard in the presentation and explain that live data appears after launch.

## Useful PostHog links

- [Product analytics overview](https://posthog.com/docs/product-analytics)
- [Funnels](https://posthog.com/docs/product-analytics/funnels)
- [Dashboards](https://posthog.com/docs/product-analytics/dashboards)
- [Session replay](https://posthog.com/docs/session-replay)
- [Web analytics](https://posthog.com/docs/web-analytics)
- [Current pricing](https://posthog.com/pricing)
- [Privacy and collection controls](https://posthog.com/docs/privacy/data-collection)

Open **Funnels**, **Session Replay**, and **Pricing** before the meeting. They are the easiest features to explain.

## Recommended meeting structure

### 1. Begin with his requirements

Say:

> I reviewed the requirement document and organised it into one complete student and staff journey. It covers courses, free materials, lead collection, WhatsApp and Telegram actions, staff administration, speed, and responsive design. I have also included the physical-book flow, library applications, promotions, analytics, and the operational states needed to run them reliably.

This shows that the proposal comes from his brief rather than from a generic sales template.

### 2. Ask three operational questions

Ask before presenting the solution:

1. Who currently answers new course enquiries, and how quickly are they normally contacted?
2. Who will pack and dispatch book orders and update their status?
3. Who should have authority to publish promotions, update courses, and export leads?

Write down the names or roles. These answers make the admin workflow concrete and expose any missing operational owner.

### 3. Present three journeys

#### Course journey

Google or social link → course page → proof and syllabus → enquiry or WhatsApp → assigned follow-up.

#### Resource journey

Resource preview → short consent form → immediate access → recorded topic interest → appropriate follow-up.

#### Book journey

Book detail → cart → verified payment → order status → staff fulfilment.

Keep returning to these journeys if the conversation drifts into colours or isolated page features.

### 4. Show the admin experience

Explain that the dashboard answers four daily questions:

- Which enquiries are new or overdue?
- Which paid orders need packing or dispatch?
- Which library applications need review?
- Which promotion is active and what result is it producing?

The admin is intentionally smaller than a general CRM. Its value is that staff can operate the website without developer help for ordinary work.

### 5. Explain PostHog in plain language

Say:

> The admin tells you who needs attention. PostHog tells you what is working across the website. It can show which course page creates enquiries, which campaign creates orders, where checkout loses people, and which traffic sources create meaningful actions.

Use the illustrative dashboard slide, then open the official PostHog links if he wants proof of the product.

Do not lead with event names or technical implementation. Explain these four views:

- **Dashboard:** the owner's recurring numbers in one place.
- **Funnel:** the percentage that moves through each step.
- **Session replay:** a privacy-masked recording used to find navigation and form problems.
- **Web analytics:** entry pages, traffic sources, device types, and referrers.

Clarify that names, phone numbers, emails, orders, and applications stay in the protected admin. PostHog receives aggregate identifiers and campaign context, not sensitive form contents.

### 6. Present the five-week plan

Say:

> This is a five-week production schedule. I will show progress every week and request consolidated decisions at the main approval points. The date depends on receiving approved content, account access, and feedback on time.

Do not promise an unconditional calendar date before payment-provider verification and content readiness are known.

### 7. State the price once

Say:

> The complete five-week launch, including the premium responsive platform, physical-book checkout, resources, library applications, staff dashboard, promotions, analytics, search foundation, deployment and training, is ₹37,500.

Then stop speaking. Let him respond.

## Negotiation guide

### If he asks for a discount immediately

Say:

> I have already kept the scope within the budget discussed. I can review the payment structure or remove a clearly defined deliverable, but I do not want to reduce the reliability of the checkout, admin, or responsive experience.

### If a smaller reduction closes the project

You can offer **₹37,500** for the complete scope. Frame it as a final project adjustment, not an opening discount.

### Private floor

- Full scope floor: **₹36,000**.
- Do not reveal this number before a real closing decision.
- Below ₹36,000, remove scope or reduce support/content limits.

Possible reductions:

- Reduce post-launch defect support from 30 to 14 days.
- Reduce initial books/resources populated by you.
- Limit promotion formats to announcement bar and inline campaign.
- Defer sampled session replay and advanced campaign funnels.
- Simplify the first library-admin workflow.

Do not remove server-side payment verification, authorization, accessibility, or responsive qualification to make the price lower.

### If he says someone can build it cheaper

Say:

> That may be possible for a set of pages. This proposal also includes the operational states behind leads, payments, order fulfilment, resource access, staff permissions, promotions, analytics, deployment and handoff. We should compare the same scope and responsibilities.

### If he wants AI included

Say:

> I recommend completing the platform and collecting real enquiry patterns first. The AI system needs an approved knowledge set, Assamese-English examples, accuracy testing and a human escalation process. I will scope that separately so it does not put this launch or your customer trust at risk.

## Lead collection plan

The goal is to collect enough information for useful follow-up while keeping each form appropriate to the visitor's intent.

### Lead sources

Create one lead record regardless of entry point:

| Entry point            | Minimum information                         | Context captured automatically            |
| ---------------------- | ------------------------------------------- | ----------------------------------------- |
| General course enquiry | Name, phone, course interest, consent       | Page, campaign, referrer, device category |
| Free resource unlock   | Name, phone or email, consent               | Resource, subject, campaign               |
| WhatsApp handoff       | No duplicate form when avoidable            | Page, course, CTA placement, campaign     |
| Library application    | Name, phone, plan, intended start           | Page and campaign                         |
| Book support enquiry   | Name, phone, order reference when available | Book/order context and page               |
| Call action            | No forced form                              | CTA placement and campaign click          |

Phone should be the primary contact field because the business operates through calls and WhatsApp. Email can remain optional for general course enquiries unless it is required for a specific resource delivery or receipt.

### Form principles

- Ask for the fewest fields required for the next action.
- Explain what happens after submission and expected response time.
- Use a real consent statement and do not preselect optional marketing consent.
- Preserve campaign, course, resource, and page context automatically.
- Detect likely duplicates by normalized phone/email while retaining activity history.
- Confirm success immediately and offer the appropriate next action.
- Keep forms usable on phones, iPads, laptops, keyboard, and touch.
- Never send names, phones, emails, addresses, order references, or free-text messages to PostHog.

### Recommended lead model

Each lead needs:

- Identity and contact channel.
- Course or service interest.
- Source, campaign, landing page, and first/last touch.
- Consent record and timestamp.
- Owner.
- Status.
- Next follow-up date.
- Activity history.
- Qualification reason and outcome.

Use a small pipeline:

`New → Contacted → Interested → Enrolled / Lost`

Library applications and orders should retain their own operational statuses rather than being forced into the course-lead pipeline.

### Assignment and escalation rules

- New lead: notify the assigned staff member immediately.
- No first contact within the agreed response time: mark overdue and notify the owner.
- Explicit request for a call: create a due task with the preferred time.
- Payment/refund/order mismatch: send to the commerce owner, not a general counsellor.
- Complaint, angry language, legal issue, or request for management: escalate to the designated manager.
- Repeated submissions: merge or link them while preserving each campaign touch.
- AI uncertainty, conflicting approved material, or a request for a person: hand off with the conversation context.

### Follow-up operating rhythm

The client needs to agree on a simple service level. A practical starting point is:

- During working hours: first response within 15–30 minutes where staffing allows.
- Outside working hours: automatic acknowledgement with the next staffed response window.
- First missed response: retry through the permitted channel the next working day.
- Final outcome: enrolled, lost with a reason, or nurture with an approved future follow-up date.

Do not automate repeated WhatsApp or promotional messages until consent, platform rules, templates, and opt-out handling are established.

### Owner dashboard for leads

Show operational metrics in the admin:

- New and overdue enquiries.
- Median first-response time.
- Leads by course and source.
- Enrolment outcomes and lost reasons.
- Staff workload and unassigned leads.

Show aggregate acquisition and conversion in PostHog:

- Landing page to enquiry funnel.
- CTA placement performance.
- Campaign and course conversion.
- Resource unlock to later enquiry.
- WhatsApp handoff rate.

### Questions to resolve with the client

1. Is phone required for every free resource, or will email-only access be allowed?
2. Which staff member owns each programme's leads?
3. What is the promised response time during working hours?
4. Can staff send promotional WhatsApp follow-ups, and what consent wording is currently used?
5. Which lead outcomes matter: enrolled, visited centre, called, paid, or another definition?
6. How long should inactive lead data be retained?
7. Does the owner need Excel export, direct calling, bulk assignment, or all three?
8. Who can delete/export leads and publish promotions?

Do not finalize the lead workflow until these operating decisions have an owner.

## Closing the meeting

Ask:

> Does this cover the public experience, staff operations and reporting you expect? If we agree on the scope today, the next step is the advance, the content/account checklist, and scheduling the week-one direction review.

Record any requested change in writing. Do not casually promise it during the conversation. After the meeting, send a revised scope or a short written confirmation of unchanged scope, price, responsibilities and start conditions.
