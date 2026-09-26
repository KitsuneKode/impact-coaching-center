---
status: draft
ticket: KIT-57
spec: none
---

# Commerce and account surfaces — settled UX direction

The decisions a grilling session reached on 22 September 2026, after walking
the running site. This is the contract KIT-57, KIT-58, KIT-59, KIT-60 and the
account work build against, so that five tickets do not each invent their own
answer to the same question.

It records **decisions and their reasons**, not steps. Each ticket writes its
own plan; none of them may quietly re-open a decision here.

## The shape of the funnel

**Resources are gated on open. Books are not gated at all until checkout.**

A visitor browses `/books`, opens a sample and reads it without ever being
asked who they are. The verification gate falls at exactly two moments:
opening a Resource, and starting checkout.

Rejected for Resources: gating the list, which asks for a phone number before
showing anything worth one; and gating from the second document, which halves
capture among the most interested readers and needs anonymous-session tracking
that does not exist.

The gate uses the intercepting-route modal already built for `/login`, so it
opens _over_ the thing the person reached for. Navigating them away loses it.

## Identity

**OTP only. No password.** Reaffirms ADR-0001, re-examined on 22 September
because the cost argument for a password is real: once KIT-46 lands, every
code is a billed WhatsApp authentication template.

It still loses. A password cannot stand alone here — setting one needs the
number verified first, and with no email on file "forgot password" can only be
recovered by an OTP. The whole OTP rail runs either way, so a password adds
hashes, a reset flow and a breach surface while removing nothing.

The real complaint behind "OTP every time" was that session lifetimes were
never set. Fixed in `df03b13`: 90 days, sliding, refreshed at most daily.
Verified against the session row, not assumed.

**Name is required, first and last, immediately after verification.** Not
skippable. The person has just proved their number and is already in a
form-filling frame of mind; that momentum does not return. It is also most of
what makes a lead callable — an inbox of bare numbers is an inbox staff ring
blind.

`persons.name` is a single `v.string()` today. Splitting it is a schema change
and the first real exercise of KIT-55's revision convention.

**The questionnaire is three fields, skippable, and resumable.** Target exam,
attempt status (first attempt or repeater), preferred batch. Each earns its
place by changing what staff do; anything more is a survey.

Resumption presents as a **dismissible banner**, not a blocking interstitial —
returning leads should not be punished for coming back — and not inline at the
next relevant moment, because a person who only ever reads Resources would
then never be asked. A banner also keeps "skipped" and "not yet seen"
distinguishable in the data, which neither alternative does.

## Books and checkout

**A real cart.** Not one book at a time: one courier charge across three books
is the difference between an order and an abandoned one.

There is **no shadcn cart or checkout block** — searched the registry on
22 September; the "cart" hits are fuzzy matches on `chart`. This is a build.

**Cart lives in `localStorage` until sign-in, then merges server-side.**
Server-side from the first add needs anonymous-session infrastructure that
does not exist and writes a row for every passer-by. Merge rule: **union,
keeping the newest quantity per title.** Never silently discard what someone
added before logging in.

**Checkout requires sign-in.** Normally a conversion killer; it is not one
here, because signing in _is_ entering a mobile number, which a guest checkout
would have to collect anyway to confirm the order. Guest checkout would be the
same friction wearing a different hat, plus a second identity path to keep
correct. It is also what makes order history possible: a guest order has
nothing to attach to.

This is where book buyers become leads, with no extra mechanism: checkout
creates or finds a Person, exactly as opening a Resource does.

## Reading

**The sample preview is the same Reader as Resources**, pointed at an approved
page range. Two reading surfaces means two sets of bugs, two loading states,
and two answers to "why does this one feel different".

ADR-0003 governs the mechanism and is not re-opened: pre-rasterized page
images, no PDF engine in the browser, no download. The copy must never imply a
sample is protected — ADR-0003 is explicit that serving images does not make
anything private.

## Account area

**`/account`, covering orders, the person's own details, and saved
addresses.** Not orders alone: "where is my book" with no page to point at
becomes a phone call to the people running the centre.

**Avatars are initials only.** Once first and last names are captured,
initials are a real avatar rather than a placeholder — the "45" observed in
the header on 22 September was only ever a symptom of the missing name.
Uploads need Convex File Storage (none exists in this project), validation,
resizing, and an answer to who takes down what a student uploads at 2am. That
is its own ticket, not a line item here.

## Why a Person is here: behaviour, not a survey question

A Person who downloaded a free PDF and a Person who paid for a book are not
the same lead, and staff working the queue need to tell them apart before they
pick up the phone. The buyer has already proved they will pay ICT money; the
reader has proved only curiosity.

**This is not a questionnaire field.** Asking "what brought you here" returns a
self-report, collected once, immediately stale, and skippable. The activity
trail returns the truth, continuously, for free. A Person who has an order is a
customer whatever they once ticked, and a Person with six resource opens and no
order is a reader however they described themselves in September.

So provenance is **derived from `activities`**, which already exists with a
`kind` union and a `by_person` index. The kinds that matter get added as the
features that produce them land:

| Kind               | Written when            | What it tells staff                               |
| ------------------ | ----------------------- | ------------------------------------------------- |
| `enquiry`          | the form is sent        | they asked a question a document could not answer |
| `resource_open`    | the gate is passed      | free-resource funnel; interest, not commitment    |
| `sample_viewed`    | a book sample is opened | considering a purchase                            |
| `order_placed`     | checkout completes      | **they have paid ICT money**                      |
| `whatsapp_handoff` | the handoff fires       | conversation moved off-site                       |

Two things follow for the inbox, and both are the Convex lane's to provide
because the frontend must not derive them (§0): a **first-touch** value, which
never changes and answers "how did we meet", and a **strongest-signal** value,
which does change and answers "what have they actually done". A single "source"
string collapses those into one field that is wrong for one of the two
questions.

`persons.source` is not that field and should not be repurposed: it records
which code path created the row (`verification`, `enquiry`, `dev-seed`), which
is an implementation detail, not a sales signal.

The questionnaire stays three fields about **them** - target exam, attempt
status, preferred batch. Nothing in it asks about us.

## Open, and deliberately not decided here

- **Price at add versus price at pay.** With no stock counts this is the
  cart's one real correctness question. Leaning toward charging what the buyer
  saw, but it is a decision, not a default.
- **Cash on collection.** ADR-0002 records it as awaiting owner review. Given
  ICT sells at the centre, it may matter more locally than Razorpay.
- **Address shape**, payment-failure states, and the admin side of orders.
  Each belongs to KIT-59 or KIT-60.

## Constraints the implementing tickets inherit

- `/shipping` and `/refunds` are published and say, in ICT's name, that the
  site does not take online orders and that policy will appear there before
  ordering opens. They are ICT's to supply; the pages stay as they are until
  then.
- No stock counts anywhere (ADR-0002, KIT-57).
- Courses never take payment here (ADR-0002). Books and Courses share no cart.
