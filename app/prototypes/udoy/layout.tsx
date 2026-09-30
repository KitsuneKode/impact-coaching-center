import { IconArrowRight } from "@tabler/icons-react"
import type { Metadata } from "next"
import Image from "next/image"
import type { ReactNode } from "react"

import { GrandFooter } from "../_blocks/grand-footer"
import { offer, phone, tel, whatsapp } from "../_data"
import { KitShell } from "../_kit/shell"
import { external } from "../_kit/shared"
import { base, fontClass, themeCss, tokens } from "./_theme"

export const metadata: Metadata = {
  title: { default: "Udoy", template: "%s, Udoy" },
}

function Closing() {
  return (
    <div data-ud-closing className="px-7 py-20 sm:px-14 md:py-28">
      <Image
        src="/proto/udoy-river-dusk.jpg"
        alt=""
        fill
        sizes="(min-width: 1280px) 1180px, 100vw"
        className="-z-20"
      />
      <h2 data-k-h2 className="max-w-[14ch]">
        Sit in on a class before you decide.
      </h2>
      <p className="mt-5 max-w-[40ch] text-lg text-[#D9DEEA]">
        {offer.promise}
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <a
          href={whatsapp}
          {...external}
          data-k-press
          data-k-btn
          className="group inline-flex h-12 items-center gap-2 px-7 whitespace-nowrap"
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
          className="inline-flex h-12 items-center rounded-full px-6 font-semibold text-[#F7F4EE] tabular-nums shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]"
        >
          Call {phone}
        </a>
      </div>
    </div>
  )
}

export default function UdoyLayout({ children }: { children: ReactNode }) {
  return (
    <KitShell
      slug="udoy"
      theme="udoy"
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
