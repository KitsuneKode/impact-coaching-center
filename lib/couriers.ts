/**
 * Couriers ICT may hand parcels to, each with the page where a buyer types
 * in the tracking number. None of them publishes a stable per-parcel link,
 * so the site copies the number and opens that page.
 */
export const COURIERS = [
  { name: "India Post", site: "https://www.indiapost.gov.in/" },
  { name: "DTDC", site: "https://www.dtdc.in/" },
  { name: "Delhivery", site: "https://www.delhivery.com/" },
  { name: "Blue Dart", site: "https://www.bluedart.com/" },
] as const

/** The tracking page for a courier by name, or null for one not listed. */
export function courierSite(name: string): string | null {
  const known = COURIERS.find(
    (courier) => courier.name.toLowerCase() === name.trim().toLowerCase()
  )
  return known?.site ?? null
}
