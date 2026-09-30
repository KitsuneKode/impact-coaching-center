import { IconArrowRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import type { ReactNode } from "react"

import { GrandFooter } from "../_blocks/grand-footer"
import { offer, phone, tel, whatsapp } from "../_data"
import { KitShell } from "../_kit/shell"
import { external } from "../_kit/shared"
import { as } from "../sandhya/_as"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Akhor", template: "%s, Akhor" },
}

function Closing() {
  return (
    <div data-ak-closing className="px-6 py-20 text-center sm:px-12 md:py-28">
      <span data-ak-seal>
        <Image
          src="/brand/ict-mark.png"
          alt=""
          width={34}
          height={34}
          className="size-8"
        />
      </span>
      <h2 data-k-h2 className="mx-auto mt-10 max-w-[16ch]">
        Start with a free workshop.
      </h2>
      <p
        lang="as"
        data-ak-as
        className="mx-auto mt-4 max-w-[38ch] text-[#D7DBF3]"
      >
        {as.promise}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <a
          href={whatsapp}
          {...external}
          data-k-press
          data-ak-light
          className="group inline-flex h-12 items-center gap-2 rounded-full px-7 font-semibold whitespace-nowrap"
        >
          {offer.cta}
          <IconArrowRight
            aria-hidden
            size={18}
            stroke={2}
            className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          />
        </a>
        <a
          href={tel}
          data-k-press
          className="inline-flex h-12 items-center rounded-full px-6 font-semibold text-[#F8F8F6] tabular-nums shadow-[inset_0_0_0_1px_rgba(248,248,246,0.35)]"
        >
          Call {phone}
        </a>
      </div>
    </div>
  )
}

export default function AkhorLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      slug="akhor"
      theme="akhor"
      base={base}
      tokens={tokens}
      fontClass={fontClass}
      themeCss={themeCss}
      brand="Impact Career Tutorials"
      footer={<GrandFooter base={base} cta={<Closing />} />}
    >
      {children}
    </KitShell>
  )
}
