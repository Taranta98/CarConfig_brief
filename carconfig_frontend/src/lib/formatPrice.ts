/** Formato italiano: 1.000 (migliaia) e 1.234,56 (decimali con virgola). */
export function formatPrice(amount: number): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) {
    return "0"
  }

  const negative = value < 0
  const cents = Math.round(Math.abs(value) * 100)
  const integerPart = Math.floor(cents / 100)
  const fractionalPart = cents % 100

  const groupedInteger = String(integerPart).replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  let formatted = groupedInteger
  if (fractionalPart !== 0) {
    formatted += `,${String(fractionalPart).padStart(2, "0")}`
  }

  return negative ? `-${formatted}` : formatted
}

export function formatCurrency(amount: number): string {
  return `${formatPrice(amount)} €`
}
