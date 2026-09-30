import {
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandYoutube,
  IconDeviceMobile,
  IconRosette,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { contact, courses, links, offer, place, tel, whatsapp } from "../_data"
import { container, external } from "../_kit/shared"
import { WordSpot } from "./word-spot"

/**
 * The large footer for the third round of prototypes: brand, two proof seals,
 * the address, four link columns and a wordmark that catches the pointer.
 * Styled by `--gf-*`, which default to the kit's `--k-*` tokens.
 */
export function GrandFooter({
  base,
  cta,
  word = "Impact",
}: {
  base: string
  /** a closing panel above the columns */
  cta?: ReactNode
  word?: string
}) {
  const columns = [
    {
      head: "Courses",
      items: [
        ...courses.map((c) => ({ label: c.exam, href: `${base}${c.href}` })),
        { label: offer.short, href: whatsapp, out: true },
      ],
    },
    {
      head: "Study free",
      items: [
        { label: "Free notes", href: `${base}/notes` },
        { label: "Books", href: `${base}/books` },
        { label: "Exams explained", href: `${base}/exams` },
        { label: "Results", href: `${base}/results` },
      ],
    },
    {
      head: "Visit",
      items: [
        { label: "Contact", href: `${base}/contact` },
        { label: "Directions", href: place.maps, out: true },
        { label: "WhatsApp", href: whatsapp, out: true },
        { label: "Call the centre", href: tel },
      ],
    },
    {
      head: "Policies",
      items: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Refunds", href: "/refunds" },
        { label: "Promotions kit", href: `${base}/promos` },
      ],
    },
  ]
  const socials = [
    { href: links.youtube, label: "YouTube", Icon: IconBrandYoutube },
    { href: links.instagram, label: "Instagram", Icon: IconBrandInstagram },
    { href: links.facebook, label: "Facebook", Icon: IconBrandFacebook },
    { href: links.play, label: "Google Play", Icon: IconBrandGooglePlay },
  ]

  return (
    <footer data-gf className="relative overflow-hidden">
      {cta ? <div className={`${container} pb-20`}>{cta}</div> : null}

      <div className={`${container} grid gap-14 pb-16 lg:grid-cols-12`}>
        <div className="lg:col-span-4">
          <Link href={base} className="inline-flex items-center gap-3">
            <span data-gf-mark className="grid size-11 place-items-center">
              <Image
                src="/brand/ict-mark.png"
                alt=""
                width={30}
                height={30}
                className="size-7"
              />
            </span>
            <span data-gf-brand>Impact Career Tutorials</span>
          </Link>
          <p className="mt-4 max-w-[34ch] text-sm text-[var(--gf-muted)]">
            Coaching for APSC, ADRE, Assam Police, Banking, SSC and Railway
            exams.
          </p>

          <ul className="mt-7 flex flex-wrap gap-3">
            <li>
              <a
                href={links.apscResultPdf}
                {...external}
                data-gf-seal
                className="flex h-[72px] w-[112px] flex-col items-center justify-center gap-1 text-center"
              >
                <IconRosette aria-hidden size={20} stroke={1.5} />
                <span className="text-[0.68rem] leading-tight font-semibold">
                  APSC CCE 2022
                  <br />
                  merit list
                </span>
              </a>
            </li>
            <li>
              <a
                href={links.play}
                {...external}
                data-gf-seal
                className="flex h-[72px] w-[112px] flex-col items-center justify-center gap-1 text-center"
              >
                <IconDeviceMobile aria-hidden size={20} stroke={1.5} />
                <span className="text-[0.68rem] leading-tight font-semibold">
                  Every class
                  <br />
                  on the app
                </span>
              </a>
            </li>
          </ul>

          <p data-gf-head className="mt-8">
            Find us at
          </p>
          <ul className="mt-2 flex gap-1">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  {...external}
                  aria-label={label}
                  data-gf-icon
                  className="grid size-11 place-items-center"
                >
                  <Icon aria-hidden size={19} stroke={1.5} />
                </a>
              </li>
            ))}
          </ul>

          <address
            data-gf-box
            className="mt-6 max-w-[260px] p-4 text-sm leading-relaxed not-italic"
          >
            {place.street}, {place.city}, {place.region} {place.pin}
            <span className="mt-3 block tabular-nums">
              {contact.phones
                .map((p) => p.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2"))
                .join(", ")}
            </span>
          </address>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:col-span-8"
        >
          {columns.map((col) => (
            <div key={col.head}>
              <p data-gf-head>{col.head}</p>
              <ul className="mt-4 grid gap-1">
                {col.items.map((it) => (
                  <li key={it.label}>
                    {"out" in it && it.out ? (
                      <a
                        href={it.href}
                        {...external}
                        data-gf-link
                        className="inline-flex min-h-10 items-center"
                      >
                        {it.label}
                      </a>
                    ) : (
                      <Link
                        href={it.href}
                        data-gf-link
                        className="inline-flex min-h-10 items-center"
                      >
                        {it.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <WordSpot data-gf-word aria-hidden>
        <span data-gf-word-base>{word}</span>
        <span data-gf-word-lit>{word}</span>
      </WordSpot>

      <div
        className={`${container} flex flex-wrap items-center justify-between gap-3 pt-4 pb-28 text-xs text-[var(--gf-muted)] md:pb-10`}
      >
        <p>© 2026 Impact Career Tutorials, {place.city}</p>
        <p>Prototype for review. Not the live site.</p>
      </div>
    </footer>
  )
}
