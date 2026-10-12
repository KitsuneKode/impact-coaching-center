---
status: draft
ticket: none
spec: /home/kitsunekode/Projects/only-frontend/kitsu-lab/docs/superpowers/specs/2026-09-29-ict-bundles-resources-campaigns-design.md
---

# Bundle catalogue foundation implementation plan

> **For agentic workers:** Use `superpowers:executing-plans` sequentially, or `superpowers:subagent-driven-development` if selected by the owner. Track work below. This extends the existing launch plan's catalogue scope; it is not a second launch plan.

**Goal:** Let an owner author an Assamese and/or English bundle with exact included editions and a safe customer preview, without changing existing customer checkout yet.

**Architecture:** Add stable edition, bundle and variant identities alongside legacy books. Publish immutable content snapshots separately from drafts. Kitsu supplies reusable reader/promotion rendering through a pinned install; ICT owns all catalogue, permission, storage and purchase rules.

**Tech stack:** Existing Next.js 16.3.5, React, Bun, Convex, Base UI and ICT tokens. No new managed service for this increment.

**Spec:** The absolute path in this document's header, in the adjoining Kitsu repo. Read the shared design before implementation. Record its commit when the design is committed; do not assume a moving branch is a stable dependency.

## Global constraints

- One purchased bundle variant is Assamese OR English. Interface language never changes cart language.
- Low recurring infrastructure cost; retain existing Convex assets and browser PDF conversion.
- No live migration, provider configuration, deployment, automatic commits or unrelated theme changes.
- Current inspected base is `40e1a37`; refresh HEAD and dirty state before selecting an isolated execution worktree. Preserve the active theme/dependency work.
- Read `AGENTS.md`, `docs/design-guide.md`, generated Convex guidelines, and installed Next docs for relevant changes.
- Preserve public book samples, the existing resource-open gate and checkout phone verification.
- Do not replace the whole admin, build a standalone SaaS, or import Kitsu's visual skin.

## Review focus

1. A saved draft must not change a published bundle — Task 2.
2. A shared cover/sample must survive edits or deletion of another reference — Task 3.
3. Assamese selection must never display an English sample as a substitute — Task 4.
4. An old individual-book cart must remain usable until the coordinated checkout migration — Task 5.
5. A long/partially failed PDF import must not falsely appear complete — Task 3.

## Audit corrections to retain

The catalogue editors, owner permissions, revision checks, image upload, reference-aware deletion, natural sorting, keyboard reordering and browser PDF import already exist. `lib/pdf-pages.ts` renders 1600px JPEGs on the admin's device. Do not rebuild these as new features.

`convex/catalogAdmin.ts` saves edits directly into published records; publication is a boolean. Independent draft/published snapshots are new work. `lib/analytics.ts` is a development logging adapter, not production analytics. Resource opens return reusable URLs, not per-fetch authorization. The existing operational dashboard already lists enquiries, follow-ups and orders.

## Task 1 — Define and validate bundle content

**Create:** `lib/bundles.ts`, `lib/bundles.test.ts`.
**Modify:** `convex/schema.ts` additively, with database tests in `convex/bundles.db.test.ts`.

Define shared shapes:

```ts
export type BookLanguage = 'as' | 'en'
export type BundleMember = { editionId: string; quantity: number }
export type BundleVariantDraft = {
  language: BookLanguage
  members: BundleMember[]
  pricePaise: number
  availability: 'available' | 'unavailable'
}
export function physicalBookCount(members: readonly BundleMember[]): number {
  return members.reduce((sum, member) => sum + member.quantity, 0)
}
```

`validateBundleVariant(draft, editions)` returns `{ok:true,value}` or `{ok:false,field,reason}`; editions supplies IDs and language. Reject unknown editions, duplicate IDs, language mismatch, empty member lists, non-integer/nonpositive quantities, unsafe/non-integer prices and unsupported language. Keep existing validation error conventions.

- [ ] Write tests before schema edits:

```ts
expect(physicalBookCount([{editionId:'a', quantity:2}, {editionId:'b', quantity:1}])).toBe(3)
expect(validateBundleVariant({language:'as', members:[{editionId:'en1',quantity:1}], pricePaise:10000, availability:'available'}, [{id:'en1',language:'en'}]).ok).toBe(false)
```

- [ ] Add `bookEditions`, `bundles`, `bundleVariants` and published snapshot storage using Convex validators. Reference existing `books` as the initial book identity, leaving legacy prices/routes intact. Book editions carry language, edition label, cover/sample IDs and revision. Bundle variants have stable identity and language, editable draft payload and published snapshot reference; store price/contents in the snapshot. Use explicit foreign-key IDs in database tables even if the pure validator uses strings.
- [ ] Run `bun test lib/bundles.test.ts convex/bundles.db.test.ts`; ensure malformed/member-language cases fail before exposing mutation APIs.

## Task 2 — Owner authoring and atomic publication

**Create:** `convex/bundleAdmin.ts`, `convex/bundles.ts`, `convex/bundleAdmin.db.test.ts`.
**Modify:** `lib/catalog-server.ts` to add reads without changing existing book callers.

