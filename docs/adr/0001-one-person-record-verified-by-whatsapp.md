# One Person record, verified by WhatsApp OTP

ICT's audience identifies itself by mobile number, not email, so a Person is keyed by their Indian mobile number and proves control of it with a one-time code delivered over WhatsApp. There is one record per phone number: an anonymous enquirer, a verified account holder and a book buyer are the same Person, with lead status and `verifiedAt` as fields rather than separate tables. Free Resources require Verification; Enquiries do not, because gating the top of the funnel costs a billed message and a drop-off to learn what a staff callback establishes anyway.

## Considered options

Splitting `leads` from `users` and linking them was rejected: it forces every staff screen to reconcile "is this enquiry the same human as this account?", which is the duplication this decision exists to remove. Clerk was rejected earlier for cost (see §10 of the growth-platform spec); its phone OTP requires a paid production plan exceeding the entire maintenance retainer.

## Consequences

This **supersedes the flow written in `Website Req.pdf`**, which specifies a name + email popup with phone optional, and an admin that views "leads (name + email)" to "build email list". The client has since asked for WhatsApp/phone verification instead. Email is optional and is not a primary channel, so the list ICT receives will be WhatsApp numbers rather than email addresses — a deviation from their written brief that must be recorded in a countersigned change-note before build.

Because Better Auth's core requires a unique email, verified Persons are created with a synthetic placeholder address. Account recovery is therefore phone-only, and a Person who loses their number needs a staff-assisted, audited change.
