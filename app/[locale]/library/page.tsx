import { getTranslations, setRequestLocale } from "next-intl/server"

import { contentFor } from "@/i18n/content-server"
import { IconBrandWhatsapp } from "@tabler/icons-react"
import type { Metadata } from "next"
import type { CSSProperties } from "react"

import { ButtonAnchor, buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { DraftNotice } from "@/components/ui/draft-notice"
import { Section } from "@/components/ui/section"
import { contact, formatPhone, place } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { libraryApproved, libraryFacts, libraryUpdated } from "@/lib/library"
import { alternatesFor, openGraphFor } from "@/lib/site"

const title = "The library at ICT"
const description =
  "The library and study space at Impact Career Tutorials in North Lakhimpur: WiFi, study material, and a culture of group study."

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/library">): Promise<Metadata> {
  const { locale } = await params
  return {
    title,
    description,
    alternates: alternatesFor("/library", locale),
    openGraph: openGraphFor("/library", title, description, locale),
    ...(libraryApproved ? {} : { robots: { index: false, follow: true } }),
  }
}

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

const drafted = new Date(`${libraryUpdated}T00:00:00Z`).toLocaleDateString(
  "en-IN",
  { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
)

/** Deliberately thin. */
export default async function LibraryPage({
  params,
}: PageProps<"/[locale]/library">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Library")
  const { place: spoken } = await contentFor(locale)
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <h1 className="enter type-display max-w-208" style={delay(0)}>
          <span className="text-foreground">{t("claim")}</span>{" "}
          <span className="text-muted-foreground">{t("rest")}</span>
        </h1>

        {libraryApproved ? null : (
          <div className="enter mt-8" style={delay(60)}>
            <DraftNotice drafted={drafted}>{t("draft")}</DraftNotice>
          </div>
        )}

        <div className="mt-14 max-w-160">
          {libraryFacts.map((fact, index) => (
            <section
              key={fact.heading}
              className={index > 0 ? "mt-10" : undefined}
            >
              <h2 className="text-lg font-medium text-foreground">
                {fact.heading}
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {fact.body}
              </p>
            </section>
          ))}

          <section className="mt-14 rounded-card border border-border bg-surface p-6 md:p-8">
            <h2 className="text-lg font-medium text-foreground">
              {t("askTitle")}
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
              {t("askBody", { place: spoken, city: place.city })}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonAnchor
                href={contactHref({ kind: "workshop" })}
                target="_blank"
                size="lg"
              >
                <IconBrandWhatsapp stroke={1.6} />
                {t("whatsapp")}
              </ButtonAnchor>
              <ButtonAnchor
                href={contactHref({ kind: "call" })}
                variant="secondary"
                size="lg"
              >
                {t("call")}{" "}
                <span className="tnum">{formatPhone(contact.phones[0])}</span>
              </ButtonAnchor>
              <Link
                href="/contact"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                {t("allContact")}
              </Link>
            </div>
          </section>
        </div>
      </Section>
    </main>
  )
}
