/**
 * Money, in integer paise, formatted for a reader in India.
 *
 * Paise rather than rupees everywhere it is stored or added up: 0.1 + 0.2 is
 * not 0.3 in binary floating point, and a rounding error in a total is a
 * rounding error in somebody's bank account. Rupees appear at exactly one
 * moment - when a number is shown to a person - and that is here.
 *
 * `en-IN` groups by lakh and crore (1,00,000 rather than 100,000), which is
 * what a reader in Assam expects and what a Western grouping quietly gets
 * wrong.
 *
 * The fraction is dropped when a price is whole rupees, because ICT's books
 * are priced in whole rupees and "₹420" reads faster than "₹420.00" in a
 * column of thirty.
 */
const WHOLE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const WITH_PAISE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPaise(paise: number): string {
  const rupees = paise / 100
  return paise % 100 === 0 ? WHOLE.format(rupees) : WITH_PAISE.format(rupees)
}
