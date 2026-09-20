# Courses sell on Classplus; Books sell on this site

Classplus is ICT's LMS and its payment rail for Courses: paying there is what provisions a student's access to classes. This site therefore never takes Course payments. "Enroll Now" is an Enrolment handoff — it records the intent and the Course id, then sends the Person to ICT's Classplus storefront. Books are different: they are physical stock ICT ships itself, so they are bought here through a server-verified Razorpay flow.

## Considered options

Taking Course payments on this site via Razorpay was rejected. It would collect money without granting Classplus access, turning every sale into a manual provisioning job and a refund risk. Keeping the current WhatsApp-only handoff was also rejected as the primary path: it leaks conversions and makes it impossible to attribute an enrolment to a Course, which is the measurement problem the lead capture was built to solve. WhatsApp remains as a secondary "talk to us" action.

## Consequences

### Clarification — 20 September 2026

Books are maintained only in our catalogue, independently of Classplus, with
enabled/disabled availability and shipping or ICT collection. Initial payments
are online through Razorpay; cash collection awaits owner review. No stock counts
or shared Course/Book cart are planned.

The main domain will move to this site. A supported separate Classplus purchase
destination must therefore be confirmed before cutover; the historical statement
below is not current verification of a working handoff. Supported catalogue API
access also needs account-specific confirmation. Scheduled and owner-triggered
syncs will publish validated snapshots and retain the last good snapshot on
failure, without copying Classplus accounts or handling Course payments.

### Historical integration observation

ICT's own advertised storefront at `impactcareertutorials.in/courses` has served an expired TLS certificate since at least August 2025 and still fails today, so handoffs target the live Classplus-hosted storefront instead. The catalogue snapshot in `lib/catalogue.ts` continues to come from the public Classplus storefront endpoint, keeping Classplus the single source of truth for Course data while the site never depends on that API at request time.
