import {
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react"
import type { Metadata } from "next"

import { formatPhone } from "@/lib/brand"

import { contact, faqs, links, place, whatsapp } from "../../_data"
import { EnquiryForm } from "../../_enquiry"
import { Reveal } from "../../_reveal"
import { container, external, PageHead } from "../_shared"

export const metadata: Metadata = { title: "Contact" }

export default function Contact() {
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
                data-lv-card
                className="group flex items-center gap-4 rounded-[14px] p-4 pr-5"
              >
                <span
                  data-lv-btn
                  className="grid size-12 shrink-0 place-items-center rounded-lg"
                >
                  <Icon aria-hidden size={22} stroke={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-[var(--lv-muted)]">
                    {label}
                  </span>
                  <span
                    data-lv-display
                    className="block truncate text-2xl tabular-nums"
                  >
                    {value}
                  </span>
                </span>
                <IconArrowUpRight
                  aria-hidden
                  size={20}
                  stroke={2}
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </Reveal>
          ))}

          <Reveal delay={0.2}>
            <div data-lv-board className="rounded-[14px] p-6" data-dark>
              <div className="flex items-start gap-4">
                <span
                  data-lv-btn
                  className="grid size-12 shrink-0 place-items-center rounded-lg"
                >
                  <IconMapPin aria-hidden size={22} stroke={1.75} />
                </span>
                <address className="not-italic">
                  <span data-lv-display className="block text-2xl">
                    Visit the centre
                  </span>
                  <span className="mt-1 block text-[var(--lv-on-navy)]">
                    {place.street}, {place.city}, {place.region} {place.pin}.
                    Ask for {place.spoken}.
                  </span>
                </address>
              </div>
              <a
                href={place.maps}
                {...external}
                data-lv-press
                data-lv-btn
                className="mt-5 inline-flex h-12 items-center gap-2 rounded-lg px-6 font-bold"
              >
                Get directions
                <IconArrowUpRight aria-hidden size={16} stroke={2.25} />
              </a>
              <p className="mt-4 text-sm text-[var(--lv-on-navy)]">
                Find ICT on{" "}
                <a
                  href={links.instagram}
                  {...external}
                  className="underline underline-offset-4 hover:text-white"
                >
                  Instagram
                </a>
                ,{" "}
                <a
                  href={links.facebook}
                  {...external}
                  className="underline underline-offset-4 hover:text-white"
                >
                  Facebook
                </a>{" "}
                and{" "}
                <a
                  href={links.youtube}
                  {...external}
                  className="underline underline-offset-4 hover:text-white"
                >
                  YouTube
                </a>
                .
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.06} className="lg:col-span-7">
          <div data-lv-card className="rounded-[14px] p-6 sm:p-10">
            <h2 data-lv-display className="text-4xl">
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
        className="bg-[var(--lv-sky)] py-20 md:py-24"
      >
        <div className={container}>
          <h2 id="faq-h" data-lv-h2>
            Questions.
          </h2>
          <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt data-lv-display className="text-2xl">
                  {f.q}
                </dt>
                <dd className="mt-2 font-medium text-[var(--lv-on-sky)]">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  )
}
