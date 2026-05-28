import { NextRequest, NextResponse } from 'next/server'
import { fetchAdSets } from '@/lib/meta'
import { format, subDays } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const campaignId = searchParams.get('campaign_id')
    if (!campaignId) return NextResponse.json({ error: 'campaign_id obrigatório' }, { status: 400 })

    const today = new Date()
    const dateStart = searchParams.get('date_start') ?? format(subDays(today, 6), 'yyyy-MM-dd')
    const dateEnd   = searchParams.get('date_end')   ?? format(today, 'yyyy-MM-dd')

    const adsets = await fetchAdSets(campaignId, dateStart, dateEnd)
    return NextResponse.json({ adsets, updatedAt: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
