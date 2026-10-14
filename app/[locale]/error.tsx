"use client"

import { useLocale, useTranslations } from "next-intl"
import { useEffect } from "react"

import { PigeonholeFigure } from "@/components/site/pigeonhole-figure"
import { Button, ButtonLink } from "@/components/ui/button"
import { Section } from "@/components/ui/section"

/**
 * A page that throws, inside the site: the header, footer and language stay,
 * so the visitor can retry or go elsewhere. The 404 cabinet, lamp out.
 */
export default function LocaleError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const t = useTranslations("ErrorPage")
  const nf = useTranslations("NotFound")
  const locale = useLocale()

  useEffect(() => {
    // `digest` ties a visitor's report to the server log for this failure.
    console.error("[route error]", error.digest ?? "", error)
  }, [error])

  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="max-w-160 lg:col-span-5">
            <h1 className="type-display">
              <span className="text-foreground">{t("claim")}</span>{" "}
              <span className="text-muted-foreground">{t("rest")}</span>
            </h1>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button onClick={() => retry()}>{t("retry")}</Button>
              <ButtonLink
                href={locale === "as" ? "/as" : "/"}
                variant="secondary"
              >
                {t("home")}
              </ButtonLink>
              <ButtonLink
                href={locale === "as" ? "/as/contact" : "/contact"}
                variant="ghost"
              >
                {t("talk")}
              </ButtonLink>
            </div>
            {error.digest ? (
              <p className="tnum mt-8 text-sm text-muted-foreground">
                {t("reference", { digest: error.digest })}
              </p>
            ) : null}
          </div>
          <div className="lg:col-span-7">
            <PigeonholeFigure
              mode="error"
              prefix={locale === "as" ? "/as" : ""}
              names={nf.raw("figNames") as string[]}
              labels={{
                title: nf("figTitle"),
                hint: t("figHint"),
                empty: nf("figEmpty"),
                open: nf("figOpen"),
                out: nf("figOut"),
              }}
            />
          </div>
        </div>
      </Section>
    </main>
  )
}
