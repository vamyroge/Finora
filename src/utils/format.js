export const CURRENCIES = {
  VND: { symbol: '₫', locale: 'vi-VN', code: 'VND' },
  USD: { symbol: '$', locale: 'en-US', code: 'USD' },
  EUR: { symbol: '€', locale: 'de-DE', code: 'EUR' },
}

export function formatCurrency(value, currency = 'VND') {
  const c = CURRENCIES[currency] || CURRENCIES.VND
  try {
    return new Intl.NumberFormat(c.locale, {
      style: 'currency',
      currency: c.code,
      maximumFractionDigits: c.code === 'VND' ? 0 : 2,
    }).format(Number(value) || 0)
  } catch {
    return `${c.symbol}${Number(value || 0).toLocaleString()}`
  }
}

export function formatCompact(value, currency = 'VND') {
  const c = CURRENCIES[currency] || CURRENCIES.VND
  const n = Number(value) || 0
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${c.symbol}${(n / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${c.symbol}${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${c.symbol}${(n / 1_000).toFixed(1)}K`
  return `${c.symbol}${n.toFixed(0)}`
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatPercent(value) {
  const n = Number(value) || 0
  return `${n.toFixed(1)}%`
}

export function monthKey(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key) {
  if (!key) return ''
  const [y, m] = key.split('-')
  return `T${Number(m)}/${y}`
}

export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}