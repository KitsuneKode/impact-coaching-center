# Component and design research

Research date: 17 September 2026

## Decision

Build the first production version from the project's existing Base UI-flavoured shadcn system, using official shadcn components and `dashboard-01` as reference material. Add only two UI dependencies when their features are actually needed:

- `@tanstack/react-table` v9 for reusable admin tables with server-driven pagination, filtering and sorting.
- `recharts` v3 through the official shadcn Chart component for the few charts that help staff make decisions.

Do not adopt a second design system, a complete admin template, or a generic CRM package. The website needs a small operations console shaped around leads, book orders, resources, library applications and promotions. Copying a large SaaS dashboard would add unused code and produce a generic visual result.

Shoogle and 21st.dev are useful catalogues for visual discovery, but they are not reliable approval signals. Every third-party item must be inspected for its own licence, dependencies, responsive behaviour, keyboard behaviour and visual fit before any code is installed.

## Current project fit

The repository currently uses Next.js 16.2.6, React 19.2.4, Tailwind CSS 4, shadcn 4.21.0 in the `base-mira` style, Base UI 1.8.0, Tabler icons and Motion. Its `components.json` is configured for React Server Components, TypeScript, CSS variables and the existing `@/components/ui` path.

This matters because many community blocks assume Radix UI, Lucide, older shadcn styles, Tailwind 3 configuration files or React 18 conventions. A visually attractive preview can therefore cost more to adapt than a restrained composition made from the primitives already installed.

## Recommended component map

| Product need             | Reuse first                                                                                               | Adaptation for ICT                                                                                                                           | New runtime dependency                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Admin shell              | Official shadcn `dashboard-01` structure and Sidebar                                                      | Reduce navigation to Overview, Leads, Courses, Resources, Books, Orders, Library and Promotions; use existing type, colour and radius tokens | None for shell                                                           |
| Dense records            | Official shadcn Table plus Data Table guide                                                               | Shared server-driven table frame; route-specific columns, filters, empty states and row actions                                              | `@tanstack/react-table` v9                                               |
| Overview metrics         | Card, Badge and official dashboard section-card composition                                               | New leads, overdue follow-ups, paid orders, revenue, low stock and active campaigns                                                          | None                                                                     |
| Charts                   | Official shadcn Chart                                                                                     | At most lead source, enquiries over time and order revenue; always include a textual/table equivalent                                        | `recharts` v3 and matching `react-is` if required by its current package |
| Filters                  | Input, Select, Combobox, Popover, Date Picker, Badge                                                      | Search, status chips, course interest, source and date range; store shareable filters in URL search params                                   | None beyond installed Base UI through shadcn components                  |
| Edit/detail flows        | Dialog for short focused tasks; Sheet/Drawer for record detail; Alert Dialog for destructive confirmation | Lead notes/status, order fulfilment, inventory, resource metadata and campaign editor                                                        | None                                                                     |
| Forms                    | Field, Fieldset, Input, Select, Textarea, Checkbox, Date Picker                                           | Keep server validation authoritative; group long editors into labelled sections; show field-level errors                                     | None initially; schema library belongs to the data layer decision        |
| Lead pipeline            | Table/list with status Select and counts by status                                                        | `New -> Contacted -> Interested -> Enrolled/Lost`, follow-up date, assignee, notes, call and WhatsApp actions                                | None                                                                     |
| Optional visual pipeline | Compact columns at desktop only, list at mobile                                                           | Consider after staff prove they need bulk status movement                                                                                    | `@dnd-kit/react` only if drag-and-drop is validated                      |
| Orders                   | Data Table, Badge, Sheet, Dropdown Menu                                                                   | Pending/Paid/Packed/Shipped/Delivered/Cancelled, payment reference, address, courier and tracking                                            | None                                                                     |
| Resource library         | Card/Item for public browsing; Data Table for admin; Dialog for lead gate                                 | Exam/category/year labels, file type and size, search, consent and unlock state                                                              | None                                                                     |
| Book catalogue/cart      | Card/Item, Quantity controls, Sheet/Drawer, Separator, Empty, Alert                                       | Persistent cart, stock feedback, shipping summary and Razorpay hand-off; full-page checkout on mobile                                        | None                                                                     |
| Command menu             | Official Command plus Dialog                                                                              | Admin navigation and record search only after ordinary navigation works; never the sole route to an action                                   | None                                                                     |
| Promotions               | Alert/announcement bar composition, Dialog or Sheet, Card                                                 | One campaign at a time, schedule, target pages, dismiss frequency, prominent close control and analytics identifiers                         | None                                                                     |
| Feedback                 | Toast, Alert, Empty, Skeleton, Progress                                                                   | Mutation results, empty lists, loading states and checkout progress; do not use toast as the only error channel                              | None                                                                     |

