---
status: done
ticket: KIT-53
spec: docs/superpowers/specs/2026-09-17-ict-growth-platform-design.md
---

# One acceptable verification code per phone

The phone plugin inserts a verification row in its own Convex mutation after
`lib/phone-auth.ts` deletes the previous one. `@convex-dev/better-auth` 0.12.5
sets `transaction: false`, and Better Auth's consume lock is a process-local
`Map`. Neither is a cross-instance guarantee.

Acceptance moves to `otpSendLeases`, one row per phone, mutated with Convex OCC:

- `claimOtpSend` spends the existing ceilings and takes a generation only when
  no unexpired send is in flight. An overlapping claim returns `inflight` and
  does not touch the live code hash or the ceilings.
- `commitOtpCode` stores an HMAC of the code only for the generation that still
  holds the lease. The raw code is never a mutation argument.
- `verifyOtpCode` is the only accept path (`verifyOTP`). A match clears the hash.
- Delivery failure calls `abortOtpCode`. A crash after commit leaves the hash
  until it expires or the next successful commit. An expired lease can be taken
  over; the stale holder cannot commit.

Hosted WhatsApp OTP stays off (KIT-46). The lease is 20 seconds, which covers
the local logger and must be raised above the provider timeout before that
transport is enabled.

## Steps

- [x] Lease table and claim/commit/release/abort/verify mutations
- [x] Phone plugin uses the lease hash instead of its verification row
- [x] Existing send-ceiling tests follow `claimOtpSend`
- [x] Overlapping send, stale generation, replay and delivery failure covered
- [x] Duplicate lease rows collapse onto the live code
- [x] A slow send reports expired, not overtaken; a release failure after delivery still accepts the code
- [x] Password, email, and social routes are refused before any write. Sign-in is a WhatsApp code only
