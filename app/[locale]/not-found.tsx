import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { Link } from "@/i18n/navigation"

/** The branded 404, in the reader's language. */
export default function NotFound() {
  const t = useTranslations("NotFound")
  return (
    <main>
      <Section size="sm" className="pt-26 md:pt-30">
        <div className="max-w-160">
          <h1 className="type-display">
            <span className="text-foreground">{t("claim")}</span>{" "}
            <span className="text-muted-foreground">{t("rest")}</span>
          </h1>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/" className={buttonVariants()}>
              {t("home")}
            </Link>
            <Link
              href="/courses"
              className={buttonVariants({ variant: "secondary" })}
            >
              {t("courses")}
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({ variant: "ghost" })}
            >
              {t("talk")}
            </Link>
          </div>
        </div>
      </Section>
    </main>
  )
}
