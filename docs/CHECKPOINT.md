# Checkpoint: pitch build 1

**Date** 11 Sep 2026
**Live** https://impact-coaching-center.vercel.app (noindex, not ICT's domain)
**Tag** `checkpoint-01-pitch`

A one page site for Impact Career Tutorials, built to pitch. Light, calm and
editorial after kobbe.io, typeset in Inter, with every name, face, batch and
number taken from ICT's own public channels.

## What is in it

- Hero: two tone paragraph, amber highlighter, the five real teachers
- Verifiable numbers, each linking to the page that proves it
- Results: two APSC CCE 2022 officers plus real Play Store reviews in a rail
- Courses: three cards with real batches, sample classes and per course CTAs
- Fees: what one fee covers, and an honest "ask for the figure" path
- Free classes, FAQ, joining steps, lead form, closing CTA
- Lead capture through a server action, then a prefilled WhatsApp handoff
- Mobile call and book bar

## Verified at this checkpoint

- `bun run lint`, `bun run typecheck`, `bun run build` all clean
- Desktop (1440) and mobile (390) screenshots reviewed
- Lead form tested on the live deployment: validation, success, WhatsApp text
- Share image loads from the live URL, 200 and `image/jpeg`
- `noindex` plus `Disallow: /` confirmed live
- Zero em dashes, one `<h1>`, all section anchors resolve

---

# What still needs checking

## A. Owner sign off, content truth

Everything here is on the page but not published by ICT. See `toConfirm` in
`lib/brand.ts`. Anything the owner rejects must come off before launch.

- [ ] **Free demo class.** The whole page converts on this offer. It is our
      proposal. If ICT does not run demo classes, change `offer.cta` in
      `lib/brand.ts` and every button follows.
- [ ] **Hostel.** Claimed in ICT's Feb 2025 reel, repeated in the fees list
      and the FAQ. Confirm it still exists.
- [ ] **20 Prelims and 20 Mains mock tests.** Same reel, same age.
- [ ] **Mentorship until selection.** Same reel.
- [ ] **"We reply the same day"** in the joining steps. Only promise this if
      ICT can keep it.
- [ ] **Pallabi or Pallavi Neog.** ICT's own thumbnails spell it both ways.
- [ ] **Faculty titles.** Rituraj Sir is shown as "B.Tech, former Bank PO"
      from his own thumbnail. Earlier notes said NIT Silchar. Confirm.
- [ ] **Raheef Sir's credentials.** "NIT Silchar, MS Germany" is self
      reported on Instagram and is currently not shown on the page.

## B. Content gaps

- [ ] **Fees per course.** Set `courses[].fee` and the cards and the fees
      panel switch from "Get the fee" to the number automatically.
- [ ] **Real photographs of the centre.** There is not one image of the
      building, the classroom or the library. For a walk in business this is
      the biggest remaining trust gap.
- [ ] **Instagram student testimonials.** ICT's strongest proof. Needs a
      logged in export.
- [ ] **Batch timings.** Only VICTOR8 (8 to 10 AM) and NAKSHATRA (night) are
      known. Day batch timings are missing.
- [ ] **ASSIST scholarship.** Named in the fees panel and FAQ. Get the next
      test date and what it covers.

## C. Conversion

- [ ] **`LEAD_WEBHOOK_URL` is not set.** Leads currently reach the Vercel
      function log only. Point it at a Google Sheet, Zapier or Slack before
      showing the owner the form.
- [ ] Test that a submitted lead actually arrives wherever it is pointed.
- [ ] Confirm both phone numbers ring, and that WhatsApp is on
      +91 86380 61175.
- [ ] Decide who answers enquiries, and how fast.
- [ ] Add click tracking so enquiries can be attributed to a course.
- [ ] One fake lead from testing sits in the logs: "Test Visitor",
      98765 43210.

## D. Technical and launch

- [ ] **Domain.** `impactcareertutorials.in` had an expired certificate and
      the bare domain did not resolve. Fix before pointing anything at it.
- [ ] At launch set `NEXT_PUBLIC_SITE_URL` and `SITE_INDEXABLE=true` in
      Vercel, otherwise the site stays invisible to Google by design.
- [ ] Submit the sitemap to Google Search Console.
- [ ] **Create a Google Business Profile.** None was found. For a local
      coaching centre this is usually the largest single source of enquiries,
      larger than the website.
- [ ] Check the link preview renders in WhatsApp, the channel this will
      actually be shared through.
- [ ] Confirm the deployment is production on Vercel, so the URL is stable.

## E. Quality passes not yet run

- [ ] **Performance on a low end Android**, throttled. The likely costs are
      the five hero portraits and the stacked backdrop blur at the screen
      edges.
- [ ] **Lighthouse**, all four categories.
- [ ] **Keyboard pass**: every link and control reachable, visible focus, the
      mobile menu traps and restores focus, Escape closes it.
- [ ] **Screen reader pass**, especially the counting numbers, the testimonial
      rail and the form errors.
- [ ] **Contrast audit.** Grey on near white is the risk, particularly the
      muted second half of every lede.
- [ ] **Real device check** on a mid range Android and an iPhone. Safari has
      not been tested at all.
- [ ] **Reduced motion**: confirm the page is still readable and complete.
- [ ] Test with a slow connection and with images blocked.

## F. Housekeeping

- [ ] Remove unused dependencies: `lenis`, `next-themes`, and `shadcn` as a
      runtime dependency.
- [ ] Remove nine unused files in `public/` (four brand images, five
      thumbnails).
- [ ] The Assamese font is loaded but nothing uses it. Either use it or drop
      it.
- [ ] `docs/research-notes.ts` is kept for provenance and compiles with the
      project. Move it out of the TypeScript build if it becomes noise.

## G. Next, once the owner is in

- [ ] Course detail pages for search: "APSC coaching in North Lakhimpur".
- [ ] An Assamese version, or at least the hero and the CTAs.
- [ ] A results page, once real student material exists.
