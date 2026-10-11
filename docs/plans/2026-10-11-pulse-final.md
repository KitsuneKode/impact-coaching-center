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