Interfaces: `saveEdition`, `saveBundle`, `saveVariant` accept an optional ID plus `expectedRevision` for updates and validated fields. Return the existing mutation-result union with ID/revision or refusal. `publishVariant({id,expectedRevision})` validates every referenced edition and atomically creates/points to a snapshot. `previewVariant({id})` is owner-only. Public `bundle({slug})` exposes published variants and metadata, never the editable draft.

- [ ] Use the current DB-test role fixtures to test anonymous/staff refusal, owner success, stale revisions, duplicate language variant, dangling edition and invalid price. Assert rejected mutations leave no snapshot or audit entry claiming success.
- [ ] Implement shared authorization/revision/audit patterns from `catalogAdmin.ts`; reuse them where accessible rather than weakening the existing checks. Snapshot included titles, language, edition labels and ordered asset references so later edition edits cannot silently change the live bundle.
- [ ] Add a regression: publish A → save draft B → public query still returns A → publish B → public query returns B. Failed publication must leave A intact.
- [ ] Unpublish removes public availability, preserves snapshots for history and does not delete assets. No inventory decrement or paid-state mutation in this task; actual stock accounting requires confirming assembled-set versus loose-book operations.

## Task 3 — Reuse uploads safely across editions

**Modify:** `convex/catalogAdmin.ts`, `components/admin/catalog-fields.tsx`, `lib/pdf-pages.ts`.
**Test:** existing `convex/catalog.db.test.ts`, new `lib/pdf-pages.test.ts` for extracted import validation.

- [ ] Extend reference discovery to edition drafts and published bundle snapshots before new UI can share assets. Test that replacing an image in one legacy book does not delete it while referenced by another edition or a published snapshot.
- [ ] Reuse current cover/page fields and browser PDF rasterization. Add explicit confirmation when a PDF exceeds the allowed page count; the existing `Math.min` behavior must not silently suggest a full import. Distinguish importing N of M pages, conversion failure and upload failure.
- [ ] Preserve successful uploads and draft edits when a later page fails; retry failed pages without duplicating successful ones. Keep natural order and existing keyboard reordering. Cancel processing cleanly on unmount where practical and release PDF/canvas resources.
- [ ] Validate file type/size server-side using current upload checks. No R2 migration in this task; record existing storage references honestly.

## Task 4 — Bundle editor and actual customer preview

**Create:** `components/admin/bundle-editor.tsx`, `components/commerce/bundle-details.tsx`, `app/admin/bundles/page.tsx`, `app/admin/bundles/new/page.tsx`, `app/admin/bundles/[id]/page.tsx`.
**Modify:** `components/admin/nav.ts` and `components/commerce/page-viewer.tsx` only for document identity parity when required.

`BundleDetails` accepts a display projection containing title, published/draft variant options and ordered editions; the same component is used for preview and later public pages. The preview action never purchases.

- [ ] Build owner flow: bundle details → Assamese/English variant tabs → ordered book editions/quantities → price/availability → preview → publish. Use existing Field/Input/Select primitives, inline errors and revision-refusal copy. Include an explicit save status and prevent publish during incomplete uploads.
- [ ] Build customer preview with required language selection, full included-book list, per-book sample action and clear unavailable-sample text. Preserve portrait cover proportions; use a list at phone width and a restrained grid on wide screens. Retain ICT tokens and transactional density in admin.
- [ ] Give each sample a document identity including edition ID/revision. Reset page/zoom when that identity changes. Keep the current viewer until the pinned Kitsu image-reader install demonstrates equivalent behavior and payload. Do not import all reader engines.
- [ ] Check phone/tablet/desktop, keyboard and 200% zoom. Test switching from the last page of a longer English sample to a shorter Assamese sample: no stale page, zoom or wrong-language content. Test a missing sample without substituting another edition.

## Task 5 — Qualification and next increment boundary

- [ ] Run `bun run check` and `bun run build`; execute the owner→draft→preview→publish journey against a test backend only when available. Report code-local versus deployed evidence separately.
- [ ] Verify existing individual-book pages/cart/resource reader still work. No public bundle Buy action ships while checkout still resolves individual book slugs.
- [ ] Reconcile the launch-plan checklist with completed work only; retain source-file evidence for already completed PDF/upload features.
- [ ] Next coordinated increment owns `lib/cart-store.ts`, `convex/carts.ts`, `convex/checkout.ts`, `convex/schema.ts` order snapshots, public bundle routes and packing UI together. It must introduce variant identity and safe legacy-cart mapping before making bundles purchasable.

## Connection to Kitsu work

The promotion-focused plan is `/home/kitsunekode/Projects/only-frontend/kitsu-lab/docs/superpowers/plans/2026-09-29-kitsu-ict-promotion-integration.md`. Its first tasks fix/extend generic media and create a pinned registry export; its ICT tasks own campaign persistence, adapters and previews. One writer must own `convex/schema.ts` at a time. These two increments can be scheduled independently until shared schema/registry integration.

No cross-repo symlinks, runtime source imports or automatic latest updates. Record the installed Kitsu commit and checksums; upgrades are explicit reviewed changes. Native sequential execution is recommended for predictable coordination cost, with a focused review at each repository handoff.
