/**
 * Where a parcel can go and what it costs, from its PIN code alone, so the
 * checkout page and the server price it the same way. ICT ships anywhere
 * in India through Delhivery (decided 28 Oct 2026); the owner sets one rate
 * per zone in Settings, and a zone left blank charges the Assam rate.
 */

export type ShippingZone = "assam" | "northeast" | "india"

/** Paise per order. `assam` is the original single rate. */
export type ShippingRates = {
  assam: number
  northeast?: number
  india?: number
}

/** A real Indian PIN code: six digits, the first 1 to 8 (9 is the Army Post Office). */
export function isIndianPin(pin: string) {
  return /^[1-8]\d{5}$/.test(pin.trim())
}

/**
 * The zone for a PIN, or null when it is not an Indian PIN. Assam is 78;
 * the rest of the North East is 790-799 (Arunachal, Meghalaya, Manipur,
 * Mizoram, Nagaland, Tripura) and 737 (Sikkim).
 */
export function zoneOf(pin: string): ShippingZone | null {
  const p = pin.trim()
  if (!isIndianPin(p)) return null
  if (p.startsWith("78")) return "assam"
  if (p.startsWith("79") || p.startsWith("737")) return "northeast"
  return "india"
}

/** What delivery to this PIN costs, or null when ICT cannot send there. */
export function shippingFor(pin: string, rates: ShippingRates): number | null {
  const zone = zoneOf(pin)
  if (!zone) return null
  return rates[zone] ?? rates.assam
}

/** The lowest rate any zone charges: "Delivery from ₹60" before a PIN is known. */
export function lowestShipping(rates: ShippingRates) {
  return Math.min(
    rates.assam,
    rates.northeast ?? rates.assam,
    rates.india ?? rates.assam
  )
}

export const ZONE_LABELS: Record<ShippingZone, string> = {
  assam: "Assam",
  northeast: "North East",
  india: "Rest of India",
}
