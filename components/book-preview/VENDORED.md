# Vendored

`BookPreview` (core, pdf and curl items) is installed from the kitsu-lab
registry (`/home/kitsunekode/Projects/only-frontend/kitsu-lab`, items
`book-preview`, `book-preview-pdf`, `book-preview-curl`), which is where it is
maintained and tested. Local changes are limited to mapping its shadcn button
and badge variants onto this project's (`outline` → `secondary`, `xs` → `sm`,
`icon-xs` → `icon-sm`, the download link as an anchor with `buttonVariants`).
`.oxlintrc.json` relaxes this project's own Tailwind and a11y-style rules for
this folder; fix issues upstream, then re-copy.
