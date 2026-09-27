---
status: in-progress
ticket: KIT-67, KIT-66
spec: docs/plans/2026-09-27-next-sessions.md (section D)
---

# Four landing-page prototypes

Branch `feat/landing-prototypes`, worktree `.worktrees/landing-prototypes`.
Routes under `/prototypes` (noindex, no site chrome), one full landing page
each. The seven `/redesign` concepts were judged too generic; this set starts
from four things an aspirant already knows by heart instead of from a
navy-and-gold mood, and none of the four may look like any of the seven.

Outcome: `/prototypes` lists four complete, distinct, truthful landing pages
that pass `bun run check` and `bun run build`, verified by screenshot at 390,
768 and 1440 px.

## Shared rules (every prototype)

- **Facts only.** Every number, name, price, timing, quote and photograph
  comes from `app/prototypes/_data.ts`. No invented students, seat counts,
  deadlines, rankings, ratings or testimonials. Copy may be rewritten; claims
  may not. The two APSC officers "prepared at ICT"; never "ICT produced".
- **Assets are what they are.** YouTube stills (`/yt/*.jpg`, 1280x720) are
  loud thumbnails with baked-in text: show them as video thumbnails inside a
  frame with a play affordance, never as full-bleed photography or with text
  over them. Campus photos (`/campus/*.jpg`) are 405x720 portrait phone frames:
  use as tall columns or a filmstrip, never stretched landscape. Faculty
  portraits are ~380x420 cut-outs on dark blue: cap at ~280px wide, and on a
  light page put them on a dark tile that matches their own background.
  Course covers (`/courses/*.png`, 800x600) are posters: show as posters.
- **Structure.** About 8 to 9 sections: hero, proof, results/officers, faculty,
  courses+fees (may merge), batches/timetable, campus, FAQ, enquire. At least
  4 different layout families; no layout family twice; max 2 consecutive
  image+text splits. Hero fits the first viewport at 1440x900 and 390x844:
  headline ≤ 2 lines desktop, subtext ≤ 20 words, one primary CTA
  (`offer.cta`, "Join a free workshop", to `whatsapp`) and one secondary
  (call, `tel`). One label per intent across the page.
- **No eyebrows.** No small uppercase tracked label above a heading, anywhere.
  No section numbers. No gradient text. No glass as decoration. No cards with
  icon+heading+text as the page skeleton. No nested cards. No `transition-all`.
  No pure-black shadows. No purple. No Inter, Fraunces, Instrument Sans,
  Space Grotesk, Playfair, DM Sans, Outfit, Plus Jakarta.
- **Type.** Fonts via `next/font/google` scoped to the page with a CSS
  variable (see `app/redesign/7/page.tsx` for the pattern). Display ≤ 6rem,
  tracking ≥ -0.03em, body measure 60–72ch, `tabular-nums` on every number
  that lines up (prices, times, views, serials).
- **Colour.** One committed strategy per page, stated in a comment at the top
  of the file. Contrast: body ≥ 4.5:1, large ≥ 3:1. Secondary text on a
  coloured surface is tinted from that surface, never grey.
- **Motion.** One authored moment on load (the hero), CSS-only so it paints
  before hydration; scroll reveals only where they explain structure; hover
  and `:active` (scale 0.97–0.98) on every pressable; custom easing
  `cubic-bezier(0.23, 1, 0.32, 1)`; durations ≤ 300ms for UI, hero moment may
  be longer; nothing enters from `scale(0)`. Honour `prefers-reduced-motion`
  (the global rule collapses durations; still make sure nothing depends on
  animation to be readable).
