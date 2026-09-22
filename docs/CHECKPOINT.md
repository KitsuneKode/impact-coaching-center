> **Snapshot, 11 Sep 2026.** This file records the pitch build. It is not the
> current status of the project. Current status is `docs/plans/README.md`.

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

Most of this section was answered by ICT's own Classplus storefront, which
lists their live courses, prices and feature lists. What is left:

- [ ] **Pallabi or Pallavi Neog.** ICT's own thumbnails spell it both ways.
- [ ] **"We reply the same day"** in the joining steps. Only promise this if
      ICT can keep it.
- [ ] **Old batches.** Victor 5.0, 6.0 and 7.0 are still listed on their store.
      The site shows only VICTOR 8.0. Confirm the older ones are closed.
- [ ] **Batch timings** beyond VICTOR 8.0's 8 to 10 AM.
- [ ] **PRAGATI 2027's poster claims "20+ Selections in APSC CCE 2023-26".**
      We could not verify it, and the poster is shown on the PRAGATI page.
      Either confirm it or crop that line out of the poster.
- [ ] **Kouxal already ran**, 2 to 4 September. It is still listed free on the
      app, so the site says "try" it rather than "join" it.
- [ ] **Play Store listing.** Classplus reports the Android app as delisted
      (`isAndroidDelisted: 1`) while the listing still loaded for us. The site
      links to Play in several places, so confirm which is true.

Resolved from the storefront, no longer open questions: fees, the hostel,
20 Prelims and 20 Mains mock tests, mentorship till selection, bilingual
classes, and the free workshops.

## B. Content gaps

- [x] **Real photographs of the centre.** Taken from ICT's own mock test and
      guest session clips. A photo of the building's exterior is still missing.
- [x] **Student testimonials.** ICT publishes named student reviews on
      YouTube; ten are on the site with name and batch.
- [ ] **Exterior photo of the building**, so a first time visitor can
      recognise it from the road.
- [ ] **Batch timings.** Only VICTOR8 (8 to 10 AM) and NAKSHATRA (night) are
      known. Day batch timings are missing.
- [ ] **ASSIST scholarship.** Named in the fees panel and FAQ. Get the next
      test date and what it covers.

## B1. Pages

- `/` the landing page
- `/courses` every live course, grouped by exam, with current prices
- `/courses/[slug]` one page per listed course: price and saving, the schedule
  read off ICT's poster, their feature list, teachers, a sample class, the rest
  of the track, and `Course` structured data. The older Victor 5.0 to 7.0
  intakes and the Rs 11 internship return 404 on purpose.
- `/success-stories` results sorted by how checkable they are: the APSC list,
  then what ICT published itself, then student reviews, then guest officers
- [ ] A poster wall, once ICT shares their result poster archive.

## B2. Keeping it current

Courses, prices and feature lists are snapshotted from ICT's Classplus store,
which is their LMS and their payment rail, so the site cannot quote a price the
checkout disagrees with.

- [ ] Re-run `bun run sync:courses` whenever ICT changes a price or adds a
      course, and review the diff before committing.
- [ ] Decide whether this should run on a schedule rather than by hand.

## C. Conversion

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
- [ ] **Vercel ignores our lockfile.** Their bun is 1.3.14 and `bun.lock` is
      `lockfileVersion: 2`, written by a newer local bun, so the build logs
      `Unknown lockfile version` and resolves dependencies fresh. It matched
      what we tested this time, but builds there are not pinned. Either pin
      versions in `package.json`, or install with a lockfile their bun can
      read.

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

## F2. New claims to sanity check with the owner

- [ ] **Mithu Guwala, Assam Police**, from ICT's Success Stories video. Shown
      as published by ICT, not verified. Ask for the result document.
- [ ] **Axom Dhwani** has two episodes this site deliberately does not list:
      one on whether Assamese Muslims are indigenous, one on Lower versus
      Upper Assam. Both are legitimate and both are politically charged in
      Assam. The series total does include them.
- [ ] **Izaaz Ahmed, Academic in Charge**, co-hosts the podcast and is not yet
      on the faculty strip.
- [ ] **Asha** is a batch name on student review cards but is not in the live
      Classplus catalogue. Confirm whether it still runs.

## G. Next, once the owner is in

- [ ] Course detail pages for search: "APSC coaching in North Lakhimpur".
- [ ] An Assamese version, or at least the hero and the CTAs.
- [ ] A results page, once real student material exists.
