# Launch sweep, 27 Oct 2026

One list for everything asked on 26–27 Oct. Work top to bottom; tick as each
lands with a click-through. The original messages are kept word for word at
the end.

Results: `docs/plans/2026-10-27-launch-status.md` (status table, audit,
parent's questions, blockers, what to ask ICT).

## 0. Finish what was in flight

- [x] Legacy orders migrate to the v2 shape (`convex/migrations.ts`), run locally
- [x] Order flow (paid-only orders, receipts, courier tracking, bulk moves,
      labels, WhatsApp outbox): click through checkout → pay → admin queue →
      ship → buyer timeline, then commit
- [x] Write ADR-0005 (orders exist only once paid); the schema cites it

## 1. Broken or unknown (msg 7)

- [x] Production build + `bun run smoke` on :3010
- [x] Every public and admin route: no console errors, no 500s, no hydration warnings
- [x] Recheck the 22 Oct backend review on this branch (P1 erasure vs sign-in,
      the 17 smaller items); fix what's still open
- [x] Env and config audit: what fails silently when a key is missing
      (payments off → WhatsApp ordering; no OTP transport → sends refused, pages fine)
- [x] Package versions: update all, fix what breaks, note anything held back

## 2. Marketing landing and trust (msg 5)

- [x] Hero: taller, better hierarchy, type that doesn't crowd (leading,
      `text-wrap: balance/pretty`), measure, alignment
- [x] Home: type hierarchy and rhythm across sections
- [x] Copy pass (better-writing) on home and the trust pages (results, about,
      teachers, contact, policies)
- [x] Parent's audit: can a parent answer fees, timings, results, teachers,
      location, safety, how to enrol, what's free, in under a minute?
- [~] Trust blocks: testimonials, achievements/results, classrooms and the
  building, teachers; each placed where the doubt arises (waiting on ICT's photos and bios)
- [x] "Free" is obvious from day 1: free notes, free mock/ASSIST, free counselling
- [x] H1s and headings per page (better-accessibility + better-writing)
- [x] Blog reading like Fumadocs: contents rail, headings, code/tables, prev/next
- [x] Every breakpoint: 390 phone, tablet, 1440 laptop, 1920 and 2560

## 3. Admin dashboard (msg 4, msg 6)

- [x] Audit every admin page on phone and desktop: broken, confusing, slow
- [x] Shell, overview, tables and forms modelled on shadcn's dashboard/data-table
      blocks; shadows, density, empty states
- [x] Enquiries table: faster triage, better filters, bulk actions
- [x] Traffic sources: where enquiries come from (first-touch referrer/UTM,
      stored with the lead, free) shown on the overview; PostHog stays optional
- [x] Lead quality: keep bots out of enquiries (honeypot, time trap, rate
      limit, Turnstile where it pays), flag duplicates
- [x] shadcn lint rules installed and passing (0.2.3; three new rules deferred, see launch-status §7)
- [x] Buttons: Kobra-style press feel (free components only; Pro needs ICT's
      licence), consistent across site and admin
- [x] Inspiration checked: fluidfunctionalism.com docs, vibrant.design,
      shadcn blocks, Aceternity (taste, not copy). Fluid Functionalism's two-step
      density and shared control height are now true of admin forms; Emil's
      seven tips hold (tooltips now open instantly after the first);
      vibrant.design is a gallery, nothing to adopt wholesale

## 4. SEO and discovery (msg 4)

- [x] Sitemap, robots, llms.txt, hreflang, canonical: verify on a prod build
- [x] Search Console verification by env; Google Business Profile checklist
- [x] Structured data: EducationalOrganization, LocalBusiness, Course, FAQ, Article
- [x] OG images per page type

## 5. Motion and polish (msg 4)

- [x] Find animation opportunities and fix motion that's off (Emil's 7 tips,
      invisible details), reduced motion respected
- [x] Buttons, shadows, focus states consistent (beautiful-shadows,
      make-interfaces-feel-better, emil-design-eng, apple-design)
- [x] Page transitions: React view transitions where they help (in place since 14 Oct)
- [x] React review: react-best-practices, narrow prop types, no wasted renders
      (react-doctor 53/100: no confirmed bugs; the two effect-cleanup errors are
      false positives, shadcn errors sit in the vendored reader. Complexity in
      the big editors and sequential awaits in static pages: after launch)
- [x] Routing middleware (`proxy.ts`, reviewed: locale only; headers live in next.config.ts): locale, security headers, bot paths

## 6. Reports (msg 4, msg 10)

- [x] Status table: done / left / % / blockers
- [x] Principal-engineer audit: code quality, scalability, edge cases, traffic,
      users' region and devices, content, trust, lead generation, ratings
- [x] What to focus on for the business
- [x] What to ask ICT, in one message, ordered by what blocks launch
- [x] Keep only ICT-dependent items open; everything else done and tested

## 7. Ship

- [x] Commit in milestones, push `feat/launch` (Vercel Hobby rate limit: few pushes)
- [ ] Merge to `main` and production deploy: needs the owner's go and ICT's accounts

---

## Original messages

**msg 4.** we need to discuss and do all the best thigns possible and get the parts that are broken fixed and also make sure that we ahve the best resorces teh actually keep all these runnign and merge and like keep the thigns production ready and ready to be deployed well and into production and also do we need the seo ones for google search console sitemap llms.txt and everyhgin taht is needed and better way of doign things that are cool and also importnat and looks good

