export const formatCurrency = (
  amount: number,
  locale: string = 'es-ES',
  currency: string = 'EUR',
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}
