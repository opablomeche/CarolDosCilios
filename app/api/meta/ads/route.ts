import { NextRequest, NextResponse } from 'next/server'
import { fetchAdsByAdset } from '@/lib/meta'
import { format, subDays } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const adsetId = searchParams.get('adset_id')
    if (!adsetId) return NextResponse.json({ error: 'adset_id obrigatório' }, { status: 400 })

    const today = new Date()
    const dateStart = searchParams.get('date_start') ?? format(subDays(today, 6), 'yyyy-MM-dd')
    const dateEnd   = searchParams.get('date_end')   ?? format(today, 'yyyy-MM-dd')

    const ads = await fetchAdsByAdset(adsetId, dateStart, dateEnd)
    return NextResponse.json({ ads, updatedAt: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
