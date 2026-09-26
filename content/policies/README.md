# Policy pages: how to edit them

Each file here is one page on the website:

| File          | Page        |
| ------------- | ----------- |
| `privacy.md`  | `/privacy`  |
| `terms.md`    | `/terms`    |
| `refunds.md`  | `/refunds`  |
| `shipping.md` | `/shipping` |

Write in plain Markdown: `## Heading`, paragraphs, `- lists`, `**bold**` and
tables. HTML is ignored.

## The two highlights

- `{{proposed: 7 days}}` is a value we suggested from common practice. Keep
  it by deleting the braces and the word `proposed:`, or change the value.
- `{{fill: grievance officer name}}` is a detail only ICT knows. Replace the
  whole marker with the real detail.

The page shows how many of each are left, and highlights them so nobody
mistakes a suggestion for a promise.

## Approving a page

When a page has no markers left and ICT has signed the wording off:

1. Set `approved: true` and today's date in `updated:` at the top of the file.
2. The draft notice disappears, the page becomes indexable and joins the
   sitemap.

The build refuses an approved page that still has a marker, and refuses to
approve the refunds or shipping page before online ordering exists.

Phone numbers and the email address must match the ones in `lib/brand.ts`; a
test checks this so a typo cannot send complaints to the wrong place.
