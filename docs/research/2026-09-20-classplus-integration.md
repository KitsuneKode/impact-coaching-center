# Classplus integration research

Research date: 20 September 2026

## Decision summary

Treat Classplus as the system of record and payment/classroom provider for ICT
Courses. Build the new storefront as a separate marketing/catalogue site and
send each enrolment handoff to a stable Classplus-owned course/store URL. Do not
make the current public endpoint in `scripts/sync-courses.ts` a production
runtime dependency or infer an API contract from it.

The official public material confirms a branded Classplus app/website, a store
that sells courses, and a custom-domain integration tutorial. It does **not**
establish, in the sources located during this research, a developer API reference, supported read-only catalogue API,
authentication scheme, account entitlement matrix, pagination/rate-limit
contract, webhooks, iframe/embed contract, headless checkout, or SSO contract.
Those are account-level/vendor-confirmation questions, not facts we can safely
fill in from the frontend's network calls.

## What official Classplus sources establish

| Question                                                                                                 | Evidence                                                                                                                                                                                                                                                                                                                | Status                                                                  |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Does Classplus provide a branded website and course store?                                               | The product page says the app has an e-commerce store for listing/selling courses and that the included website lets students purchase courses, download the app and contact the institute ([Classplus app features](https://classplusapp.com/app-features.html), lines 37–39 and 70–72 in the fetched page).           | Documented public product claim                                         |
| Is a custom domain possible?                                                                             | Classplus’s own YouTube channel published a tutorial explicitly titled “How to make a Website \| Domain Name Integration” and its description names “Getting your Classplus Domain Name” and “Integrating your own Domain” ([official video](https://www.youtube.com/watch?v=GUaHgZaky9Q), timestamps 16:25 and 17:42). | Documented public tutorial; exact DNS/plan limits still unverified      |
| Are branded app, website, admin, courses and enrolments sold as plan features?                           | The current Classplus landing page lists branded app, website, admin portal, unlimited recorded courses and unlimited student enrolments in its plan feature list ([Classplus plans](https://classplusapp.com/new-web)).                                                                                                | Documented marketing claim; ICT’s account entitlement must be confirmed |
| Is Classplus intended to own selling and learning delivery?                                              | Classplus describes its platform as the place where educators sell courses and host content/live classes, including the white-label guide’s description of payments and course access ([white-label LMS guide](https://classplusapp.com/growth/white-label-lms-for-indian-educators/), lines 284–290).                  | Documented product positioning, not an integration API contract         |
| Is there a public supported API?                                                                         | Searches of the official Classplus site, product pages and help-facing pages found no public developer portal or API reference. The only concrete API-like URL in this repo is an internal-looking `api.classplusapp.com/v2/course/preview/diy/similar/...` request used by the public storefront script.               | **Not documented publicly**; endpoint is unverified/undocumented        |
| Are auth, account plans, pagination, rate limits, webhooks, embeds, headless checkout or SSO documented? | No official public Classplus specification was found for these capabilities during this research.                                                                                                                                                                                                                       | **Unknown; require written account-manager confirmation**               |

### Follow-up discovery (20 September 2026)

Community and directory searches produced leads, not proof of a supported
integration:

- An unrelated public GitHub project, [classplus-extended](https://github.com/emsaumay/classplus-extended), says it uses “REST-API” to view enrolled batches and lectures. It appears to be a user-built client for enrolled-student data, not a Classplus-maintained SDK, partner API or catalogue contract. It must not be treated as authorization to copy its requests or credentials.
- An API directory profile for [Classplus API](https://apitracker.io/a/classplusapp) lists no developer docs, API reference, webhooks, sandbox, authentication, pagination, rate limits or base endpoint, and warns that its data may be incomplete. This supports “no publicly discoverable contract” only; it does not prove Classplus has no private or plan-gated API.
- Reddit searches surfaced Classplus user/access discussions and generic LMS/API questions, but no first-hand, technically reproducible evidence of an official Classplus catalogue API. Reddit remains discovery-only and is not an authority here.
- Classplus’s official AI/LMS article says integrations should be checked against “the documentation and support provided by both the LMS and the API,” but does not publish a Classplus API reference or name an available endpoint ([official article](https://classplusapp.com/growth/integrate-ai-apis-lms/)).

Therefore the conclusion is refined: a private, partner, or plan-gated API may
exist, but no public evidence found here establishes that ICT is entitled to
one or that the current endpoint is that API. The custom-domain video is also
an official but December 2023 tutorial; it demonstrates that a domain workflow
existed, not that the same workflow, DNS arrangement or entitlement exists on
ICT’s current plan in September 2026.

## Current repository integration

`scripts/sync-courses.ts` calls:

```text
GET https://api.classplusapp.com/v2/course/preview/diy/similar/<base64-json>
  ?subCatList=[]&mainCategoryList=[]&limit=60&offset=0
```

It sends browser-like `Origin` and `Referer` headers, assumes a success-shaped
JSON payload, and snapshots the result into `lib/catalogue.ts`. This is useful
as a manually reviewed content-import experiment, but the source code itself
does not prove that the URL is a supported partner API. It gives us no
documented token, tenant/account scope, schema/version guarantee, pagination
semantics, quota, retry guidance, change notice, or webhook replacement.
Do not add credentials to this script or expose any Classplus token to the
browser. If Classplus supplies an API, use its written contract and a
server-only adapter with bounded pagination, caching, failure logging and a
last-known-good snapshot.

### Smallest catalogue-only contract needed

The initial site does not need Classplus payment, classroom, SSO or webhook
integration. A supported read-only contract is sufficient if it provides:

- a server-authenticated, tenant-scoped `GET` for public Courses;
- stable Course identifier and canonical handoff URL;
- display name/short name, truthful description/features, image URL, currency,
  list price, current price, free/visibility state and an optional updated
  timestamp;
- documented pagination (cursor preferred, or bounded `limit`/`offset`),
  maximum page size, cacheability, rate limits, timeout/error semantics and
  version/deprecation policy;
- no student PII, credentials, payment payloads or classroom content in the
  response.

Webhooks are not required for launch: a staff-triggered server sync with
last-known-good snapshot and diff review is acceptable. If Classplus offers no
supported read-only API, the same adapter boundary can use a manually reviewed
catalogue snapshot. That lets architecture proceed with an **explicitly
unverified dependency** while keeping the release decision honest: do not label
the endpoint supported, promise freshness, or make launch depend on it until
Classplus confirms the contract in writing.

## Migration implications

The safest minimal path is:

1. Keep authoritative course data and purchase responsibility in Classplus. The new site
   can show a reviewed snapshot of course name, price and features, but must
   label the CTA as an enrolment handoff and link to the exact Classplus course
   URL supplied/approved by ICT.
2. Ask Classplus to provision or confirm a stable ICT-branded store/course
   domain (preferably a subdomain such as `learn.impactcareertutorials.in` if
   their product supports it). Do not assume that moving the marketing site’s
   `www` DNS record will preserve the Classplus storefront.
3. Keep `www.impactcareertutorials.in` redirects and the new marketing domain
   under ICT’s DNS control. Migrate marketing pages independently; leave the
   existing Classplus store URL alive until the new destination, checkout,
   login, app links and post-payment classroom access have been manually
   tested on phone, tablet and desktop.
4. Use ordinary top-level navigation or a new tab for the handoff unless
   Classplus explicitly documents an embed/iframe or headless checkout. Never
   scrape checkout, proxy Classplus auth, or simulate payment from this site.
5. If a supported catalogue API is unavailable, keep the reviewed snapshot and
   provide an owner sync/check workflow with read-only staff status. Any continued
   importer use needs provider permission; automatic syncing is not assumed approved.
   A stale-but-honest catalogue is safer
   than an undocumented live integration that can silently change or break.

## Questions for the Classplus account manager

Ask for written answers tied to ICT’s organisation/account and current plan:

1. Do we have an officially supported read-only API for public course/catalogue
   data? If yes, provide the base URL, OpenAPI/reference docs, scopes, tenant
   identifier, allowed fields, versioning/deprecation policy and a sandbox.
2. What authentication is required (API key, OAuth, signed request or another
   method), where must secrets live, and can the integration be server-only?
3. What are the exact pagination parameters and maximum page size? Are results
   stable while paging, and what are the rate limits, burst limits, retry rules
   and response-cache rules?
4. Is there an official webhook/event feed for course, price, availability,
   order/payment or enrolment changes? Ask for event names, signature
   verification, retries, replay/deduplication and sandbox test delivery.
5. Does ICT’s current plan include the API, custom domain, branded website,
   stable course deep links, custom subdomain, SSL, redirects and analytics?
   Are any of these add-ons or contract-dependent?
6. Can the existing Classplus storefront move from
   `www.impactcareertutorials.in` to a new host/subdomain without changing
   course IDs, purchase history, student accounts, app links or classroom
   access? What DNS records, redirect rules, certificate timing and rollback
   steps are required?
7. What is the canonical URL format for a specific Course and is it guaranteed
   stable? Can Classplus issue a permanent redirect or alias if the storefront
   host changes?
8. Is an iframe/embed officially supported for catalogue or checkout? If yes,
   document allowed origins, CSP/frame-ancestors, cookies, mobile behaviour,
   payment redirects, accessibility and support boundaries.
9. Is headless checkout or a server-created checkout session supported? If yes,
   document server authentication, signed return/webhook verification,
   idempotency, refunds and the exact boundary at which Classplus owns payment.
10. Is SSO or a signed student handoff supported from the marketing site to the
    Classplus app/classroom? If yes, request the protocol, token audience,
    expiry, replay protection, account linking and logout behaviour. Do not
    collect Classplus credentials on ICT’s site.
11. Can staff export catalogue, orders and enrolments if ICT later leaves? Ask
    for fields, format, retention and any contractual restrictions.

## Blockers and verification limits

- No official public API documentation or public entitlement table was found;
  account-manager confirmation is a release blocker for anything beyond a
  manual snapshot and ordinary link handoff.
- The public marketing pages say “website,” “store,” and “custom domain,” but
  do not establish that an arbitrary Next.js storefront can host Classplus
  checkout or that a custom domain can be split between marketing pages and
  Classplus routes.
- The current endpoint was not treated as supported merely because the public
  storefront appears to call it. Its schema, auth, limits and continued
  availability remain unverified.
- No credentials were requested, collected or used, and no Classplus account or
  DNS state was changed during this research.

## Recommended acceptance gates

Before replacing the existing Classplus URL or claiming “integrated”:

- written vendor answers and plan entitlement for the chosen API/domain/link
  path;
- a test account or sandbox proving catalogue reads, a specific-course deep
  link, checkout redirect, payment result and classroom access;
- manual browser tests across phone, iPad/tablet, laptop and desktop, including
  back/refresh, blocked third-party cookies, slow network and failed payment;
- rollback DNS/redirect instructions and a last-known-good course catalogue;
- no payment, auth or student PII handled by the marketing site unless a
  separate approved integration contract explicitly requires it.
