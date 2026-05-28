import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    total_sales: 0,
    gross_revenue: 0,
    avg_ticket: 0,
    last_sale_at: null,
    by_source: {
      paid_traffic: 0,
      instagram: 0,
      manychat: 0,
      whatsapp: 0,
      direct: 0,
    },
  })
}
