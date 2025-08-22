export function formatMoney(amount: number, currency = 'MAD', locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    const val = typeof amount === 'number' ? amount.toFixed(2) : String(amount)
    return `${val} ${currency}`
  }
}

export function formatDate(iso: string, locale = 'en-US') {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string, locale = 'en-US') {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatPercent(value: number, locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100)
  } catch {
    return `${value.toFixed(1)}%`
  }
}

// Alias for backward compatibility
export const formatCurrency = formatMoney

