'use client'

import { MetaAd, KiwifyData } from '@/types'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/formatters'

interface Props {
  ads: MetaAd[]
  loading: boolean
  kiwifyData?: KiwifyData | null
}

interface ConsolidatedAd {
  id: string
  name: string
  thumbnail_url?: string
  instagram_permalink_url?: string
  spend: number
  impressions: number
  clicks: number
  purchases: number
  ctr: number
  cpa: number | null
  instances: number
}

function consolidate(ads: MetaAd[]): ConsolidatedAd[] {
  const map = new Map<string, ConsolidatedAd>()

  for (const ad of ads) {
    const ins = ad.insights
    const existing = map.get(ad.name)

    if (!existing) {
      map.set(ad.name, {
        id:                      ad.id,
        name:                    ad.name,
        thumbnail_url:           ad.status === 'ACTIVE' ? ad.thumbnail_url : undefined,
        instagram_permalink_url: ad.status === 'ACTIVE' ? ad.instagram_permalink_url : undefined,
        spend:       ins?.spend       ?? 0,
        impressions: ins?.impressions  ?? 0,
        clicks:      ins?.clicks      ?? 0,
        purchases:   ins?.purchases   ?? 0,
        ctr:         0,
        cpa:         null,
        instances:   1,
      })
    } else {
      existing.spend       += ins?.spend       ?? 0
      existing.impressions += ins?.impressions  ?? 0
      existing.clicks      += ins?.clicks      ?? 0
      existing.purchases   += ins?.purchases   ?? 0
      existing.instances   += 1
      // Prefer thumbnail from active instance
      if (ad.status === 'ACTIVE') {
        if (!existing.thumbnail_url)           existing.thumbnail_url           = ad.thumbnail_url
        if (!existing.instagram_permalink_url) existing.instagram_permalink_url = ad.instagram_permalink_url
      }
    }
  }

  for (const ad of map.values()) {
    ad.ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
    ad.cpa = ad.purchases  > 0 ? ad.spend / ad.purchases : null
  }

  // Fix 1: só retorna criativos com pelo menos uma instância ativa
  const activeNames = new Set(ads.filter(a => a.status === 'ACTIVE').map(a => a.name))

  return Array.from(map.values())
    .filter(ad => activeNames.has(ad.name))
    .sort((a, b) => {
      if (a.cpa === null && b.cpa === null) return 0
      if (a.cpa === null) return 1
      if (b.cpa === null) return -1
      return a.cpa - b.cpa
    })
}

const HEADERS = [
  'Criativo', 'Instâncias', 'Status',
  'Investimento', 'Compras Meta', 'CPA Meta',
  'Compras Kiwify', 'CPA Real', 'CTR',
]

function SkeletonRow() {
  return (
    <tr>
      <td className="td">
        <div className="flex items-center gap-3">
          <div className="skeleton shrink-0" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '11px', width: '130px' }} />
        </div>
      </td>
      <td className="td"><div className="skeleton" style={{ height: '20px', width: '32px', borderRadius: '3px' }} /></td>
      <td className="td"><div className="skeleton" style={{ height: '20px', width: '48px', borderRadius: '3px' }} /></td>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <td key={i} className="td">
          <div className="skeleton" style={{ height: '11px', width: '52px', marginLeft: 'auto' }} />
        </td>
      ))}
    </tr>
  )
}

