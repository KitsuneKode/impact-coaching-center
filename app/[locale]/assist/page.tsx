import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconPhone,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { ButtonAnchor } from "@/components/ui/button"
import { Lede, Section } from "@/components/ui/section"
import { Link } from "@/i18n/navigation"
import { contact, formatPhone } from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { alternatesFor, openGraphFor } from "@/lib/site"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/assist">): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Assist" })
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/assist", locale),
    openGraph: openGraphFor("/assist", t("title"), t("description"), locale),
  }
}

/**
 * The scholarship test, stated only as far as ICT has published it. The rest
 * is listed as coming from ICT (see `toConfirm` in lib/brand.ts).
 */
export default async function AssistPage({
  params,
}: PageProps<"/[locale]/assist">) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Assist")
  const pending = t.raw("pendingItems") as string[]

  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <Lede as="h1" size="xl" claim={t("claim")} rest={t("rest")} />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonAnchor
            href={contactHref({ kind: "assist" })}
            target="_blank"
            size="lg"
          >
            <IconBrandWhatsapp stroke={1.6} aria-hidden />
            {t("notify")}
          </ButtonAnchor>
          <ButtonAnchor
            href={contactHref({ kind: "call" })}
            variant="secondary"
            size="lg"
          >
            <IconPhone stroke={1.6} aria-hidden />
            <span className="tnum">{formatPhone(contact.phones[0])}</span>
          </ButtonAnchor>
        </div>
      </Section>

      <Section size="sm" className="border-t border-border">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-border bg-card p-7 shadow-frame">
            <h2 className="text-lg font-bold">{t("known")}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {t("knownBody")}
            </p>
          </div>
          <div className="rounded-card bg-surface p-7">
            <h2 className="text-lg font-bold">{t("pending")}</h2>
            <ul className="mt-3">
              {pending.map((item) => (
                <li
                  key={item}
                  className="border-t border-border py-3 leading-relaxed text-muted-foreground first:border-t-0 first:pt-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section size="sm" className="border-t border-border">
        <h2 className="type-lede">
          <span className="text-foreground">{t("meanwhile")}.</span>{" "}
          <span className="text-muted-foreground">{t("meanwhileBody")}</span>
        </h2>
        <ul className="mt-6 max-w-xl">
          <li>
            <Link href="/courses" className="row-link">
              {t("courses")}
              <IconArrowRight size={16} stroke={1.75} aria-hidden />
            </Link>
          </li>
          <li>
            <Link href="/exams" className="row-link">
              {t("exams")}
              <IconArrowRight size={16} stroke={1.75} aria-hidden />
            </Link>
          </li>
        </ul>
      </Section>
    </main>
  )
}
