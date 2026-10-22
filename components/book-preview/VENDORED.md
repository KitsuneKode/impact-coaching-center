# Vendored

`BookPreview` (core, pdf, curl and scroll items) is installed from the kitsu-lab
registry (`/home/kitsunekode/Projects/only-frontend/kitsu-lab`, items
`book-preview`, `book-preview-pdf`, `book-preview-curl`, `book-preview-scroll`), which is where it is
maintained and tested. Local changes are limited to mapping its shadcn button
and badge variants onto this project's (`outline` → `secondary`, `xs` → `sm`,
`icon-xs` → `icon-sm`, the download link as an anchor with `buttonVariants`).
`.oxlintrc.json` relaxes this project's own Tailwind and a11y-style rules for
this folder; fix issues upstream, then re-copy.

`engines/scroll-engine.tsx` carries two local fixes to port upstream: a
rendered page reserves its height (`aspect-ratio`) before the image decodes,
a page the scroller reported itself is not scrolled back to its top, and
the starting page is scrolled to once a PDF's pages exist.
Without them the position jumped while scrolling a PDF.
