export function formatPrice(price, currency = 'RUB') {
  if (price == null) return ''

  const num = Number(price)
  if (isNaN(num)) return ''

  switch (currency) {
    case 'USD':
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
    case 'KZT':
      return `${num.toLocaleString('ru-RU')} ₸`
    default:
      return `${num.toLocaleString('ru-RU')} ₽`
  }
}

export function formatDiscount(oldPrice, newPrice) {
  if (!oldPrice || oldPrice <= newPrice) return null
  return Math.round((1 - newPrice / oldPrice) * 100)
}
