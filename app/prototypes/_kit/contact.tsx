import {
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlus,
} from "@tabler/icons-react"

import { formatPhone } from "@/lib/brand"

import { contact, faqs, links, place, whatsapp } from "../_data"
import { EnquiryForm } from "../_enquiry"
import { Reveal } from "../_reveal"
import { container, external, type KitProps } from "./shared"
import { PageHead } from "./head"

export function KitContact({ base }: KitProps) {
  const channels = [
    ...contact.phones.map((p) => ({
      key: p,
      Icon: IconPhone,
      label: "Call",
      value: formatPhone(p),
      href: `tel:${p}`,
    })),
    {
      key: "wa",
      Icon: IconBrandWhatsapp,
      label: "WhatsApp",
      value: formatPhone(contact.whatsapp),
      href: whatsapp,
    },
    {
      key: "mail",
      Icon: IconMail,
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
  ]

  return (
    <main>
      <PageHead
        base={base}
        trail={[{ label: "Contact" }]}
        title="Talk to ICT, or come and sit in on a class."
        lede="Tell us the exam and the time of day you can study. We will point you to the right batch."
      />

      <section
        className={`${container} grid items-start gap-6 pb-20 lg:grid-cols-12`}
      >
        <div className="grid gap-3 lg:col-span-5">
          {channels.map(({ key, Icon, label, value, href }, i) => (
            <Reveal key={key} delay={i * 0.04}>
              <a
                href={href}
                {...(href.startsWith("http") ? external : {})}
                data-k-card
                className="group flex items-center gap-4 rounded-[var(--k-radius)] p-4 pr-5"
              >
                <span
                  data-k-tile
                  className="grid size-12 shrink-0 place-items-center rounded-[var(--k-inner)]"
                >
                  <Icon aria-hidden size={22} stroke={1.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    data-k-wide
                    className="block text-[0.62rem] text-[var(--k-muted)]"
                  >
                    {label}
                  </span>
                  <span className="block truncate font-medium tabular-nums">
                    {value}
                  </span>
                </span>
                <IconArrowUpRight
                  aria-hidden
                  size={18}
                  stroke={1.5}
                  className="text-[var(--k-muted)] transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </Reveal>
          ))}

          <Reveal delay={0.2}>
            <div
              data-coat
              data-k-card
              className="rounded-[var(--k-radius)] p-6"
            >
              <div className="flex items-start gap-4">
                <span
                  data-k-tile
                  className="grid size-12 shrink-0 place-items-center rounded-[var(--k-inner)]"
                >
                  <IconMapPin aria-hidden size={22} stroke={1.5} />
                </span>
                <address className="not-italic">
                  <span className="block font-medium">Visit the centre</span>
                  <span className="mt-1 block text-[var(--k-muted)]">
                    {place.street}, {place.city}, {place.region} {place.pin}.
                    Ask for {place.spoken}.
                  </span>
                </address>
              </div>
              <a
                href={place.maps}
                {...external}
                data-k-press
                data-k-outline
                className="mt-5 inline-flex h-12 items-center gap-2 rounded-[var(--k-pill)] px-6 font-semibold"
              >
                Get directions
                <IconArrowUpRight aria-hidden size={16} stroke={1.75} />
              </a>
              <p className="mt-4 text-sm text-[var(--k-muted)]">
                Find ICT on{" "}
                <a
                  href={links.instagram}
                  {...external}
                  className="underline underline-offset-4 hover:text-[var(--k-ink)]"
                >
                  Instagram
                </a>
                ,{" "}
                <a
                  href={links.facebook}
                  {...external}
                  className="underline underline-offset-4 hover:text-[var(--k-ink)]"
                >
                  Facebook
                </a>{" "}
                and{" "}
                <a
                  href={links.youtube}
                  {...external}
                  className="underline underline-offset-4 hover:text-[var(--k-ink)]"
                >
                  YouTube
                </a>
                .
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.06} className="lg:col-span-7">
          <div
            data-coat
            data-k-card
            className="rounded-[var(--k-radius)] p-6 sm:p-10"
          >
            <h2 className="text-xl font-medium tracking-[-0.015em]">
              Request a call back.
            </h2>
            <div className="mt-6">
              <EnquiryForm />
            </div>
          </div>
        </Reveal>
      </section>

      <section
        aria-labelledby="faq-h"
        className={`${container} grid gap-8 pb-20 lg:grid-cols-12`}
      >
        <h2 id="faq-h" data-k-h2 className="lg:col-span-4">
          Questions.
        </h2>
        <div
          data-k-card
          className="rounded-[var(--k-radius)] px-6 py-2 sm:px-8 lg:col-span-8"
        >
          {faqs.map((f, i) => (
            <details
              key={f.q}
              data-k-faq
              className={`${i ? "border-t border-[var(--k-line)]" : ""}`}
            >
              <summary className="flex min-h-16 items-center justify-between gap-4 py-4">
                <span className="font-medium">{f.q}</span>
                <IconPlus
                  data-plus
                  aria-hidden
                  size={20}
                  stroke={1.5}
                  className="shrink-0 text-[var(--k-muted)]"
                />
              </summary>
              <p className="max-w-[62ch] pb-5 text-[var(--k-muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  )
}
