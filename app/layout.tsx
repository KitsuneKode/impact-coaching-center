import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"

import "./globals.css"
import { InlineScript } from "@/components/site/inline-script"
import { Providers } from "@/app/providers"
import { brand, contact, links, place } from "@/lib/brand"
import { indexable, openGraphFor, siteUrl } from "@/lib/site"
import { themeInitScript } from "@/lib/theme"
import { cn } from "@/lib/utils"

/*
 * Pulse: Figtree for reading, Unbounded for headings, Anek Bangla for
 * Assamese. Served from our own files (fontsource), so a build never depends
 * on reaching Google Fonts.
 */
const sans = localFont({
  src: [
    {
      path: "../node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2",
    },
    {
      path: "../node_modules/@fontsource-variable/figtree/files/figtree-latin-ext-wght-normal.woff2",
    },
  ],
  variable: "--font-sans",
  weight: "300 900",
  display: "swap",
})

const display = localFont({
  src: "../node_modules/@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2",
  variable: "--font-display",
  weight: "200 900",
  display: "swap",
})

const assamese = localFont({
  src: "../node_modules/@fontsource-variable/anek-bangla/files/anek-bangla-bengali-wght-normal.woff2",
  variable: "--font-as",
  weight: "100 800",
  display: "swap",
  // English pages rarely need it; Assamese pages fetch it on first use.
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
  // No canonical here: it would reach the account, checkout, admin and
  // receipt pages, telling search engines each of them is the home page.
  // Public pages set their own (app/[locale]/layout.tsx and each page).
  openGraph: openGraphFor(
    "/",
    "Crack APSC from North Lakhimpur",
    "Classroom, night batch, and the ICT app, with faculty you can watch teach on YouTube before you pay anything."
  ),
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
        {/*
          Sets data-theme from localStorage before first paint. Has to live
          here, in the server layout: the same script inside ThemeProvider is
          a client render, and React 19 will not execute it.
        */}
        <InlineScript code={themeInitScript()} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Providers>
          {children}
          {/*
            The intercepted /login and /register routes render here, over the
            page the visitor was already on. app/@authModal/default.tsx keeps
            this empty the rest of the time.
          */}
          {authModal}
        </Providers>
      </body>
    </html>
  )
}
