import { useTranslations } from "next-intl"

import { LeadForm } from "@/components/marketing/lead-form"

/** The enquiry form on a white card. */
export function Ask({
  heading,
  defaultTrack,
}: {
  heading?: string
  defaultTrack?: string
}) {
  const t = useTranslations("Pulse")
  return (
    <section
      id="ask"
      aria-labelledby="ask-heading"
      className="container-page pbe-20 md:pbe-28"
    >
      <div className="mx-auto max-w-[44rem] rounded-[32px] bg-card p-6 shadow-[0_0_0_1px_var(--border)] sm:p-10">
        <h2 id="ask-heading" className="type-display max-w-[18ch]">
          {heading ?? t("askHeading")}
        </h2>
        <div className="mbs-8">
          <LeadForm bare defaultTrack={defaultTrack} />
        </div>
      </div>
    </section>
  )
}
