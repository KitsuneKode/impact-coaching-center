# ICT brand identity

**Status:** current, 22 October 2026. Replaces `docs/design-guide.md` (the
September draft, written for the pre-Pulse Inter look) where they disagree.
Tokens live in `app/globals.css` and `app/pulse.css`; this file says what they
mean and how to use them.

## Who we are

**Impact Career Tutorials (ICT)**, a coaching centre on DC Bungalow Road,
North Lakhimpur, Assam (second centre in Dhemaji). Classes for APSC, ADRE and
Assam Police, and Bank, SSC and Railway. Short name ICT. Logo: the I-beam and
pen nib (`public/brand/ict-logo-tight.png`, mark alone `ict-mark.png`).

**The promise:** three exams, one classroom. Teachers who cleared these
exams, classes recorded the same day, results you can check.

## Voice

- Plain, short, local. Say what to do next. No hype words, no exclamation
  marks, no em dashes.
- Talk to one student: "you", not "aspirants".
- Never explain how the site works to the visitor ("Your name", not a field
  with commentary).
- Numbers are real or not shown. Counts below 25 stay hidden and the rest are
  rounded down.
- English and Assamese are equal. Every new string gets both, and Assamese
  goes to a native reader before launch (`docs/i18n/assamese-review.md`).

## Colour (Pulse)

Blue, amber and ink on a cool paper ground. Light only at launch.

| Role  | Token                   | Hex (approx.) | Use                                          | Never                      |
| ----- | ----------------------- | ------------- | -------------------------------------------- | -------------------------- |
| paper | `--background`          | `#F5F7FB`     | page ground                                  |                            |
| ink   | `--foreground`          | `#0B1633`     | text, dark panels                            |                            |
| blue  | `--primary` / `--brand` | `#1F5FD1`     | actions, links, focus, the hero field        | body text                  |
| amber | `--highlight`           | `#FFC24A`     | one per view: the main call to action, marks | text on paper, backgrounds |
| green | `--verified`            |               | verified results only                        | generic success            |
| red   | `--destructive`         |               | errors, destructive actions                  | emphasis                   |
| muted | `--muted-foreground`    |               | secondary text                               |                            |

Contrast on paper: ink 16.9:1, muted 6.0:1, blue 5.3:1, white on blue 5.7:1.
Shadows are tinted to the ink (`--shadow-frame`, `--shadow-lift`), never
black. Hairline borders at 10% ink rather than boxes.

Exam colour fields (home exam stack): APSC blue, ADRE and Police ink,
Bank/SSC/Railway amber.

## Type

| Use            | Face                       | Notes                                                  |
| -------------- | -------------------------- | ------------------------------------------------------ |
| Headings       | Unbounded (`font-display`) | tight leading, negative tracking, two-tone heads       |
| Reading and UI | Figtree (`font-sans`)      | `tabular-nums` for prices, counts, phones, codes       |
| Assamese       | Anek Bangla (`--font-as`)  | own hierarchy; set `--font-display` inside `:lang(as)` |

Two-tone heading: the first sentence in ink, the rest in a lighter tone
("Three exams. One classroom.").

## Shape

- Controls (button, input, chip): `--radius-control`, 12px.
- Surfaces (card, panel, frame): `--radius-card`, 20px.
- Big colour panels (exam stack, hero field): 32px.
- No third radius for a new element.

## Motion

- Strong ease-out `--ease-out-strong` for entrances; `--ease-spring`
  (critically damped, 0.32s response) for the header.
- UI motion stays under 300ms. Hover motion only on real pointers.
- First paint: headings reveal word by word, the header drops in, sections
  follow from 0.4s. Pages that wait show a shimmer skeleton.
- Reduced motion keeps fades and drops movement.
- No animation on cart, checkout or anything typed into.

## Imagery

- ICT's own posters and photos of real teachers and students; no stock.
- Posters show whole on phones (no crop, no tilt).
- Covers for books are real covers once ICT sends them; until then the
  generated placeholders say "Sample".

## Patterns that define the site

- Blue-field hero with the word reveal.
- Pinned exam stack on home (each exam pins and the one behind shrinks).
- Floating header that shrinks on scroll and opens a panel per section.
- Student voices carousel, teacher cards that turn over.
- Book sets opening into their books; the PDF reader.
- Typed-word confirmation (code boxes) for destructive admin actions; Undo for
  anything reversible.

## Credit

Built and looked after by KitsuneKode (https://github.com/KitsuneKode),
credited once in the footer.