### Why this shortlist is technically credible

The official shadcn blocks page describes its blocks as open source, free, React-framework compatible, and offers `dashboard-01`, which already contains a sidebar, charts, a data table, metric cards and a header ([official blocks](https://ui.shadcn.com/blocks)). shadcn is MIT-licensed ([official repository licence](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)), and its documentation explicitly distinguishes official resources from independent community registries and asks adopters to review third-party code ([official-resource notice](https://ui.shadcn.com/docs/official)).

The official shadcn Data Table guide pairs its Table markup with TanStack Table and covers sorting, filtering, pagination, column visibility, row selection and reusable controls ([shadcn Data Table](https://ui.shadcn.com/docs/components/base/data-table)). The current guide uses TanStack Table v9. TanStack says its React adapter supports React 18 and newer, is headless, works with shadcn and Tailwind, and includes Base UI shadcn examples ([TanStack overview](https://tanstack.com/table/latest/docs/overview), [installation](https://tanstack.com/table/latest/docs/installation)). That makes it compatible with React 19 without replacing the project's markup or tokens.

The official shadcn Chart component now uses Recharts v3 without hiding Recharts behind a proprietary abstraction ([shadcn Chart](https://ui.shadcn.com/docs/components/base/chart)). Recharts is MIT-licensed ([official repository](https://github.com/recharts/recharts)). Charts still need readable labels and a table or numeric summary; an `accessibilityLayer` does not make an ambiguous visualization self-explanatory.

Base UI supports React 17 and newer, Tailwind, Turbopack and modern browsers. Its primitives implement many ARIA, keyboard and focus-management behaviours, while leaving visible focus, contrast, labels and application-level testing to the implementer ([Base UI overview](https://base-ui.com/react/overview/about), [accessibility guide](https://base-ui.com/react/overview/accessibility)). It is MIT-licensed and free for commercial use ([Base UI repository](https://github.com/mui/base-ui)). This reinforces keeping the current primitive layer instead of mixing in Radix-based community blocks.

## Exact reuse plan by surface

### Minimal admin and CRM

Use `dashboard-01` only as a parts donor. Keep its responsive Sidebar/SidebarInset structure, header pattern, metric-card rhythm, chart wrapper and table composition. Rewrite navigation, labels, data models, permissions and empty states for ICT.

The lead workspace should default to a dense table or mobile record list, not a Kanban board. Staff need to scan phone number, course interest, source, status and next follow-up together. Use a status Select for reliable keyboard and touch operation, plus saved count tabs for New, Follow-up due, Interested and Enrolled. Add a board only if real staff usage shows that drag-based triage is valuable. If that happens, dnd-kit is MIT-licensed and provides a current React adapter ([official repository](https://github.com/clauderic/dnd-kit)), but accessible non-drag controls must remain available.

Use one shared `DataTable` frame rather than one universal mega-table. Reuse pagination, column visibility, filter toolbar, selection summary and responsive overflow; let Leads, Orders, Resources, Books and Applications own their column definitions and row actions. Put Convex pagination and filtering on the server instead of downloading every record to the browser.

Use Side sheets for record details on desktop only when keeping list context is useful. On narrow screens, route to a full detail view or use a full-height drawer with a clear heading, close control and focus return. Use Alert Dialog only for a consequential action such as cancel order, unpublish resource or delete promotion.

### Book catalogue, cart and checkout

Build the public catalogue from the existing Card, Badge and Button rather than importing an ecommerce theme. A product card needs one strong cover image, title, exam/category, price, availability and one action. The detail page should hold description, edition, contents, fulfilment information and a sticky mobile add-to-cart action.

Use a Sheet for a quick cart review on desktop, but use a dedicated cart and checkout route as the durable experience. The sheet must link to the full cart and must not contain the complete address/payment flow. Checkout needs clearly separated contact, delivery address, delivery charge, order summary and Razorpay hand-off states. Payment status comes from server verification, not the client-side success callback.

### Resources and lead gate

Use Item/Card rows with filters rather than large image cards; users are trying to identify the exam, subject, year and format quickly. The unlock Dialog should explain exactly what the visitor receives and why name/phone/email is requested, obtain explicit consent where needed, and return focus to the selected resource after success. Never block all site browsing behind a modal.

### Promotions and sale UI

Create one promotion data model and three renderers: announcement bar, inline campaign panel and restrained Dialog/Sheet. Use the same campaign ID and CTA destination across placements.

Recommended behaviour:

- Announcement bar: short factual message, one link, visible close button, no marquee.
- Inline panel: appears where course or book context makes the offer relevant.
- Popup: only for a meaningful timed campaign; delay until engagement, cap frequency, never show on checkout or immediately after dismissal, and make closing as easy as accepting.
- Mobile: avoid a popup competing with the sticky action bar; prefer an inline card or bottom sheet after explicit interaction.

No separate popup library is needed. Base UI Dialog/Drawer already handles the difficult interaction primitives, while Convex can own schedule, priority, target routes and publish state.

## 21st.dev and Shoogle findings

### 21st.dev

21st has useful searches for announcement components and dashboard compositions ([announcement collection](https://21st.dev/s/announcement), [dashboard collection](https://21st.dev/community/components/explore/next-shadcn-dashboard-starter)). Its own dashboard guide makes the same practical recommendation used here: choose one chart library, use TanStack Table for real table behaviour, and treat community dashboard quality as variable ([21st dashboard guide](https://docs.21st.dev/blog/react-dashboard-components)).

However, access and licensing are not equivalent to “all components are free.” The current guide says registry installation requires a 21st membership, while the marketplace terms say component ownership remains with individual authors and restrict reuse of 21st's previews, screenshots and metadata. The terms also say open-source licences must be preserved ([21st terms](https://docs.21st.dev/terms)). The MIT licence on the `21dev-org` website repository applies to that repository, not automatically to every marketplace submission ([repository licence](https://github.com/21dev-org/21dev-org/blob/main/LICENSE)).

Decision: use 21st for human browsing and pattern discovery. Adopt an item only when its component page or linked source repository gives an explicit commercial-compatible licence, it does not introduce Radix or a second icon/chart stack, and the copied code passes keyboard, reduced-motion, responsive and dependency review. Do not reuse 21st preview media or marketplace metadata.

### Shoogle

Shoogle exists and describes itself as a search engine for shadcn blocks, components and templates across registries ([Shoogle](https://shoogle.dev/)). It can expose registry install commands through the shadcn CLI ([Shoogle CLI guide](https://shoogle.dev/mcp/cli)). It is an index, not the owner or security reviewer of every result.

Decision: use Shoogle to locate candidates by terms such as `announcement`, `course card`, `order status`, `empty state`, `data table` and `checkout`. Follow every result to its originating registry and repository, then verify licence, package imports, framework versions and source before installation. Never run an unfamiliar registry install directly in the main worktree; inspect its registry JSON or install into a disposable branch/worktree first.

## Other libraries considered

| Option                            | Decision                         | Reason                                                                                                    |
| --------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Official shadcn blocks/components | Adopt selectively                | Best stack fit, MIT, source-owned, Base UI variants and low visual migration cost                         |
| Base UI primitives                | Keep                             | Already installed; MIT; React 19-compatible; strong keyboard/focus foundations                            |
| TanStack Table v9                 | Add when admin tables start      | Headless and React 19-compatible; its feature selection avoids an oversized grid dependency               |
| Recharts v3                       | Add only with first useful chart | Official shadcn integration and MIT; avoid charts that merely decorate the dashboard                      |
| dnd-kit                           | Defer                            | A dropdown-driven pipeline is cheaper and more accessible; add drag only after workflow validation        |
| 21st.dev components               | Inspect case by case             | Useful catalogue, but author licences and dependencies vary and marketplace access can require membership |
| Shoogle results                   | Discovery only                   | Indexes many registries; a result is not a licence, maintenance or accessibility guarantee                |
| Tremor/full dashboard kit         | Reject for v1                    | Overlaps the existing design system and would import a second visual vocabulary for a small admin surface |
| MUI Data Grid/full MUI            | Reject                           | Adds a second component system; its free community grid is unnecessary for the expected record scale      |
| Complete ecommerce theme          | Reject                           | Styling and data assumptions would fight the existing brand and physical-book workflow                    |
| Generic CRM or Kanban package     | Reject                           | The required pipeline is small; package complexity would exceed the actual workflow                       |

## Premium education design direction

“Premium” should come from clarity, evidence and editorial control rather than gradients, glass cards or constant motion. The visual system can borrow the structure of an academic prospectus and the warmth of a serious local institution:

- Strong opening hierarchy: one exam-focused promise, one primary course-discovery CTA and one lower-friction enquiry action.
- Editorial course index: compare exam, mode, duration, start status and syllabus without forcing visitors through decorative cards.
- Documentary proof: real classrooms, faculty and campus details with useful captions rather than generic stock photography.
- Evidence-led outcomes: results grouped by exam and year, with verifiable candidate details and the exact ICT programme used.
- Resource authority: current affairs, PYQs and study notes should feel like a maintained publication with dates, authorship/review and update cadence.
- Quiet conversion: repeated contextual CTAs after evidence sections, with a mobile sticky action that does not cover content.
- Local confidence: verified address, map, opening hours, phone/WhatsApp and Assam-specific exam coverage should be easy to find.

Large education platforms such as Physics Wallah demonstrate the breadth pattern—courses, results, free study material and a separate book store—without providing a visual template that should be copied ([official learning site](https://www.pw.live/), [official store](https://store.pw.live/school-books)). ICT should use the same information architecture principle at a much smaller scale and retain its own editorial identity.

### Trustworthy success stories

Every result or testimonial record should be backed by an internal evidence field and client approval. Public cards should show only approved facts such as candidate name, exam, year, stage/rank where verified, course or programme relationship, portrait with permission, and the candidate's own concise statement. Avoid “best,” “No. 1,” guaranteed selection, inflated aggregate counts, unattributed quotation cards and logo walls that imply an affiliation.

This is a product and compliance requirement, not only a tone preference. India's Central Consumer Protection Authority issued coaching-sector advertising guidelines specifically because institutes concealed material information or made false guarantees ([official 2024 notification](https://consumeraffairs.nic.in/sites/default/files/file-uploads/latestnews/Guidelines%20for%20Prevention%20of%20Misleading%20Advertisement%20in%20Coaching%20Sector%2C%202024.pdf)). ASCI requires objectively ascertainable claims to be substantiated and permission for references to people or institutions; its education guidance also prohibits implying recognition or accreditation without evidence ([ASCI Code](https://www.ascionline.in/the-asci-code/), [education guidelines](https://www.ascionline.in/the-asci-code-guidelines/)).

Recommended result-record fields:

```text
candidateName
exam
examYear
stageOrRank
programName
programParticipationEvidence
claimEvidenceReference
portraitAsset
portraitConsentRecordedAt
quote
quoteApprovedAt
publishedAt
```

## Reuse and implementation risks

1. **Registry overwrite risk.** A shadcn install writes source into the repository and can overwrite local components. Review the proposed file list and diff before accepting changes.
2. **Primitive mismatch.** Community components frequently import Radix even though this project uses Base UI. Port the composition to existing primitives instead of adding parallel dialog/menu/select implementations.
3. **Style mismatch.** Blocks may assume different CSS variables, fonts, icon sets, radii or Tailwind versions. Preserve `base-mira`, Tabler icons and the repository's semantic tokens.
4. **Client-boundary growth.** Tables, charts, dialogs and command menus are interactive, but page data and layouts should remain Server Components. Isolate `"use client"` to the actual interactive component.
5. **Mock-data leakage.** Official and community dashboard blocks ship sample users, revenue and chart values. Remove all sample claims and bind only typed Convex data before a route is considered production-ready.
6. **Accessibility gaps after styling.** Base UI supplies interaction foundations, not complete product accessibility. Verify focus visibility, headings, labels, error association, contrast, touch targets, scroll lock and focus return.
7. **Mobile table failure.** Do not shrink a desktop table until it is unreadable. Preserve horizontal overflow for comparison tables and provide a purpose-built card/list view for task completion on small screens.
8. **Motion and bundle creep.** Reject blocks that add WebGL, a second motion package, a second chart package or decorative dependencies. Motion already exists in the project and should remain restrained.
9. **Licence ambiguity.** A marketplace or aggregator licence does not automatically cover each contributor's code or media. Keep attribution/licence notices where required and reject any candidate without a clear commercial-use grant.
10. **False proof.** Template testimonials, rankings, seat counts and result statistics must never reach production. Maintain evidence and consent alongside published result records.

## Candidate acceptance checklist

Before importing any registry component:

- Source page and repository are identifiable.
- Licence explicitly permits commercial use and is recorded in the PR or dependency inventory.
- Registry JSON and every package import have been inspected.
- It supports React 19, Tailwind 4 and the Next.js App Router, or requires only a small understood port.
- It uses Base UI-compatible shadcn primitives or is ported without adding Radix duplicates.
- It uses Tabler icons or has a trivial icon swap.
- It works at 320 px, tablet and desktop widths without fixed-width overflow.
- Keyboard order, Escape/close, focus return, labels and screen-reader names are correct.
- Reduced-motion behaviour and animation purpose are acceptable.
- Sample content, invented metrics and placeholder claims are removed.
- `bun run check` and, for route/client-boundary changes, `bun run build` pass.

## Practical build order

1. Add the smallest missing official shadcn primitives: Sidebar, Table, Field/Input/Select/Textarea, Dialog, Sheet/Drawer, Dropdown Menu, Alert Dialog, Empty, Skeleton, Pagination and Command only if global admin search is included.
2. Compose the admin shell from `dashboard-01`, preserving the existing tokens and Tabler icons.
3. Build the shared table frame with TanStack Table v9 and one Leads table; verify Convex server pagination before cloning the pattern to Orders, Books, Resources and Library.
4. Build public resource and book cards from the existing primitives; add the resource gate and persistent cart as small client islands.
5. Implement the promotion model and announcement/inline renderers; add popup delivery only after frequency, dismissal and analytics rules exist.
6. Add the overview metrics. Introduce Recharts only after the team identifies a chart that changes a daily decision.
7. Run responsive, keyboard and screen-reader checks using real-length Assamese/English content and truthful result data.

This approach captures most of the speed benefit of shadcn blocks while keeping the codebase coherent, legally reviewable and visually specific to Impact Coaching Centre.
