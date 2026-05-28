import { NextResponse } from 'next/server'
import { getStats, seedFromCSV } from '@/lib/kiwify-store'
import { loadCSV } from '@/lib/kiwify-csv'

export async function GET() {
  seedFromCSV(loadCSV())
  return NextResponse.json(getStats())
}
