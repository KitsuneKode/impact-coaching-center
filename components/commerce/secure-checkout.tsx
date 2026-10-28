import {
  IconCreditCard,
  IconLock,
  IconReceipt,
  IconShoppingBag,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

/**
 * What protects the buyer, said where the money is: Razorpay holds the
 * payment details, a receipt follows, the cart survives a closed window.
 * Every line is how checkout already behaves (app/(plain)/checkout), not a
 * badge. While sets are ordered on WhatsApp no payment happens here, so the
 * card says that instead.
 */
export function SecureCheckout({
  mode,
  className,
}: {
  mode: "online" | "whatsapp"
  className?: string
}) {
  const t = useTranslations("Shop")
  const points =
    mode === "online"
      ? ([
          [IconLock, "securePay"],
          [IconCreditCard, "secureMethods"],
          [IconReceipt, "secureReceipt"],
          [IconShoppingBag, "secureCart"],
        ] as const)
      : ([
          [IconLock, "secureWhatsApp"],
          [IconReceipt, "secureReceipt"],
        ] as const)
  return (
    <section
      aria-labelledby="secure-heading"
      className={cn("grid gap-3 text-sm", className)}
    >
      <h2
        id="secure-heading"
        className="flex items-center gap-2 font-semibold text-foreground"
      >
        <IconLock aria-hidden size={16} stroke={2} className="text-verified" />
        {t("secureTitle")}
      </h2>
      <ul className="grid gap-2.5 text-muted-foreground">
        {points.map(([Icon, key]) => (
          <li key={key} className="flex gap-2.5">
            <Icon
              aria-hidden
              size={16}
              stroke={1.75}
              className="mbs-0.5 flex-none text-foreground"
            />
            <span className="text-pretty">{t(key)}</span>
          </li>
        ))}
      </ul>
      <p className="flex gap-4 pbs-1">
        <Link href="/refunds" className="link">
          {t("stepsRefunds")}
        </Link>
        <Link href="/shipping" className="link">
          {t("stepsShipping")}
        </Link>
      </p>
    </section>
  )
}