- **Browser surfaces are themed.** `::selection`, focus ring (2px outline,
  offset, in the page's accent, never removed), underline offset on links.
- **Semantics.** One `h1`. `<header>`, `<main>`, `<section>` with `aria-label`
  or heading, `<footer>`. Decorative icons `aria-hidden`. External links
  `rel="noreferrer noopener"`. Icons from `@tabler/icons-react` only, one
  stroke weight per page. Targets ≥ 44px.
- **Responsive.** Mobile first. Every grid declares its `<768px` collapse in
  the same component. No horizontal scroll at 320px except intentional
  snap-scroll strips (`overflow-x-auto snap-x`, with `[scrollbar-width:none]`).
- **Files.** `app/prototypes/<slug>/page.tsx` (server component, exports
  `metadata`), plus at most one `_client.tsx` leaf with `"use client"` if the
  page needs interactivity beyond CSS. Render `<PrototypeSwitcher
current="<slug>" />` last. Import data from `../_data`.
- **Own header and footer** per page (the site chrome is off on `/prototypes`):
  a nav ≤ 72px with logo (`/brand/ict-logo-tight.png` or `/brand/ict-mark.png`
  via `next/image`), 3–4 anchor links, phone, primary CTA. A footer with the
  address (`place`), phones, email, YouTube/Instagram/Facebook/Play links,
  and a plain line "Prototype for review. Not the live site."

## Prototype 1: Timetable (`/prototypes/timetable`)

**World.** The departures board at a bus stand or railway station: rows of
destinations and times in a tabular grotesk, one flap of colour for the next
departure. ICT's real mechanism is that every batch has a printed hour
(8 to 10 AM, 12 to 2 PM, 6 to 8 PM, 4 to 5:30 PM) and a working person picks
the one they can keep. The page is that board.

**Colour: Restrained.** Ground `#F4F3EE` (warm off-white), ink `#101828`,
board surface `#101828` (the one dark object on the page, framed with radius
16, never a full-bleed dark band), board text `#F4F3EE`, accent amber
`#E9A23B` used only on the board (the "next departure" row flap and the live
dot) and on `::selection`. Muted text `#5C6270`. Rules `#101828` at 10%.

**Type.** `Archivo` (variable, `axes: ["wdth"]`) for everything; display at
`font-stretch: 112%` (via `[font-stretch:112%]`), semibold 600 with tracking
-0.02em; board rows in `font-stretch: 90%`, tabular nums. Body regular 400.

**First viewport.** Nav. Below it, a two-part hero: left 5/12, headline
"Pick the hour you can study." (that is the h1), one line lede "Morning,
day or evening batches on DC Bungalow Road, and the same class on the ICT
app if you cannot come." CTAs. Right 7/12: the board, a dark framed panel
listing `timetable` rows: course name · exam · time · days/note · price,
with the row whose `note` starts with "Batch started" most recently (VICTOR
8.0) carrying the amber flap and a small live dot with the note text. On load
the board rows arrive one after another (translateY 8px + opacity, 60ms
stagger, ease-out) and the headline arrives first. On mobile the board
stacks under the copy full-width with rows as two-line entries; the time is
the largest thing in each row.

**Sections, in order, each a different family.**

1. Hero + board (split).
2. Proof: a single hairline-ruled row of the four `proof` figures, number
   large in stretched Archivo, label beneath, each a link. No cards.
3. Faculty: a filmstrip of the five portraits on dark tiles (aspect 4/5,
   ~220px wide desktop), snap-scroll on mobile, five across desktop. Name,
   subject, and "Watch a class" link to their lecture per person. Heading
   "The teachers on the board, and where to watch them."
4. Results: two full-width ledger rows for `selections`, serial number set
   large and tabular at left ("No. 46", "No. 31"), name and post, the quote
   as a wide paragraph, and one line beneath both: "APSC CCE 2022, result
   dated 17 January 2024, checked against the official list" linking to
   `links.apscResultPdf`. Then `officers` (guest sessions) as a compact
   five-item list with thumbnails at 96px, name, role, detail.
5. Courses: three columns (stack on mobile), each a poster cover on top
   (aspect 4/3, radius 16), name, covers, duration, price with struck MRP,
   the faculty initials row, link to the course. Under them `included` as
   a two-column checklist with hairlines. One line for `fees.scholarship`
   text: "Scholarships through ICT's ASSIST test."
6. Campus: a horizontal strip of the six `campus` photos as tall frames
   (aspect 9/16, 240px wide), captions below, snap-scroll everywhere, with
   the heading "The room on DC Bungalow Road."
7. FAQ: two-column definition list (question left col 4/12, answer right),
   hairline between rows. No accordion.
8. Enquire: the board motif again but light: a framed panel with the
   `joining` three steps as three board rows, then WhatsApp and call CTAs.
   Footer.

**Signature detail.** The amber flap on the live row and the live dot
pulse (opacity 1 → 0.4, 2s, ease-in-out, infinite; disabled under reduced
motion). Nothing else moves continuously.

## Prototype 2: Channel (`/prototypes/channel`)

**World.** The viewing room. ICT's proof is that you can watch the faculty
teach before paying: 16.2K subscribers, 150+ hours, real view counts. The
page is a dark room built around the video, in the register of a premium
streaming app, not a YouTube clone. Dark because the scene is a student
watching a lecture on a phone at night.

**Colour: Committed dark.** Ground `#0B1020` (deep navy-black), raised
surface `#121A2E`, hairline `rgba(243,244,248,0.10)`, text `#F3F4F8`,
secondary `#A9B1C6` (tinted from the ground, not grey), gold `#E8B04B` as
the single accent: primary CTA fill (text `#0B1020`), the play glyph, view
counts, and one underline. Verified green `#3DBB5B` only on the two APSC
serials. A soft radial light source top-left (`radial-gradient(80% 60% at
20% 0%, #182446 0%, transparent 60%)`) on the hero only.

**Type.** `Bricolage_Grotesque` (variable, `axes: ["opsz", "wdth"]`) display
at weight 600, tracking -0.025em, optical sizing auto; body in
`Hanken_Grotesk` 400/500. Numbers tabular.

**First viewport.** Nav with gold CTA. Hero: headline h1 "Watch the class
before you pay for it." over two lines, lede "Full lectures by the same
teachers who take the batch, free on the ICT channel and app." CTAs:
primary "Join a free workshop", secondary "Call +91 86380 61175". Right or
below: the most-watched lecture (`classes[0]`, Pallabi Neog, 3.4K views) as
a 16/9 frame, radius 16, the thumbnail inside with a 64px gold play disc and
a lower-third strip (title, by, views) inside the frame. The frame links to
YouTube. On load the frame scales from 0.96 and the headline lines arrive
with a 40ms stagger. On mobile the frame comes first, then the copy.

**Sections.**

1. Hero (copy + player).
2. Channel strip: the four `proof` figures in one row separated by
   hairlines, gold numerals, link per figure.
3. Lectures: an asymmetric grid of `classes` 1–6 (the first already used
   in the hero, so start at index 1): one 2x2 tile plus four 1x1, thumbnails
   in frames with a small play disc, title, by, views. Mobile: single column
   with the first tile larger.
4. Faculty: five portraits in a row on the raised surface, portraits on
   their own dark-blue backgrounds (they will blend, which is intended),
   name, subject, note; each links to their lecture. Heading "The people in
   the videos are the people in the room."
5. Results: a two-column panel for `selections`: left the two names with
   posts and serial in green tabular numerals ("Serial 46"), right the two
   quotes stacked. Source line to the PDF. Beneath, `officers` as a
   horizontal strip of five 16/9 thumbnails with name and role (Bijoyee
   Bartalaap sessions), heading "Serving officers who came to talk to the
   batch."
6. Courses and fees: three rows (not cards), each a full-width hairline row
   with poster at left (aspect 4/3, 160px wide desktop), name, covers,
   duration, timing (`when`, `days`), price with struck MRP, link. Stack on
   mobile with the poster above. Then `included` as a single wrapped list of
   chips with hairline borders.
7. Podcast: `podcast` name, hosts, `seriesViews` compact, and the top three
   episodes as 16/9 thumbnails with title, guest, views. One line of copy:
   "Axom Dhwani is the most watched thing on the channel."
8. FAQ as a plain list with question in 500 weight and answer beneath,
   hairlines, no accordion.
9. Enquire: a gold-bordered panel with the `joining` steps as three short
   paragraphs and the two CTAs. Footer.

**Signature detail.** Hovering a thumbnail frame lifts it 2px and brightens
it from 0.9 to 1 opacity, play disc scales 1 → 1.06, 200ms ease-out. The
hero player frame has a 1px inner highlight (`inset 0 1px 0
rgba(255,255,255,0.08)`) so it reads as glass in a dark room.

## Prototype 3: Gamusa (`/prototypes/gamusa`)

**World.** Assam first. The gamusa is the white cotton cloth with a red
woven border that every Assamese household owns and offers to a guest or a
teacher. ICT teaches in Assamese, runs Axom Dhwani, and its students are
sitting for Assam's own examinations. The page uses the gamusa's two colours
and its woven border band as the one motif: crisp vector geometry (a
repeating row of small red diamonds/chevrons, 8–12px, in an SVG pattern), as
a thin band at the top of the page and between a few sections. No floral
illustration, no photographic textile.

**Colour: Committed.** Cream `#F7F3EA` ground, gamusa red `#B3261E` carrying
about 40% of the page (the hero field, the enquire field, the border bands,
primary CTA), ink `#141414`, red-tinted secondary on red surfaces `#F5D6D2`,
muted on cream `#6B655C`, hairline `#141414` at 12%. Verified green is not
used here; serials are set in ink.

**Type.** `Epilogue` (variable) display at 600–700, tracking -0.03em, wide
and confident; body `Epilogue` 400. Assamese script is NOT used in copy
(unverified wording would be a content error); the Assamese-ness is in the
colour and the border, not in invented text.

**First viewport.** A red field from the nav down to the fold. Nav sits on
the red (cream text, cream outlined CTA). h1 in cream: "Assam's exams,
taught in Assam." Lede: "APSC, ADRE, Assam Police and banking batches in
North Lakhimpur, by teachers who sit the same syllabus with you." Primary
CTA cream-filled with red text; secondary cream outline. To the right on
desktop, a tall column of two campus photos (`campus[0]`, `campus[3]`),
aspect 9/16, radius 16, offset from each other by 48px vertically so they
read as a pair, overlapping the fold and continuing onto the cream below.
On mobile the photos become a two-up strip below the copy. The border band
runs along the bottom edge of the red field. On load the red field is
already there; the headline and photos arrive (opacity + 12px), photos 120ms
later.

**Sections.**

1. Hero (red field, copy + photo pair).
2. Proof: the four figures set as a single ink sentence-row on cream, big
   numerals, label, hairline underneath, links.
3. Results: the two `selections` as two large stamps, red rule around a
   cream box (1px, radius 16), the serial as the biggest type in it,
   name, post, quote. Beneath in one line the source. Then `officers` in a
   snap-scroll strip of five portrait-cropped 16/9 thumbnails at 200px,
   name and role.
4. Faculty: a five-column row, portraits inside red-outlined frames on a
   dark tile (their own background), name, subject, "Watch a class". Heading
   "Teachers you can watch before you meet."
5. Courses: a horizontal snap-scroll strip of the three poster covers at
   320px wide desktop with name, exam, timing and price beneath each; this
   is the only horizontal-strip section on this page. `included` as a
   two-column list under it.
6. Joining: the three `joining` steps as a vertical timeline with a red
   line and red dots, verb in 600, body beneath. Border band above.
7. Campus: a 3x2 grid of the six campus photos (aspect 9/16, radius 16) on
   desktop, 2x3 on mobile, captions beneath.
8. FAQ: single column, question 600 and answer 400, hairlines.
9. Enquire: red field again, border band on its top edge, headline "Come
   and sit in on a class.", the two CTAs cream, address and phones in
   cream, footer links inside the same field.

**Signature detail.** The primary CTA has a cream fill and on hover the
fill slides (clip-path inset from right, 220ms ease-out) to reveal an ink
fill with cream text; `:active` scale 0.98. The border band is a single
`<svg>` pattern reused via a small component, never an image.

## Prototype 4: Answer sheet (`/prototypes/answer-sheet`)

**World.** The OMR answer sheet and the question paper. ICT's mechanism
here is testing: 20 Prelims and 20 Mains mocks, Warrior mock discussions,
the ARJUNA mains series, a hall full of students writing (real photos).
The page is laid out like an examination paper: numbered questions, a
hairline grid, one instruction-green ink, generous margins, monospace only
where a real measurement sits (times, prices, serials, views).

**Colour: Restrained.** Paper `#FBFBF9`, ink `#1B1F27`, muted `#6A6F7A`,
grid hairlines `#1B1F27` at 8% as a subtle 24px dotted/ruled background on
the hero and FAQ only (a real answer sheet has ruled lines; nowhere else),
green `#2FB04A` (the logo's bars) as the single accent: filled OMR bubbles,
the primary CTA, verified serials, `::selection` at 30%. No amber, no navy.

**Type.** `Geist` for display and body (display 500, tracking -0.025em,
up to 5rem), `Geist_Mono` for every measured value and for the question
numbers ("Q1.", "Q2."). Tabular figures everywhere.

**First viewport.** Nav ruled underneath by a hairline. Hero on the ruled
paper: h1 "Sit the test before the test." Lede: "Twenty Prelims and twenty
Mains mocks inside the APSC course, discussed in class and recorded on the
app." CTAs. Right of the copy on desktop, an OMR block: a real 5x8 grid of
bubbles (40 circles, 1px ink outline, radius full) with about nine filled
green in a plausible scatter, labelled beneath in mono "Warrior mock test
III, discussion" linking to that lecture (`classes` where id is
PcIFQy3R_HA). On load the filled bubbles fill in sequence (opacity, 40ms
stagger, ease-out) after the headline. On mobile the OMR block sits under
the CTAs at 60% width.

**Sections.**

1. Hero (ruled paper, copy + OMR block).
2. Proof as four instruction lines on one ruled row: mono numerals, label,
   link. Hairline above and below.
3. Results as an answer key: a two-row table with columns Serial · Name ·
   Post · Examination for `selections`, serials in green mono, and the
   `publishedStories` line beneath with "From ICT's own Success Stories
   video" as its qualifier; source link to the PDF. Then `officers` as a
   numbered list (mono "1." to "5.") with 96px thumbnails.
4. Faculty as an invigilator roster: five rows, portrait 72px on a dark
   tile at left, name, subject, note, "Watch a class" link at right,
   hairlines between. Not cards.
5. Courses as a paper table: three columns (stack on mobile), poster cover
   at top (aspect 4/3), name, exam, covers, duration, timing, price mono
   with struck MRP, link. Then `included` as a checklist where each check
   is a small filled green bubble.
6. Mock hall: the two mock-hall campus photos (`campus[0]`, `campus[1]`) as
   two tall frames side by side with captions, and to their right a short
   paragraph and the Warrior mock discussion lecture thumbnail; heading "A
   hall, a paper, a clock."
7. FAQ as the question paper: mono "Q1." to "Q8." in green, question 500,
   answer 400, on the ruled paper, two columns on desktop.
8. Enquire as the candidate details box: a ruled panel with the `joining`
   three steps as numbered instructions, and the two CTAs. Footer.

**Signature detail.** Hovering a course column or an officer row fills the
adjacent bubble green (scale 0.6 → 1, 160ms ease-out); `:active` scale
0.98 on CTAs. The green CTA has ink text? No: green `#2FB04A` on white with
white text fails contrast; the primary CTA is ink-filled with paper text,
and green is reserved for the bubbles, serials and a 2px underline on the
secondary link. State this in the file comment.

## Steps

- [x] Worktree `.worktrees/landing-prototypes` on `feat/landing-prototypes`;
      `.worktrees/` gitignored; `/prototypes` added to `BARE_PREFIXES`.
- [x] Shared scaffolding: `app/prototypes/{layout,page,_data,_switcher}.tsx`.
- [x] Build the four pages (one builder each, disjoint directories).
      Gamusa and answer-sheet used non-Tailwind class hooks; converted to
      `data-*` attribute hooks to satisfy `shadcn/no-unknown-classes`, and
      SVG fills moved to `var(--gm-*)` for `shadcn/no-raw-colors`.
- [x] `bun run check`, `bun run build`. 326 tests pass; all five routes
      prerender static. `lib/sitemap.test.ts` noindex list extended with
      the five `/prototypes` routes; `components/dev/theme-preview.tsx`
      now also hides on `/prototypes`.
- [x] Screenshot round at 390, 768, 1440; fix in one batch; confirm once.
      Fix: gamusa proof figures overflowed their 4-across cells at
      lg — dropped to 2×2 inside the left 7 columns.
- [x] Impeccable detector once over the four page files: `[]` findings.
- [ ] Commit; hand back with the four URLs.
