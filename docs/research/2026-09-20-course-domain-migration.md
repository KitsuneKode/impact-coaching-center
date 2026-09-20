# Course storefront and domain migration

Status: recommendation, not an approved DNS change or verified Classplus capability.

## Maintainer instruction — preview before migration

The maintainer explicitly deferred migration until deployment setup and testing.
Do not change DNS, bind the live domain, replace the existing Classplus site or
enable production redirects during implementation. Use an isolated Vercel preview
deployment for evaluation; Vercel is the requested preview path, not an implicit
resolution of the previously deferred production-hosting comparison. Keep preview
credentials/data separate from production, use payment test mode, prevent search
indexing and protect nonpublic previews. Indexing controls are not access control.
Confirm exact trusted auth origins without accepting arbitrary preview hosts.
Vercel documents separate deployment environments:
[environment documentation](https://vercel.com/docs/deployments/environments).
No deployment is authorized by this note; cutover remains a later explicit step.

## Recommended experience

Keep `www.impactcareertutorials.in` for our public storefront, resources and Book
commerce. Prefer `learn.impactcareertutorials.in` for the Classplus-owned purchase
and classroom experience, subject to Classplus confirming supported custom-domain
configuration. `classplus.` is understandable but names the vendor rather than the
student's task; `learn.` can remain useful if the vendor changes.

Our UI owns Course discovery, filters and detail pages. A clearly labelled
"Continue to enrol" action links directly to the matching provider Course, with
nearby copy: "Course payment and classes are handled on ICT's learning platform,
powered by Classplus." Existing students get a separate prominent "My classes"
link to the provider's verified login/classroom destination. Prefer normal
same-tab navigation with browser Back, not a forced modal/countdown interstitial.
Do not require our account merely to follow a Course link. Do not imply shared
login or copy authentication cookies across subdomains.

Keep our Book checkout separate. Reuse existing controls and provider checkout;
do not create a second LMS or reproduce Classplus purchase forms. An iframe or
reverse proxy is not the default integration: embedding can be disallowed by the
provider's security policy, and cross-site embedded authentication can encounter
cookie restrictions. Only reconsider with documented provider support covering
authentication, payments, accessibility and mobile behavior. Sources:
[MDN frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors),
[MDN third-party cookies](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies).

## Repository evidence

- `app/courses/[slug]/page.tsx` uses `dynamicParams = false` and generates only
  selected Course slugs. Numeric legacy IDs have no compatibility route today.
- `next.config.ts` currently has no redirect map.
- The course purchase-intent helper in `lib/contact.ts` currently sends visitors
  to WhatsApp. The direct Classplus handoff is a requirement, not completed code.
- `scripts/sync-courses.ts` fetches one fixed 60-item page. The future persisted
  snapshot must retain stable provider IDs and explicit purchase destinations.

## Cutover sequence and acceptance criteria

1. Obtain Classplus-supported custom-domain/DNS/TLS instructions and a permanent
   provider fallback address. Confirm whether both old and new domains can coexist
   during migration, and whether old sessions or payment callbacks depend on the
   current domain. DNS alone cannot configure Classplus routing or certificates.
2. Establish the learning destination first. Verify known Course links, existing
   student access, login/logout, free content, mobile/app links and payment-return
   behavior with the provider. No real charge without explicit approval. Keep
   main-domain DNS unchanged until this dependency is satisfied.
3. Inventory old URLs from sitemaps, Search Console, existing links and approved
   provider exports. Map each old numeric Course URL to the corresponding new
   detail page or, if no equivalent is published, the supported provider Course.
   Preserve intent for login/classroom links: send those to learning, not a sales
   page. Unknown/removed Courses need an honest unavailable/not-found page with
   navigation, not a blanket redirect to the homepage.
4. Resolve legacy numeric routes before slug matching; keep stable mappings even
   after a title changes. Use direct permanent redirects for public URLs once
   destinations are confirmed. Do not forward arbitrary return URLs or sensitive
   query parameters. Authentication/payment callback routes need provider-specific
   handling, not a generic redirect. Avoid loops and chains.
5. Align canonical URLs and sitemap with our public Course pages. Ask Classplus
   what canonical/noindex controls it supports on duplicate public catalogue
   pages; do not assume we can configure them. Retain redirects at least a year,
   preferably longer for bookmarks. Google recommends URL-by-URL mapping,
   permanent server redirects and avoiding irrelevant homepage redirects:
   [Google site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).
6. Coordinate DNS cutover, certificates, provider bindings and rollback together.
   Do not change mail records. Verify both apex and www behavior; monitor broken
   links, handoff failures and stale catalogue status. Update ads, social links
   and internal links. A short dismissible "Looking for your classes?" notice
   may help returning students; it must not block browsing or payment.

## Still requiring provider confirmation

Custom subdomain support for ICT's plan; DNS records and TLS ownership; supported
login/course/classroom URLs; app-link behavior; domain/session migration; pending
payment callbacks; API permissions and limits. No DNS, redirects, runtime routes
or accounts were changed during this research.
