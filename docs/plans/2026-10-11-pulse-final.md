---
status: done
---

# Pulse, final — the chosen direction

Branch `preview/client-prototypes`, worktree `.worktrees/client-preview`.
`/prototypes/pulse-final`: Pulse as the final design, with Rollcall's moving
photography and big footer folded in. Built production-shaped — small typed
sections under `app/prototypes/pulse-final/` — so it can be lifted into the
app later. Three hero compositions to compare (`?hero=wall|bleed|ribbons`).

## Checklist

- [x] `pulse/_client.tsx`: `WordRoll` takes `className` (default amber, Pulse unchanged).
- [x] `_theme.ts`: fonts, merged Pulse + island tokens, all CSS (no hex in sections).
- [x] `_content.ts`: nav, hero words/copy, marquee, hero options, per-exam panel fields.
- [x] `_sections/`: site-header, photo-wall (columns + ribbon), batch-ticket,
      hero-wall / hero-bleed / hero-ribbons, hero-options, exam-marquee,
      exam-stack, student-fan, free-first, books, teachers, results, faq, ask,
      join-band, footer (GrandFooter with Pulse `--gf-*` overrides).
- [x] `page.tsx`: composes sections, picks hero from `searchParams`.
- [x] Registered: first in `favourites`, `allPrototypes` entry, index note
      "the ten", pick-a-design count 29.
- [x] Links to sub-pages go to `/prototypes/pulse/...` (the live ones on this
      branch); ExamStack panels carry the batch hour.
- [x] Gates: format, lint, typecheck, test, build.
- [x] Screenshots: all three heroes at 320/390/768/1280/1440, stack, fan,
      footer, picker open on mobile. `/prototypes/pulse` and `/prototypes/rollcall`
      still render.

## Round 2: phone fixes and release (11 October)

- [x] Teacher cards turn on tap or click (no hover flip); focus follows the
      flip; "Watch a class" opens the video dialog.
- [x] Student Shorts open in the vertical video dialog; play button on each
      card, names listed below the fan.
- [x] Empty free-material folders hidden; four folders lay out 2 by 2.
- [x] Phones: the promo reel waits until the hero has scrolled away
      (`reelAfter` on `SitePromoLayer`, off by default elsewhere).
- [x] Photo walls: neighbouring columns never share a photo.
- [x] Pushed `preview/client-prototypes`; live at
      https://ict-prototypes.vercel.app/prototypes/pulse-final.

### Open

- [ ] Client picks a hero. If Photo ribbons, drop the exam marquee.
- [ ] Results card: the dark card is half empty.
- [ ] Fresh production builds can fail on the Anek Latin Google Font
      (Turbopack "Can't resolve @vercel/turbopack-next/internal/font/google/font");
      a retry succeeded. Self-host Anek with `next/font/local` if it recurs.
- [ ] Port to the main app: sections into `components/marketing/`, one PR per
      group, prototype-only controls removed.
