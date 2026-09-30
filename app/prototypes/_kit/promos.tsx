import { campaign, menuItems, sampleEndsAt } from "../_campaign"
import { OfferCard, PromoScope, PromoStudio } from "../_promos"
import { Reveal } from "../_reveal"
import { container, type KitProps } from "./shared"
import { PageHead } from "./head"

export function KitPromos({ base }: KitProps) {
  const items = menuItems.map((m, i) => ({
    ...m,
    href: [`${base}/notes`, `${base}/contact`, `${base}/notes`][i] ?? base,
  }))
  return (
    <main>
      <PageHead
        base={base}
        trail={[{ label: "Promotions kit" }]}
        title="Promotions, previewed where they live."
        lede="Six placements from one kit. Pick one to see it on the page, then try the real thing. Campaign copy is ICT's own; the code and end date are samples."
      />

      <PromoScope>
        <section aria-label="Placements" className={`${container} pb-20`}>
          <PromoStudio c={campaign} menuItems={items} />
        </section>

        <section aria-labelledby="offer-h" className={`${container} pb-24`}>
          <Reveal>
            <h2 id="offer-h" data-k-h2 className="max-w-[20ch]">
              The offer card, with a clock and a code.
            </h2>
            <p className="mt-4 max-w-[56ch] text-[var(--k-muted)]">
              For a batch that opens soon or a fee that changes. The code copies
              in one press and confirms with a toast. Sample campaign.
            </p>
          </Reveal>
          <div className="mt-10 max-w-[760px]">
            <OfferCard c={campaign} endsAt={sampleEndsAt()} />
          </div>
        </section>
      </PromoScope>
    </main>
  )
}
