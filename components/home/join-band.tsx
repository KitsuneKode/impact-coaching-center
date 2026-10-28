import { IconPhone } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { useContent } from "@/i18n/content"
import { contact, formatPhone } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { PrimaryCta } from "./cta"

/** The closing blue field. `data-page-end` tells the pop-up the visitor got here. */
export function JoinBand() {
  const t = useTranslations("Pulse")
  const nav = useTranslations("Nav")
  const { joining } = useContent()
  return (
    <section
      data-page-end
      aria-labelledby="join-heading"
      className="bg-primary pbs-20 pbe-20 text-white md:pbs-28 md:pbe-28"
    >
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2
            id="join-heading"
            className="font-display text-[clamp(2.2rem,1.6rem+3vw,4.2rem)] leading-none font-semibold tracking-[-0.04em] text-balance"
          >
            {t("joinHeading")}
          </h2>
          <div className="mbs-10 flex flex-wrap items-center gap-3">
            <PrimaryCta />
            <a
              data-press
              data-cta="ghost-blue"
              href={contactHref({ kind: "call" })}
              className="tnum inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold"
            >
              <IconPhone aria-hidden size={18} stroke={1.75} />
              {nav("callNumber", { phone: formatPhone(contact.phones[0]) })}
            </a>
          </div>
        </div>
        <ol className="grid gap-6 lg:col-span-5">
          {joining.map((step) => (
            <li key={step.verb} className="border-bs border-white/25 pbs-4">
              <p className="font-semibold">{step.verb}</p>
              <p className="mbs-1 text-sm text-on-primary">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
