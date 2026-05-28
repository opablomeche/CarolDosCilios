import fs   from 'fs'
import path from 'path'
import { KiwifySale } from './kiwify-store'

// "28/05/2026 19:28:15" → "2026-05-28T19:28:15-03:00"
function parseDate(raw: string): string {
  const s = raw.trim()
  if (!s) return new Date().toISOString()
  const [datePart, timePart = '00:00:00'] = s.split(' ')
  const [day, month, year] = datePart.split('/')
  return `${year}-${month}-${day}T${timePart}-03:00`
}

// Parser CSV que respeita campos entre aspas
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') { inQ = !inQ }
    else if (c === ',' && !inQ) { fields.push(cur); cur = '' }
    else cur += c
  }
  fields.push(cur)
  return fields
}

export function loadCSV(): KiwifySale[] {
  const csvPath = path.join(process.cwd(), 'data', 'kiwify.csv')
  if (!fs.existsSync(csvPath)) return []

  const lines = fs.readFileSync(csvPath, 'utf-8')
    .split('\n')
    .filter(l => l.trim())

  const header = parseCSVLine(lines[0])
  const col = (name: string) => header.indexOf(name)

  const idCol      = col('ID da venda')
  const statusCol  = col('Status')
  const amountCol  = col('Total com acréscimo')
  const utmSrcCol  = col('Tracking utm_source')
  const dateCol    = col('Data de Criação')

  const sales: KiwifySale[] = []

  for (let i = 1; i < lines.length; i++) {
    const f = parseCSVLine(lines[i])
    if (f[statusCol]?.trim() !== 'paid') continue

    const raw = f[amountCol]?.replace(',', '.') ?? '0'
    const brl = parseFloat(raw)
    if (!isFinite(brl) || brl <= 0) continue

    sales.push({
      id:           f[idCol]?.trim()    || `csv-${i}`,
      amount_cents: Math.round(brl * 100),
      created_at:   parseDate(f[dateCol] ?? ''),
      utm_source:   f[utmSrcCol]?.trim() || null,
    })
  }

  return sales
}
