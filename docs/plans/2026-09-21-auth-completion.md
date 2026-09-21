---
status: partial
ticket: KIT-53 / KIT-54
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# Bounded auth completion

Isolated baseline: `e69b4d7`. Resumed 22 September 2026. This slice owns the
phone verification flow and installed-adapter concurrency investigation. Shared
admin, schema, provider accounts and deployment belong to the integration owner.

## Steps

- [x] Add failing behavior regressions at the phone verification flow boundary:
      deferred send for an edited phone, overlapping submissions, rejected transport,
      exact acknowledged-phone verification, and disposal during an active request.
- [x] Use that flow in the existing form; preserve number/code after recoverable
      failures, offer safe number correction, and keep return paths internal.
- [x] Inspect persistent OTP lifecycle against the installed adapter and record
      the safe remaining design instead of claiming an in-memory lock solves it.
- [x] Run focused tests, typecheck, repository checks and production build; record
      local evidence separately from unrun real-provider/runtime gates.

## Concurrency evidence and boundary

Installed Better Auth 1.6.33 sends by creating a verification row, then calling
sendOTP (`dist/plugins/phone-number/routes.mjs:149-165`). Its verifier consumes a
row and recreates it on an incorrect code (`routes.mjs:471-494`). The installed
Convex component 0.12.5 adapter declares `transaction: false`
(`src/client/adapter.ts:201`) and runs separate component mutations.

The current hook deletes before the plugin inserts. Atomic replacement alone
would not serialize a concurrent verification restoring an older code. A finite
lease without fencing also allows an expired holder to resume. A non-expiring
phone lock without an approved recovery mechanism can permanently deny access;
this slice deliberately does not introduce one. Hosted delivery remains refused.

Remaining KIT-53 design: qualify a persistent per-phone operation protocol
covering both send and verify, with generation fencing enforced transactionally
on every relevant verification mutation; define recovery, failed delivery,
expiration, retries and stale-holder behavior before implementation. Prefer an
upstream-supported atomic lifecycle or a locally configured component adapter
extension over overriding the plugin verifier. Demonstrate overlap across
separate auth instances and real Convex transactions, not only memory tests.

## Runtime gates still required

Real local cookies and anonymous/public rendering; actual Convex client-address
visibility; role-sensitive session lifetime; hosted sender/Turnstile qualification;
and persistent resend/verification concurrency. No provider or hosting enablement
is part of this change.

## Local result — 22 September 2026

The bounded form fix is complete; KIT-53 persistent concurrency and KIT-54 real
runtime qualification remain open. Seven behavior tests cover deferred results,
phone correction, duplicate submissions, rejected requests, exact normalized
phone association, unmount navigation suppression, code validation and cooldown.
The initial test run failed before the flow module existed; tests pass against
the implemented flow. Existing plugin tests are preserved; their sequential
resend test is now named accurately rather than implying concurrent safety.

The form uses the flow through React's external-store subscription. Verification
keeps the acknowledged phone stable, errors retain input, number correction
restores keyboard focus, and successful navigation uses the existing validated
return-path helper with `router.replace`. No credentials, deployments, backend
schemas or provider settings changed. The test transport is an asynchronous
boundary fake; these tests do not claim browser or real-provider integration.

Validation on isolated baseline `e69b4d7` plus this change:

- `bun run check`: pass; 216 tests, 501 assertions, format/lint/types clean.
- `bun run build`: pass; 25 static pages generated and sign-in/auth routes built.
- Existing expected test logs include the deliberate Person callback failure and
  synthetic local OTP fixture; neither is a production verification result.

Guidance read: installed Next.js Form and useRouter docs. The modern-web-guidance
search found no sufficiently relevant async-race guide; no unrelated pattern was
introduced. No browser, live cookies, remote CI, deployment or hosted OTP checks
were run.
