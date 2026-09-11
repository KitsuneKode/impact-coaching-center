import Image from "next/image"

import { brand, contact, formatPhone, links, place, tracks } from "@/lib/brand"
import { courseById } from "@/lib/catalogue"

const columns = [
  {
    title: "Courses",
    items: [
      ...tracks.map((track) => {
        const course = courseById(track.flagshipId)
        return { label: course?.short ?? track.exam, href: `/courses/${course?.slug ?? ""}` }
      }),
      { label: "All courses", href: "/courses" },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Free classes", href: "/#classes" },
      { label: "YouTube channel", href: links.youtube, external: true },
      { label: "Get the ICT app", href: links.play, external: true },
      { label: "Student login", href: links.login, external: true },
    ],
  },
  {
    title: "Follow",
    items: [
      { label: "Instagram", href: links.instagram, external: true },
      { label: "Facebook", href: links.facebook, external: true },
      { label: "YouTube", href: links.youtube, external: true },
    ],
  },
] as const

/** Kobbe's footer: identity on the left, quiet link columns, nothing else. */
export function SiteFooter() {
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
            <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-foreground hover:underline">
              {contact.email}
            </a>
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...("external" in item && item.external
                        ? { target: "_blank", rel: "noreferrer noopener" }
                        : {})}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="container-page mt-14">
        <p className="border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          {brand.legalName}, {place.city}. Selection serials are from the APSC CCE 2022
          result published on 17 January 2024.
        </p>
      </div>
    </footer>
  )
}
