import type { Metadata, Viewport } from "next"
import { Inter, Noto_Sans_Bengali } from "next/font/google"

import "./globals.css"
import { MobileActionBar } from "@/components/marketing/mobile-action-bar"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { EdgeBlur } from "@/components/motion/edge-blur"
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
    default: "Impact Career Tutorials | APSC and ADRE coaching in North Lakhimpur",
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
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={cn(sans.variable, assamese.variable, "antialiased")}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <SiteHeader />
        <EdgeBlur />
        {children}
        <SiteFooter />
        <MobileActionBar />
      </body>
    </html>
  )
}
