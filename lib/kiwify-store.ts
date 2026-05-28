export interface KiwifySale {
  id: string
  amount_cents: number
  created_at: string
  utm_source: string | null
}

const sales: KiwifySale[] = []
let seeded = false

export function addSale(sale: KiwifySale): void {
  if (sales.some(s => s.id === sale.id)) return
  sales.push(sale)
}

export function seedFromCSV(csvSales: KiwifySale[]): void {
  if (seeded) return
  seeded = true
  for (const s of csvSales) addSale(s)
}

function classifySource(utm_source: string | null): keyof ReturnType<typeof getStats>['by_source'] {
  const src = utm_source?.toLowerCase()?.trim() ?? ''
  if (src === 'facebook')                        return 'paid_traffic'
  if (src === 'instagram' || src === 'ig')       return 'instagram'
  if (src === 'manychat')                        return 'manychat'
  if (src === 'whatsapp')                        return 'whatsapp'
  return 'direct'
}

export function getStats() {
  const total_sales   = sales.length
  const gross_revenue = Math.round(sales.reduce((s, r) => s + r.amount_cents, 0)) / 100
  const avg_ticket    = total_sales > 0 ? Math.round((gross_revenue / total_sales) * 100) / 100 : 0

  // Venda mais recente por data real (CSV vem do mais novo para o mais antigo)
  let last_sale_at: string | null = null
  for (const s of sales) {
    if (!last_sale_at || new Date(s.created_at) > new Date(last_sale_at)) {
      last_sale_at = s.created_at
    }
  }

  const by_source = { paid_traffic: 0, instagram: 0, manychat: 0, whatsapp: 0, direct: 0 }
  for (const s of sales) by_source[classifySource(s.utm_source)] += 1

  return { total_sales, gross_revenue, avg_ticket, last_sale_at, by_source }
}
