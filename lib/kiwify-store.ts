export interface KiwifySale {
  id: string
  amount_cents: number
  created_at: string
  utm_source: string | null
}

// Persiste durante o ciclo de vida do servidor
const sales: KiwifySale[] = []

export function addSale(sale: KiwifySale): void {
  if (sales.some(s => s.id === sale.id)) return  // dedup por id
  sales.push(sale)
}

function classifySource(utm_source: string | null): keyof ReturnType<typeof getStats>['by_source'] {
  switch (utm_source?.toLowerCase()) {
    case 'facebook':  return 'paid_traffic'
    case 'instagram': return 'instagram'
    case 'manychat':  return 'manychat'
    case 'whatsapp':  return 'whatsapp'
    default:          return 'direct'
  }
}

export function getStats() {
  const total_sales   = sales.length
  const gross_cents   = sales.reduce((sum, s) => sum + s.amount_cents, 0)
  const gross_revenue = gross_cents / 100
  const avg_ticket    = total_sales > 0 ? gross_revenue / total_sales : 0
  const last_sale_at  = sales.length > 0
    ? sales[sales.length - 1].created_at
    : null

  const by_source = { paid_traffic: 0, instagram: 0, manychat: 0, whatsapp: 0, direct: 0 }
  for (const s of sales) {
    by_source[classifySource(s.utm_source)] += 1
  }

  return { total_sales, gross_revenue, avg_ticket, last_sale_at, by_source }
}
