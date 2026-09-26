/** Money, in integer paise, formatted for a reader in India. */
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
