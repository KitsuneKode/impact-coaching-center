import { useTranslations } from "next-intl"
import Image from "next/image"

import { LocaleSwitch } from "@/components/i18n/locale-switch"
import { Link } from "@/i18n/navigation"

import { brand, contact, formatPhone, links, place, tracks } from "@/lib/brand"

/** Kobbe's footer: identity on the left, quiet link columns, nothing else. */
export function SiteFooter() {
  const t = useTranslations("Footer")
  const columns = [
    {
      title: t("courses"),
      items: [
        // Each exam's section on /courses: never stale the way a batch name is.
        ...tracks.map((track) => ({
          label: track.exam,
          href: `/courses#${track.slug}`,
        })),
        { label: t("allCourses"), href: "/courses" },
      ],
    },
    {
      title: t("learn"),
      items: [
        { label: t("freeClasses"), href: "/#classes" },
        { label: t("exams"), href: "/exams" },
        { label: t("calendar"), href: "/exams/calendar" },
        { label: t("blog"), href: "/blog" },
        { label: t("youtubeChannel"), href: links.youtube, external: true },
        { label: t("app"), href: links.play, external: true },
        { label: t("login"), href: links.login, external: true },
      ],
    },
    {
      title: t("follow"),
      items: [
        { label: "Instagram", href: links.instagram, external: true },
        { label: "Facebook", href: links.facebook, external: true },
        { label: "YouTube", href: links.youtube, external: true },
      ],
    },
    {
      title: t("ict"),
      items: [
        { label: t("contact"), href: "/contact" },
        { label: t("centres"), href: "/contact#centres" },
        { label: t("privacy"), href: "/privacy" },
        { label: t("terms"), href: "/terms" },
        { label: t("shipping"), href: "/shipping" },
        { label: t("refunds"), href: "/refunds" },
      ],
    },
  ]
  return (
    <footer className="border-t border-border pb-28 md:pb-12">
      <div className="container-page grid gap-12 pt-14 md:grid-cols-[1.4fr_2fr] md:pt-16">
        <div>
          <Image
            src={brand.logo}
            alt={brand.legalName}
            width={1920}
            height={1032}
            className="h-14 w-auto"
          />
          <address className="mt-5 max-w-[28ch] text-sm leading-relaxed text-muted-foreground not-italic">
            {place.street}, {place.city}, {place.region} {place.pin}
          </address>
          <p className="tnum mt-3 text-sm">
            <a href={`tel:${contact.phones[0]}`} className="hover:underline">
              {formatPhone(contact.phones[0])}
            </a>
          </p>
          <p className="mt-1 text-sm">
            <a
              href={`mailto:${contact.email}`}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              {contact.email}
            </a>
          </p>
          <LocaleSwitch className="mt-6" />
        </div>

        <nav
          aria-label={t("label")}
          className="grid grid-cols-2 gap-8 sm:grid-cols-3"
        >
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.items.map((item) => (
                  <li key={item.label}>
                    {"external" in item && item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    ) : (
                      // Client-side navigation: a raw anchor reloads the whole
                      // document for a route that could have been a swap.
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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

      <div className="container-page mt-14">
        <p className="border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          {t("note", { name: brand.legalName, city: place.city })}
        </p>
      </div>
    </footer>
  )
}