Also tell me about in like a table what are done what is left and how much percent and what is done and how we are okay and what are the thigns we have currently and ahtat to work on how much left and like discuss the blockers and also lke we need to have the best ways of testimonial trust and all things audit as an user, as a parent or anyone cna the site answere all the thigns requried and also teh classrooms and eveyrhtign and achievements and everyhggin in right way and can it generate leads and also can it actaully make sense to business and which are the ways we shoudl focus

And also /interaction-design and use /interface-design for teh dashboard and shadcn and https://www.fluidfunctionalism.com/docs and https://vibrant.design/ for certain inspiration and /good-css and /frontend-design /design-taste-frontend /transitions-dev /vercel:react-best-practices /narrow-react-prop-types /vercel-react-view-transitions /vercel:shadcn /animate /find-animation-opportunities /animation-vocabulary /improve-animations and make sure we have thigns in right way and we need to get this up and runnning do it and also install and add the shadcn lint rules and all parts of it and have the best possible output and also the posthog and se if we can do one more thing -> source wise like traffic from whhere if we cna show in the dahsboard if possible and do it right and do it best practices or free ones like cherry on top and have the best kind of way and htat awy they cna do it in the best possible way right, that way we cna get beat possible thigns and also for the lead generation and possible non bot ones we shoudl focus on how to make the engquireds adn all thigns better and also improve the table and also see if we need better shadows and stuff /beautiful-shadows /make-interfaces-feel-better /emil-design-eng /vercel:routing-middleware and /convex /apple-design /vercel:nextjs

ALso use https://kobra.systems/components whicihereve woudl feel better reuse thigns and maybe use its button that feels better

Also from this blog https://emilkowal.ski/ui/7-practical-animation-tips

https://invisibledetails.com/ and this as well

**msg 10.** also as a principle engineer audit the code or the quality and design and scalibity and better practices of it and rate and all the edege cases that are missed specific to this website and also the traffic anticipated and the geogrpahic and demographic of users and how to improve those areas fully and also the contents as a product engineer see what is done and what needs impromente and as a person who wants to make it as a really good hifi website that waould bring useras and build trust from day 1 due to good quality webbsite or introduction or everything, and let them know there are free stuff and thigns and how to have thigns in the best possible way and all things that would likely to make this a possible appreciation of thigs here and iantyhign

**msg 5.** can we like increase the hiehgt of the hero like in the besat possible sense things look a little off and also heirarchy and topology of htings and better like justification like emil has in https://animations.dev/ and also with like text not leading and stuff having the text pretty css and whereever we can do the best and actually a /better-writing that would be the marketing landing and actually the trust page that works okay

**msg 6.** find all the issues in teh admin dashboard and all parts of it and making it easier more better and learning from teh best from like aceternity or shadcn official blocks and tempalte and actually good design on those thigns and work to get the best outcomes possible

**msg 7.** also find all the issues where thigns are broken and we are not aware of what we are doing and how we are doing tehme

Also update hte veasoins of all packageas and improve those works that are needed then to work with them to get the best possible outcomes with those thigns

**msg 1.** tell me what is left and what to do and complete and what are the main questions to answere and have all the ui pieces adn interactions adn design up and ready to give to the client and what do we need to ask from them and quality and things eveyrthgin … And also how to redesign certian parts keeping the current theme merging all necessary works and get thigs up and running in the wild

**msg 2.** And improve the parts and complete it to like only keep the parts which are only dependent on ict only doing all the rest and also testing certain thigns and also having the best ux and ui patterns speed and feel and accross the mobiel tablet laptopn big screens and hae best of the sections okay and running and also improve the writign h1 $better-accessibility and $better-writing and improving the blogs and how they do like how fuma docs do those shoud be good and all the engienerreignn way and thigns that would make sense right

**27 Oct.** continue and also like based on all your findings make sure to do all the best works and also like make sure thigns are mergeable and ready for thigns … improve the overall usabiility and thigns and continue until you complete all the works here listed … make the task list of all the thigns i said and do that don't miss anythign i mentioned

## 8. Round of 28 Oct (owner's review)

- [ ] Hero shader goes black on a real GPU (RTX 4050 + Intel, Chrome) after a split second
- [ ] Header: one compact cluster (search, cart, account), log-in as an icon, cart arrives gracefully
- [ ] Reels: floating bottom-right player with autoplaying YouTube Shorts (as in client-preview pulse-final)
- [ ] Pop-up: tasteful, lead-generating, never in the way
- [ ] Centre section: auto-moving carousel, drag/touch; "Classroom tour" instead of "Call the centre"
- [ ] New classroom tour page: photos, videos, parallax grid, centre (location) toggle, map
- [ ] Books shelf: hover behaves like the manga volumes (neighbours make room)
- [ ] Checkout address: PIN lookup fills district and town, landmark, courier phone, save address, collection centre choice
- [ ] Refunds: explain how they work today; owner refund from admin if needed
- [ ] Footer and other pages: improvements
- [ ] Writing pass: no repetition or filler, SEO and GEO
- [ ] ICT handover artifact: Drive folder structure, every photo, video and fact needed
- [ ] Backend flows review: R2 uploads, verification, payments
