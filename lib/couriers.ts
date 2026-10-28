/**
 * Couriers ICT may hand parcels to, each with the page where a buyer types
 * in the tracking number. Delhivery, ICT's courier, also has a page per
 * parcel, so its buyers land straight on their own.
 */
export const COURIERS = [
  {
    name: "Delhivery",
    site: "https://www.delhivery.com/",
    parcel: (waybill: string) =>
      `https://www.delhivery.com/track-v2/package/${encodeURIComponent(waybill.trim())}`,
  },
  { name: "India Post", site: "https://www.indiapost.gov.in/" },
  { name: "DTDC", site: "https://www.dtdc.in/" },
  { name: "Blue Dart", site: "https://www.bluedart.com/" },
] as const

/** The tracking page for a courier by name, or null for one not listed. */
export function courierSite(name: string): string | null {
  const known = COURIERS.find(
    (courier) => courier.name.toLowerCase() === name.trim().toLowerCase()
  )
  return known?.site ?? null
}

/** The page for this one parcel, when the courier has one. */
export function parcelLink(
  name: string,
  trackingNumber: string
): string | null {
  const known = COURIERS.find(
    (courier) => courier.name.toLowerCase() === name.trim().toLowerCase()
  )
  return known && "parcel" in known && trackingNumber.trim()
    ? known.parcel(trackingNumber)
    : null
}
