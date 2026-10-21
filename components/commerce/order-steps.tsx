import {
  IconBooks,
  IconShieldCheck,
  IconTruckDelivery,
} from "@tabler/icons-react"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"

/**
 * What happens after "Add to cart", said before anyone has to find out:
 * choose, pay, receive. Ends on the two policies a buyer checks first.
 */
export async function OrderSteps() {
  const t = await getTranslations("Shop")
  const steps = [
    { icon: IconBooks, title: t("step1"), body: t("step1Body") },
    { icon: IconShieldCheck, title: t("step2"), body: t("step2Body") },
    { icon: IconTruckDelivery, title: t("step3"), body: t("step3Body") },
  ]
  return (
    <section
      aria-labelledby="order-steps"
      className="container-page grid gap-8 pbe-20"
    >
      <h2 id="order-steps" className="type-display-sm">
        {t("stepsHeading")}
      </h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <li
            key={title}
            data-join-step
            className="grid content-start gap-2 rounded-card p-5 md:p-6"
          >
            <span className="flex items-center gap-3">
              <span className="tnum font-display text-3xl font-semibold text-primary">
                {i + 1}
              </span>
              <Icon
                aria-hidden
                size={22}
                stroke={1.5}
                className="text-muted-foreground"
              />
            </span>
            <span className="text-lg font-semibold">{title}</span>
            <span className="text-pretty text-muted-foreground">{body}</span>
          </li>
        ))}
      </ol>
      <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link
          href="/refunds"
          data-quiet-link
          className="underline underline-offset-4"
        >
          {t("stepsRefunds")}
        </Link>
        <Link
          href="/shipping"
          data-quiet-link
          className="underline underline-offset-4"
        >
          {t("stepsShipping")}
        </Link>
      </p>
    </section>
  )
}
