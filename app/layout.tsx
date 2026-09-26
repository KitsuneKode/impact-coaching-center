import type { Metadata, Viewport } from "next"
import { Fraunces, Inter, Noto_Sans_Bengali } from "next/font/google"

import "./globals.css"
import { Providers } from "@/app/providers"
import { ThemePreview } from "@/components/dev/theme-preview"
import { SiteChrome } from "@/components/marketing/site-chrome"
import { brand, contact, links, place } from "@/lib/brand"
import { indexable, siteUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

/* Inter, the variable cut kobbe.io ships. One family: hierarchy comes from
   tone and size, and headings stay at regular weight, which is most of what
   makes that site read so calm. */
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

/* Fraunces for headings only. */
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  // Only the axis that is actually varied. SOFT and WONK were requested and
  // then pinned to 0 in the stylesheet, which is payload bought for nothing -
  // on this audience's connections that is the difference that matters.
  axes: ["opsz"],
})

/* Loaded because ICT genuinely teaches in Assamese. */
const assamese = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-as",
  weight: ["400", "500"],
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Impact Career Tutorials | APSC and ADRE coaching in North Lakhimpur",
    template: "%s | Impact Career Tutorials",
  },
  description:
    "APSC, ADRE 3.0, Assam Police, Bank, SSC and Railway coaching on DC Bungalow Road, North Lakhimpur. Start with a free workshop, or watch the faculty teach on YouTube first.",
  keywords: [
    "APSC coaching North Lakhimpur",
    "ADRE 3.0 coaching Assam",
    "Assam Police coaching Lakhimpur",
    "Impact Career Tutorials",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: brand.legalName,
    title: "Crack APSC from North Lakhimpur",
    description:
      "Classroom, night batch, and the ICT app, with faculty you can watch teach on YouTube before you pay anything.",
  },
  twitter: { card: "summary_large_image" },
  robots: indexable
    ? { index: true, follow: true }
    : { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#faf9f7",
  colorScheme: "light",
}

/**
 * EducationalOrganization plus LocalBusiness: the schema that earns a map-pack
 * placement for a physical coaching centre, which is where this institute's
 * search traffic will come from.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  "@id": `${siteUrl}/#organization`,
  name: brand.legalName,
  alternateName: brand.shortName,
  url: siteUrl,
  logo: `${siteUrl}${brand.logo}`,
  image: `${siteUrl}${brand.banner}`,
  description:
    "Coaching institute for APSC, ADRE, Assam Police, Bank, SSC and Railway examinations in North Lakhimpur, Assam.",
  telephone: contact.phones[0],
  email: contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: place.street,
    addressLocality: place.city,
    addressRegion: place.region,
    postalCode: place.pin,
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng },
  areaServed: { "@type": "AdministrativeArea", name: "Assam" },
  sameAs: [links.youtube, links.instagram, links.facebook, links.play],
}

export default function RootLayout({
  children,
  authModal,
}: Readonly<{ children: React.ReactNode; authModal: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={cn(
        sans.variable,
        display.variable,
        assamese.variable,
        "antialiased"
      )}
      // Browser extensions add attributes to <html> before React hydrates;
      // without this React reports each one as a hydration mismatch.
      suppressHydrationWarning
    >
      {/*
        `<body>` needs the same treatment as `<html>`, for the same reason and a
        different set of extensions.
      */}
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Providers>
          {/*
            WCAG 2.4.1, Level A. The header renders the whole navigation before the
            content on every page, so without this a keyboard or switch user tabs
            through it again on each route.
          */}
          <a
            href="#main"
            className="sr-only rounded-control bg-primary px-4 py-2 text-primary-foreground focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-100"
          >
            Skip to content
          </a>
          {/*
            SiteChrome decides whether this route gets the public header, footer, edge
            blur and call bar. /admin gets none of them:
          */}
          <SiteChrome>
            <div id="main" tabIndex={-1} className="outline-none">
              {children}
            </div>
          </SiteChrome>
          {/*
            The intercepted /login and /register routes render here, over the
            page the visitor was already on. app/@authModal/default.tsx keeps
            this empty the rest of the time.
          */}
          {authModal}
          {/*
            Palette comparison harness, development only. Never reaches a
            visitor; delete with components/dev/theme-preview.tsx once KIT-67
            picks a palette.
          */}
          {process.env.NODE_ENV === "development" ? <ThemePreview /> : null}
        </Providers>
      </body>
    </html>
  )
}
