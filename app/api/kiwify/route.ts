import { NextRequest, NextResponse } from 'next/server'
import { getStats, seedFromCSV } from '@/lib/kiwify-store'
import { loadCSV } from '@/lib/kiwify-csv'

export async function GET(req: NextRequest) {
  seedFromCSV(loadCSV())
  const { searchParams } = req.nextUrl
  const dateStart = searchParams.get('date_start') ?? undefined
  const dateEnd   = searchParams.get('date_end')   ?? undefined
  return NextResponse.json(getStats(dateStart, dateEnd))
}
