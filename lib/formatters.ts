export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatPercent(value: number, decimals = 2): string {
  return `${formatNumber(value, decimals)}%`
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${formatNumber(value / 1_000_000, 1)}M`
  if (value >= 1_000) return `${formatNumber(value / 1_000, 1)}K`
  return formatNumber(value)
}

export function safeDiv(a: number, b: number): number {
  if (!b || b === 0) return 0
  return a / b
}

export function calcRate(numerator: number, denominator: number): number {
  return safeDiv(numerator, denominator) * 100
}
