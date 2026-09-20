# Enquiries persist through an authenticated Convex route

An Enquiry is recorded by POSTing it to `/enquiries` on Convex, a public HTTP
route authorised by a shared bearer secret that only our own server holds. The
mutation behind it writes one Person per mobile number and one `enquiry`
activity, and is `internalMutation`, so nothing outside Convex can call it.

The alternative was calling a Convex mutation directly from the Next.js server
action with a deploy key. That couples the web tier to Convex's client library
and to a credential with far wider authority than "record one enquiry". A
single-purpose route with a single-purpose secret is the smaller blast radius,
and it is the same shape the WhatsApp and payment webhooks will need.

## Consequences

**Convex cannot see the visitor.** Every enquiry arrives from our own server,
so Convex observes one address for all of them. The visitor's address is read
from the forwarded header in the server action and passed in the body. It is
validated as a well-formed address before use (`lib/client-address.ts`) so a
made-up value cannot mint an unbounded number of counter rows, but validation
is not authenticity: the leftmost forwarded entry is the visitor only on a host
that overwrites that header rather than appending to it, and no production host
has been chosen. **The per-number ceiling is the backstop that does not depend
on this.** Confirm the host's behaviour before treating the per-address ceiling
as real — see KIT-42.

**Ceilings live here, ahead of their plan.** The Person foundation plan assigns
"Convex rate limiting per phone and per IP" to a later slice. It moved forward
because this slice is what introduced an unauthenticated public write path;
shipping that without a ceiling was not defensible. The ceilings are twenty an
hour per address and ten an hour per number, in a fixed window.

This does **not** discharge the spec's §10 requirement for ceilings on OTP
sends with a global daily cap, which guards billed messages and is still
outstanding — see KIT-46. The limiter here guards the unbilled enquiry path
only.

**A ceiling is reported as a ceiling.** A 429 surfaces as a distinct state,
not as a delivery failure. Telling a throttled sender that their message did
not arrive would be untrue, and would route them onto an unmetered channel.

**The idempotency key holds no free text.** A repeat of the identical enquiry
inside a minute is acknowledged without a second activity. The key is the
Track and timing only, both drawn from fixed option lists, because the schema
keeps free text on `activities` so an export of `persons` cannot leak it.

**A second enquiry is a real enquiry.** A Person asking about a different Track
inside the window is recorded, not rejected. An earlier revision rejected it and
told a genuine enquirer their message had failed.
