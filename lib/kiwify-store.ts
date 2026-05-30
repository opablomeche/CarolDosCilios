import fs from 'fs'
import path from 'path'

export interface KiwifySale {
  id: string
  amount_cents: number
  created_at: string
  utm_source:  string | null
  utm_content: string | null
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
  try {
    const webhookPath = path.join(process.cwd(), 'data', 'kiwify-webhook.json')
    const webhookSales: KiwifySale[] = JSON.parse(fs.readFileSync(webhookPath, 'utf-8'))
    for (const s of webhookSales) addSale(s)
  } catch {}
}

function classifySource(utm_source: string | null): keyof ReturnType<typeof getStats>['by_source'] {
  const src = utm_source?.toLowerCase()?.trim() ?? ''
  if (src === 'facebook')                  return 'paid_traffic'
  if (src === 'instagram' || src === 'ig') return 'instagram'
  if (src === 'manychat')                  return 'manychat'
  if (src === 'whatsapp')                  return 'whatsapp'
  return 'direct'
}

export function getStats(dateStart?: string, dateEnd?: string) {
  let filtered = sales as KiwifySale[]

  if (dateStart && dateEnd) {
    const start = new Date(dateStart)
    const end   = new Date(dateEnd)
    end.setHours(23, 59, 59, 999)
    filtered = filtered.filter(s => {
      const d = new Date(s.created_at)
      return d >= start && d <= end
    })
  }

  const total_sales   = filtered.length
  const gross_revenue = Math.round(filtered.reduce((s, r) => s + r.amount_cents, 0)) / 100
  const avg_ticket    = total_sales > 0 ? Math.round((gross_revenue / total_sales) * 100) / 100 : 0

  let last_sale_at: string | null = null
  for (const s of filtered) {
    if (!last_sale_at || new Date(s.created_at) > new Date(last_sale_at)) {
      last_sale_at = s.created_at
    }
  }

  const by_source = { paid_traffic: 0, instagram: 0, manychat: 0, whatsapp: 0, direct: 0 }
  for (const s of filtered) by_source[classifySource(s.utm_source)] += 1

  const by_creative: Record<string, { sales: number; revenue: number }> = {}
  for (const s of filtered) {
    const key = s.utm_content?.trim()
    if (!key) continue
    if (!by_creative[key]) by_creative[key] = { sales: 0, revenue: 0 }
    by_creative[key].sales   += 1
    by_creative[key].revenue += s.amount_cents / 100
  }

  return { total_sales, gross_revenue, avg_ticket, last_sale_at, by_source, by_creative }
}