export default function CreativesGrid({ ads, loading, kiwifyData }: Props) {
  if (loading) {
    return (
      <div className="rounded-card border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'var(--surface-2)' }}>
              <tr>
                {HEADERS.map((h, i) => (
                  <th key={i} className={`th ${i > 2 ? 'th-r' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: 'var(--surface-1)' }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const consolidated = consolidate(ads)

  if (consolidated.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-16 rounded-card border"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
      >
        <p className="font-body" style={{ fontSize: '13px', color: 'var(--muted)' }}>Nenhum criativo ativo encontrado</p>
      </div>
    )
  }

  return (
    <div>
      {/* Counter — Fix 1: só ativos */}
      <div className="flex items-center gap-3 mb-5 font-body" style={{ fontSize: '12px' }}>
        <span style={{ padding: '3px 8px', borderRadius: '3px', background: 'var(--active-bg)', color: 'var(--active-text)', border: '1px solid var(--active-border)' }}>
          {consolidated.length} ativos
        </span>
        <span style={{ color: 'var(--muted)', fontWeight: 300 }}>
          · {consolidated.length} criativos únicos
        </span>
      </div>

      <div className="rounded-card border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'var(--surface-2)' }}>
              <tr>
                {HEADERS.map((h, i) => (
                  <th key={i} className={`th ${i > 2 ? 'th-r' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: 'var(--surface-1)' }}>
              {consolidated.map((ad, i) => {
                function openAd() {
                  const url = ad.instagram_permalink_url
                    ?? `https://www.instagram.com/ads/archive/preview/${ad.id}/`
                  window.open(url, '_blank', 'noopener')
                }

                // Fix 3: dados Kiwify por criativo
                const kCreative  = kiwifyData?.by_creative?.[ad.name]
                const kSales     = kCreative?.sales ?? 0
                const kCpa       = kSales > 0 ? ad.spend / kSales : null
                const kCpaColor  = kCpa == null
                  ? 'var(--muted)'
                  : (ad.cpa != null && kCpa < ad.cpa)
                  ? 'var(--gold)'
                  : 'var(--muted-light)'

                return (
                  <tr
                    key={ad.id + ad.name}
                    style={{
                      background: i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)',
                      transition: '150ms ease',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-3)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)'}
                  >
                    {/* Criativo */}
                    <td className="td" style={{ maxWidth: '260px' }}>
                      <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={openAd} title="Abrir no Instagram">
                        <div className="shrink-0 overflow-hidden" style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--surface-3)' }}>
                          {ad.thumbnail_url
                            ? <img src={ad.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><span style={{ color: 'var(--border)', fontSize: '11px' }}>▷</span></div>
                          }
                        </div>
                        <span className="block truncate font-body" style={{ fontSize: '12px', color: 'var(--muted-light)' }} title={ad.name}>
                          {ad.name}
                        </span>
                      </div>
                    </td>

                    {/* Instâncias */}
                    <td className="td">
                      <span className="font-body" style={{ display: 'inline-block', padding: '2px 7px', fontSize: '11px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', color: ad.instances > 1 ? 'var(--muted-light)' : 'var(--muted)', border: '1px solid var(--border)' }}>
                        ×{ad.instances}
                      </span>
                    </td>

                    {/* Status — todos ativos agora */}
                    <td className="td">
                      <span className="font-body" style={{ display: 'inline-block', padding: '2px 7px', fontSize: '11px', borderRadius: '3px', background: 'var(--active-bg)', color: 'var(--active-text)', border: '1px solid var(--active-border)' }}>
                        Ativo
                      </span>
                    </td>

                    {/* Investimento */}
                    <td className="td td-r" style={{ color: 'var(--gold)' }}>{formatCurrency(ad.spend)}</td>

                    {/* Compras Meta */}
                    <td className="td td-r" style={{ color: 'var(--white)' }}>{formatNumber(ad.purchases)}</td>

                    {/* CPA Meta */}
                    <td className="td td-r" style={{ color: ad.cpa != null ? 'var(--gold)' : 'var(--muted)' }}>
                      {ad.cpa != null ? formatCurrency(ad.cpa) : '—'}
                    </td>

                    {/* Compras Kiwify */}
                    <td className="td td-r" style={{ color: kSales > 0 ? 'var(--white)' : 'var(--muted)' }}>
                      {kSales > 0 ? formatNumber(kSales) : '—'}
                    </td>

                    {/* CPA Real */}
                    <td className="td td-r" style={{ color: kCpaColor }}>
                      {kCpa != null ? formatCurrency(kCpa) : '—'}
                    </td>

                    {/* CTR */}
                    <td className="td td-r" style={{ color: 'var(--muted-light)' }}>{formatPercent(ad.ctr)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
