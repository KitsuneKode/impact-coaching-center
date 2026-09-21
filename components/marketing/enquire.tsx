import {
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react"

import { LeadForm } from "@/components/marketing/lead-form"
import { Reveal } from "@/components/motion/reveal"
import { Section } from "@/components/ui/section"
import { contact, formatPhone, joining, offer, place } from "@/lib/brand"
import { contactHref } from "@/lib/contact"

/**
 * Where the page converts. The joining steps sit beside the form so the
 * visitor can see exactly what happens after they press the button, which is
 * the question that stops most people from pressing it.
 */
export function Enquire() {
  return (
    <Section id="enquire">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <h2 className="type-display max-w-[32rem]">
            <span className="text-foreground">{offer.cta}.</span>
            <span className="text-muted-foreground">
              {" "}
              Leave your number and ICT will call you to fix a time, or walk in
              to the centre on {place.spoken}.
            </span>
          </h2>

          <ol className="mt-10 space-y-6">
            {joining.map((step, index) => (
              <li key={step.verb} className="relative flex gap-4">
                <span className="relative flex flex-col items-center">
                  <span className="tnum grid size-7 place-items-center rounded-full border border-border bg-card text-xs font-medium shadow-frame">
                    {index + 1}
                  </span>
                  {index < joining.length - 1 ? (
                    <span aria-hidden className="mt-1 w-px flex-1 bg-border" />
                  ) : null}
                </span>
                <span className="pb-1">
                  <span className="block text-[0.9875rem] font-medium">
                    {step.verb}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <dl className="mt-10 grid gap-4 border-t border-border pt-8 text-sm sm:grid-cols-2">
            <div className="flex gap-3">
              <IconPhone
                size={18}
                stroke={1.6}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <dt className="text-muted-foreground">Call</dt>
                <dd className="tnum mt-0.5 flex flex-col font-medium">
                  <a
                    href={contactHref({ kind: "call" })}
                    className="hover:underline"
                  >
                    {formatPhone(contact.phones[0])}
                  </a>
                  <a
                    href={`tel:${contact.phones[1]}`}
                    className="hover:underline"
                  >
                    {formatPhone(contact.phones[1])}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <IconBrandWhatsapp
                size={18}
                stroke={1.6}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd className="mt-0.5 font-medium">
                  <a
                    href={contactHref({ kind: "workshop" })}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="tnum hover:underline"
                  >
                    {formatPhone(contact.whatsapp)}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <IconMapPin
                size={18}
                stroke={1.6}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div>
                <dt className="text-muted-foreground">Walk in</dt>
                <dd className="mt-0.5 font-medium">
                  {place.street}, {place.city}, {place.region} {place.pin}
                </dd>
                <dd className="mt-1">
                  <a
                    href={place.maps}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link inline-flex items-center gap-0.5"
                  >
                    Open in Google Maps
                    <IconArrowUpRight size={14} stroke={1.75} />
                  </a>
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-8 overflow-hidden rounded-card border border-border bg-card shadow-frame">
            <div className="relative aspect-[16/9] bg-surface">
              <iframe
                title="Impact Career Tutorials on Google Maps"
                src={`https://www.google.com/maps?q=${place.lat},${place.lng}&z=17&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0 grayscale-[0.2]"
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                D C Bunglow Road, Ward no 8
              </p>
              <a
                href={place.maps}
                target="_blank"
                rel="noreferrer noopener"
                className="link shrink-0 text-sm"
              >
                Directions
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <LeadForm />
        </Reveal>
      </div>
    </Section>
  )
}
