import {
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Faq } from "@/components/home/faq"
import { CentreFinder } from "@/components/marketing/centre-finder"
import { LeadForm } from "@/components/marketing/lead-form"
import { Reveal } from "@/components/motion/reveal"
import { PageHead } from "@/components/site/page-head"
import { contact, formatPhone, links, place } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { liveCourses } from "@/lib/courses-server"
import { alternatesFor, openGraphFor } from "@/lib/site"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "ContactPage" })
  const title = t("title")
  const description = t("description")
  return {
    title,
    description,
    alternates: alternatesFor("/contact", locale),
    openGraph: openGraphFor("/contact", title, description, locale),
  }
}

const socials = [
  { label: "YouTube", href: links.youtube },
  { label: "Instagram", href: links.instagram },
  { label: "Facebook", href: links.facebook },
] as const

/** Every fact here comes from `lib/brand.ts`. */
export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Pulse")
  const nav = await getTranslations("Nav")
  const centres = await getTranslations("Centres")
  const courses = await liveCourses()

  const channels = [
    ...contact.phones.map((phone) => ({
      key: phone,
      Icon: IconPhone,
      label: t("callLabel"),
      value: formatPhone(phone),
      href: `tel:${phone}`,
      external: false,
    })),
    {
      key: "whatsapp",
      Icon: IconBrandWhatsapp,
      label: t("whatsappLabel"),
      value: formatPhone(contact.whatsapp),
      href: contactHref({ kind: "workshop" }),
      external: true,
    },
    {
      key: "email",
      Icon: IconMail,
      label: t("emailLabel"),
      value: contact.email,
      href: `mailto:${contact.email}`,
      external: false,
    },
  ]

  return (
    <main>
      <PageHead
        trail={[{ label: nav("contact") }]}
        title={t("contactTitle")}
        lede={t("contactLede")}
      />

      <section className="container-page grid grid-cols-1 items-start gap-6 pbe-20 lg:grid-cols-12">
        <div className="grid min-w-0 gap-3 lg:col-span-5">
          <ul className="grid grid-cols-1 gap-3">
            {channels.map(({ key, Icon, label, value, href, external }, i) => (
              <li key={key}>
                <Reveal delay={i * 0.04}>
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    data-row-card
                    data-channel
                    className="flex items-center gap-4 p-3 pe-5"
                  >
                    <span
                      data-channel-icon
                      className="grid size-12 flex-none place-items-center rounded-2xl"
                    >
                      <Icon aria-hidden size={22} stroke={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-muted-foreground">
                        {label}
                      </span>
                      <span className="tnum block font-semibold [overflow-wrap:anywhere]">
                        {value}
                      </span>
                    </span>
                    <IconArrowUpRight
                      data-nudge
                      aria-hidden
                      size={18}
                      stroke={1.75}
                      className="text-muted-foreground"
                    />
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={0.18}>
            <div className="rounded-[28px] bg-primary p-6 text-white">
              <div className="flex items-start gap-4">
                <span className="grid size-12 flex-none place-items-center rounded-2xl bg-white/12">
                  <IconMapPin aria-hidden size={22} stroke={1.5} />
                </span>
                <address className="not-italic">
                  <span className="block font-semibold">
                    {t("visitCentre")}
                  </span>
                  <span className="mbs-1 block text-on-primary">
                    {place.street}, {place.city}, {place.region} {place.pin}.{" "}
                    {t("askForPlace", { place: place.spoken })}
                  </span>
                </address>
              </div>
              <a
                href={place.maps}
                target="_blank"
                rel="noreferrer noopener"
                data-press
                data-cta="amber"
                className="mbs-5 inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-semibold text-ink"
              >
                {t("directions")}
                <IconArrowUpRight data-nudge aria-hidden size={16} stroke={2} />
              </a>
              <p className="mbs-5 text-sm text-on-primary">
                {t("findOn")}{" "}
                {socials.map((social, i) => (
                  <span key={social.label}>
                    {i ? ", " : ""}
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-on-blue-link
                    >
                      {social.label}
                    </a>
                  </span>
                ))}
                .
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.06} className="min-w-0 lg:col-span-7">
          <div className="rounded-[32px] bg-card p-6 shadow-[0_0_0_1px_var(--border)] sm:p-10">
            <h2 className="type-display-sm">{t("callBack")}</h2>
            <div className="mbs-6">
              <LeadForm bare />
            </div>
          </div>
        </Reveal>
      </section>

      <section
        id="centres"
        aria-labelledby="centres-heading"
        className="container-page pbe-20 md:pbe-28"
      >
        <Reveal>
          <h2 id="centres-heading" className="type-display">
            {t("centresHeading")}
          </h2>
          <p className="mbs-3 max-w-[52ch] text-lg text-muted-foreground">
            {centres("rest")}
          </p>
        </Reveal>
        <div className="mbs-10">
          <CentreFinder />
        </div>
      </section>

      <Faq courses={courses} limit={4} />
    </main>
  )
}
