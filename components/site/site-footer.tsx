import {
  IconBrandFacebook,
  IconBrandGooglePlay,
  IconBrandInstagram,
  IconBrandYoutube,
  IconDeviceMobile,
  IconRosette,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { useContent } from "@/i18n/content"
import { Link } from "@/i18n/navigation"
import {
  agency,
  brand,
  contact,
  formatPhone,
  links,
  place,
  tracks,
} from "@/lib/brand"
import { contactHref } from "@/lib/contact"
import { WordSpot } from "./word-spot"

const external = { target: "_blank", rel: "noreferrer noopener" } as const

type Item = { label: string; href: string; out?: boolean }

/**
 * The big footer: brand, two proof seals, the address, four link columns and
 * a wordmark that catches the mouse. Styles in globals.css, "Site footer".
 */
export function SiteFooter() {
  const t = useTranslations("Pulse")
  const nav = useTranslations("Nav")
  const offer = useTranslations("Offer")
  const content = useContent()
  const year = new Date().getFullYear()

  const columns: { head: string; items: Item[] }[] = [
    {
      head: t("fCourses"),
      items: [
        ...tracks.map((track) => ({
          label: content.track(track.slug).exam,
          href: `/courses#${track.slug}`,
        })),
        {
          label: offer("short"),
          href: contactHref({ kind: "workshop" }),
          out: true,
        },
      ],
    },
    {
      head: t("fStudy"),
      items: [
        { label: nav("notes"), href: "/resources" },
        { label: nav("books"), href: "/books" },
        { label: t("examsExplained"), href: "/exams" },
        { label: nav("results"), href: "/success-stories" },
        { label: nav("teachersPage"), href: "/teachers" },
        { label: nav("library"), href: "/library" },
        { label: nav("blog"), href: "/blog" },
      ],
    },
    {
      head: t("fVisit"),
      items: [
        { label: nav("contact"), href: "/contact" },
        { label: t("directions"), href: place.maps, out: true },
        {
          label: t("whatsapp"),
          href: `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`,
          out: true,
        },
        { label: t("callCentre"), href: contactHref({ kind: "call" }) },
      ],
    },
    {
      head: t("fPolicies"),
      items: [
        { label: t("privacy"), href: "/privacy" },
        { label: t("terms"), href: "/terms" },
        { label: t("refunds"), href: "/refunds" },
        { label: t("shipping"), href: "/shipping" },
      ],
    },
  ]
  const socials = [
    { href: links.youtube, label: "YouTube", Icon: IconBrandYoutube },
    { href: links.instagram, label: "Instagram", Icon: IconBrandInstagram },
    { href: links.facebook, label: "Facebook", Icon: IconBrandFacebook },
    { href: links.play, label: "Google Play", Icon: IconBrandGooglePlay },
  ]
  const seal = (text: string) => {
    const [a, b] = text.split("|")
    return (
      <>
        {a}
        <br />
        {b}
      </>
    )
  }

  return (
    <footer data-site-footer>
      <div className="container-page grid gap-14 pbe-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <span data-footer-mark className="grid size-11 place-items-center">
              <Image
                src={brand.mark}
                alt=""
                width={30}
                height={30}
                className="size-7"
              />
            </span>
            <span data-footer-brand>{brand.legalName}</span>
          </Link>
          <p className="mbs-4 max-w-[34ch] text-sm text-muted-foreground">
            {t("footerTagline")}
          </p>

          <ul className="mbs-7 flex flex-wrap gap-3">
            <li>
              <a
                href={links.apscResultPdf}
                {...external}
                data-footer-seal
                className="flex h-[72px] w-[112px] flex-col items-center justify-center gap-1 text-center"
              >
                <IconRosette aria-hidden size={20} stroke={1.5} />
                <span className="text-[0.68rem] leading-tight font-semibold">
                  {seal(t("sealMerit"))}
                </span>
              </a>
            </li>
            <li>
              <a
                href={links.play}
                {...external}
                data-footer-seal
                className="flex h-[72px] w-[112px] flex-col items-center justify-center gap-1 text-center"
              >
                <IconDeviceMobile aria-hidden size={20} stroke={1.5} />
                <span className="text-[0.68rem] leading-tight font-semibold">
                  {seal(t("sealApp"))}
                </span>
              </a>
            </li>
          </ul>

          <p data-footer-head className="mbs-8">
            {t("findUs")}
          </p>
          <ul className="mbs-2 flex gap-1">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  {...external}
                  aria-label={label}
                  data-footer-icon
                  className="grid size-11 place-items-center"
                >
                  <Icon aria-hidden size={19} stroke={1.5} />
                </a>
              </li>
            ))}
          </ul>

          <address
            data-footer-box
            className="mbs-6 max-w-[260px] p-4 text-sm leading-relaxed not-italic"
          >
            {place.street}, {place.city}, {place.region} {place.pin}
            <span className="tnum mbs-3 block">
              {contact.phones.map(formatPhone).join(", ")}
            </span>
          </address>
        </div>

        <nav
          aria-label={t("footerNav")}
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:col-span-8"
        >
          {columns.map((column) => (
            <div key={column.head}>
              <p data-footer-head>{column.head}</p>
              <ul className="mbs-4 grid gap-1">
                {column.items.map((item) => (
                  <li key={item.label}>
                    {item.out ? (
                      <a
                        href={item.href}
                        {...external}
                        data-footer-link
                        className="inline-flex min-h-10 min-w-6 items-center"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        data-footer-link
                        className="inline-flex min-h-10 min-w-6 items-center"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <WordSpot>
        <span data-footer-word-base>Impact</span>
        <span data-footer-word-lit>Impact</span>
      </WordSpot>

      <div className="container-page flex flex-wrap items-center justify-between gap-3 pbs-4 pbe-28 text-xs text-muted-foreground md:pbe-10">
        <p>{t("copyright", { year, city: place.city })}</p>
        <p>
          {t.rich("builtBy", {
            name: agency.name,
            agency: (chunks) => (
              <a
                href={agency.url}
                target="_blank"
                rel="noopener"
                data-agency
                className="font-medium text-foreground/70 underline decoration-foreground/20 underline-offset-4 hover:text-foreground hover:decoration-foreground/60"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
    </footer>
  )
}
