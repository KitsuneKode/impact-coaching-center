import { getTranslations, setRequestLocale } from "next-intl/server"
import { IconBrandWhatsapp, IconMapPin } from "@tabler/icons-react"
import type { Metadata } from "next"
import type { CSSProperties } from "react"

import { ButtonAnchor } from "@/components/ui/button"
import { CentreFinder } from "@/components/marketing/centre-finder"
import { Lede, Section } from "@/components/ui/section"
import { contact, formatPhone, links, place } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
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

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

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
  const t = await getTranslations("ContactPage")
  const tc = await getTranslations("Centres")
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <h1 className="enter type-display max-w-208" style={delay(0)}>
          <span className="text-foreground">{t("claim")}</span>{" "}
          <span className="text-muted-foreground">{t("rest")}</span>
        </h1>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="enter" style={delay(60)}>
            <h2 className="text-lg font-medium">{t("phone")}</h2>
            <ul className="mt-4 space-y-3">
              {contact.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex min-h-11 items-center text-[0.9375rem] text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="tnum">{formatPhone(phone)}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonAnchor
                href={contactHref({ kind: "workshop" })}
                target="_blank"
                size="lg"
              >
                <IconBrandWhatsapp stroke={1.6} />
                {t("whatsapp")}
              </ButtonAnchor>
            </div>

            <h2 className="mt-10 text-lg font-medium">{t("email")}</h2>
            <a
              href={`mailto:${contact.email}`}
              className="mt-3 inline-flex min-h-11 items-center text-[0.9375rem] text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {contact.email}
            </a>
          </div>

          <div className="enter" style={delay(120)}>
            <h2 className="text-lg font-medium">{t("centre")}</h2>
            <address className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground not-italic">
              Impact Career Tutorials
              <br />
              {place.street}
              <br />
              {place.city}, {place.region} {place.pin}
            </address>
            <div className="mt-4">
              <ButtonAnchor
                href={place.maps}
                target="_blank"
                variant="secondary"
                size="lg"
              >
                <IconMapPin stroke={1.6} />
                {t("maps")}
              </ButtonAnchor>
            </div>

            <h2 className="mt-10 text-lg font-medium">{t("elsewhere")}</h2>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center text-[0.9375rem] text-foreground underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        size="sm"
        id="centres"
        className="scroll-mt-24 border-t border-border"
      >
        <Lede
          label={tc("label")}
          claim={tc("claim")}
          rest={tc("rest")}
          className="mb-8"
        />
        <CentreFinder />
      </Section>
    </main>
  )
}
