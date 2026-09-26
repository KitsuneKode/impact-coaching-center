import {
  IconBook2,
  IconFileText,
  IconLayoutDashboard,
  IconMessageCircle,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Section } from "@/components/ui/section"

export const metadata: Metadata = { title: "Everything built" }

const surfaces = [
  {
    icon: IconMessageCircle,
    title: "Enquiries",
    body: "The form on every page, delivered to the staff inbox in seconds.",
    href: "/#enquire",
    state: "Live",
  },
  {
    icon: IconLayoutDashboard,
    title: "Staff dashboard",
    body: "Enquiries, follow-ups, notes, orders and staff access.",
    href: "/admin",
    state: "Live",
  },
  {
    icon: IconUser,
    title: "Student accounts",
    body: "Log in with a WhatsApp code, three quick questions, account page.",
    href: "/account",
    state: "Live",
  },
  {
    icon: IconBook2,
    title: "Books and cart",
    body: "Browse, preview, add to cart. Checkout opens with payments.",
    href: "/preview/books",
    state: "Preview",
  },
  {
    icon: IconFileText,
    title: "Free resources",
    body: "Notes and papers that open after a phone check.",
    href: "/preview/resources",
    state: "Preview",
  },
  {
    icon: IconShieldCheck,
    title: "Policies",
    body: "Privacy, terms, refunds and shipping, ready for ICT's details.",
    href: "/privacy",
    state: "Draft",
  },
] as const

export default function PreviewOverview() {
  return (
    <Section size="sm" className="pt-10 md:pt-12">
      <h1 className="type-display-sm max-w-208">
        Everything built for ICT so far.
      </h1>
      <p className="type-lede mt-3 max-w-160 text-muted-foreground">
        Live screens work today. Previews show the next phase with sample
        content.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {surfaces.map((s) => (
          <li key={s.title}>
            <Link
              href={s.href}
              className="group flex h-full flex-col gap-3 rounded-card border border-border bg-card p-5 transition-[border-color,transform] duration-200 ease-out hover:border-foreground/30 active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <s.icon stroke={1.5} className="size-6" aria-hidden />
                <span
                  className={
                    s.state === "Live"
                      ? "rounded-full bg-primary px-2 py-0.5 text-[0.6875rem] font-medium text-primary-foreground"
                      : "rounded-full border border-border px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground"
                  }
                >
                  {s.state}
                </span>
              </div>
              <h2 className="font-medium">{s.title}</h2>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
