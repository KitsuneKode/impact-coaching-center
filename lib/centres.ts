import type { Centre } from "./brand"

/** Great-circle distance in kilometres (haversine). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

/**
 * Centres ordered nearest first from a point. Centres without a known
 * location keep their place after the located ones, with no distance.
 */
export function byDistance(
  list: readonly Centre[],
  from: { lat: number; lng: number }
) {
  const located = list
    .filter((c) => c.at)
    .map((c) => ({ centre: c, km: distanceKm(from, c.at!) }))
    .sort((x, y) => x.km - y.km)
  const unknown = list
    .filter((c) => !c.at)
    .map((c) => ({ centre: c, km: null as number | null }))
  return [...located, ...unknown]
}

/** Google Maps directions from wherever the reader is to a centre. */
export function directionsUrl(to: { lat: number; lng: number }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}`
}
