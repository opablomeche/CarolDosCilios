import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { addSale, KiwifySale } from '@/lib/kiwify-store'

const webhookFile = path.join(process.cwd(), 'data', 'kiwify-webhook.json')

function appendWebhookSale(sale: KiwifySale) {
  let existing: KiwifySale[] = []
  try { existing = JSON.parse(fs.readFileSync(webhookFile, 'utf-8')) } catch {}
  if (!existing.find(s => s.id === sale.id)) {
    existing.push(sale)
    fs.writeFileSync(webhookFile, JSON.stringify(existing, null, 2))
  }
}

interface KiwifyPayload {
  event: string
  data: {
    id: string
    status: string
    amount: number
    created_at: string
    customer: { name: string; email: string }
    tracking?: {
      utm_source?: string
      utm_medium?: string
      utm_campaign?: string
      utm_content?: string
      utm_term?: string
    }
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.KIWIFY_WEBHOOK_SECRET
  const auth   = req.headers.get('authorization')

  if (!secret || auth !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: KiwifyPayload
  try {
    payload = await req.json() as KiwifyPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.event !== 'order.approved' || payload.data?.status !== 'paid') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const { id, amount, created_at, tracking } = payload.data
  const sale: KiwifySale = {
    id,
    amount_cents: amount,
    created_at,
    utm_source:  tracking?.utm_source  ?? null,
    utm_content: tracking?.utm_content ?? null,
  }
  addSale(sale)
  appendWebhookSale(sale)

  return NextResponse.json({ ok: true })
}
