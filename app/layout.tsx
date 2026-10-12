import type { Metadata, Viewport } from "next"
import { Anek_Bangla, Anek_Latin } from "next/font/google"

import "./globals.css"
import { Providers } from "@/app/providers"
import { ThemePreview } from "@/components/dev/theme-preview"
import { brand, contact, links, place } from "@/lib/brand"
import { indexable, openGraphFor, siteUrl } from "@/lib/site"
import { themeInitScript } from "@/lib/theme"
import { cn } from "@/lib/utils"

/*
 * One superfamily for both languages: Anek Latin and Anek Bangla share their
 * design, so English and Assamese read as one voice. Variable fonts, used at
 * exactly two weights (700 and 400, enforced in globals.css).
 */
const sans = Anek_Latin({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const assamese = Anek_Bangla({
  subsets: ["bengali"],
  variable: "--font-as",
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
  alternates: { canonical: "/" },
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
      className={cn(sans.variable, assamese.variable, "antialiased")}
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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
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
