'use client'

import { MetaAd } from '@/types'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/formatters'

interface Props { ads: MetaAd[]; loading: boolean }

interface ConsolidatedAd {
  id: string
  name: string
  isActive: boolean
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
    const key = ad.name
    const existing = map.get(key)
    const isActive = ad.status === 'ACTIVE'
    const ins = ad.insights

    if (!existing) {
      map.set(key, {
        id:                      ad.id,
        name:                    ad.name,
        isActive,
        thumbnail_url:           ad.thumbnail_url,
        instagram_permalink_url: ad.instagram_permalink_url,
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
      if (isActive) existing.isActive = true
      if (isActive && !existing.thumbnail_url)           existing.thumbnail_url           = ad.thumbnail_url
      if (isActive && !existing.instagram_permalink_url) existing.instagram_permalink_url = ad.instagram_permalink_url
    }
  }

  for (const ad of map.values()) {
    ad.ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
    ad.cpa = ad.purchases  > 0 ? ad.spend / ad.purchases : null
  }

  return Array.from(map.values()).sort((a, b) => {
    // Ativos com CPA primeiro (menor CPA = melhor)
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    if (a.cpa === null && b.cpa === null) return 0
    if (a.cpa === null) return 1   // sem compras vai para o fim do grupo
    if (b.cpa === null) return -1
    return a.cpa - b.cpa
  })
}

const HEADERS = ['Criativo', 'Instâncias', 'Status', 'Investimento', 'Compras', 'CPA', 'CTR']

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
      <td className="td"><div className="skeleton" style={{ height: '20px', width: '56px', borderRadius: '3px' }} /></td>
      {[0,1,2,3].map(i => (
        <td key={i} className="td">
          <div className="skeleton" style={{ height: '11px', width: '52px', marginLeft: 'auto' }} />
        </td>
      ))}
    </tr>
  )
}

export default function CreativesGrid({ ads, loading }: Props) {
  const COLS = HEADERS.length

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
        <p className="font-body" style={{ fontSize: '13px', color: 'var(--muted)' }}>Nenhum criativo encontrado</p>
      </div>
    )
  }

  const activeCount = consolidated.filter(a =>  a.isActive).length
  const pausedCount = consolidated.filter(a => !a.isActive).length

  return (
    <div>
      {/* Counter */}
      <div className="flex items-center gap-3 mb-5 font-body" style={{ fontSize: '12px' }}>
        <span style={{ padding: '3px 8px', borderRadius: '3px', background: 'var(--active-bg)', color: 'var(--active-text)', border: '1px solid var(--active-border)' }}>
          {activeCount} ativos
        </span>
        <span style={{ padding: '3px 8px', borderRadius: '3px', background: 'var(--paused-bg)', color: 'var(--paused-text)', border: '1px solid var(--paused-border)', opacity: 0.7 }}>
          {pausedCount} pausados
        </span>
        <span style={{ color: 'var(--muted)', fontWeight: 300 }}>
          · {consolidated.length} criativos únicos consolidados
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

                return (
                  <tr
                    key={ad.id + ad.name}
                    style={{
                      background: i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)',
                      opacity: ad.isActive ? 1 : 0.6,
                      transition: '150ms ease',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-3)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)'}
                  >
                    {/* Criativo */}
                    <td className="td" style={{ maxWidth: '300px' }}>
                      <div
                        className="flex items-center gap-3"
                        style={{ cursor: 'pointer' }}
                        onClick={openAd}
                        title="Abrir no Instagram"
                      >
                        <div
                          className="shrink-0 overflow-hidden"
                          style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--surface-3)' }}
                        >
                          {ad.thumbnail_url
                            ? <img src={ad.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span style={{ color: 'var(--border)', fontSize: '11px' }}>▷</span>
                              </div>
                            )
                          }
                        </div>
                        <span
                          className="block truncate font-body"
                          style={{ fontSize: '12px', color: 'var(--muted-light)' }}
                          title={ad.name}
                        >
                          {ad.name}
                        </span>
                      </div>
                    </td>

                    {/* Instâncias */}
                    <td className="td">
                      <span
                        className="font-body"
                        style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          fontSize: '11px',
                          borderRadius: '3px',
                          background: 'rgba(255,255,255,0.05)',
                          color: ad.instances > 1 ? 'var(--muted-light)' : 'var(--muted)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        ×{ad.instances}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="td">
                      <span
                        className="font-body"
                        style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          fontSize: '11px',
                          borderRadius: '3px',
                          background: ad.isActive ? 'var(--active-bg)' : 'var(--paused-bg)',
                          color:      ad.isActive ? 'var(--active-text)' : 'var(--paused-text)',
                          border: `1px solid ${ad.isActive ? 'var(--active-border)' : 'var(--paused-border)'}`,
                        }}
                      >
                        {ad.isActive ? 'Ativo' : 'Pausado'}
                      </span>
                    </td>

                    {/* Investimento */}
                    <td className="td td-r" style={{ color: 'var(--gold)' }}>
                      {formatCurrency(ad.spend)}
                    </td>

                    {/* Compras */}
                    <td className="td td-r" style={{ color: 'var(--white)' }}>
                      {formatNumber(ad.purchases)}
                    </td>

                    {/* CPA */}
                    <td className="td td-r" style={{ color: ad.cpa != null ? 'var(--gold)' : 'var(--muted)' }}>
                      {ad.cpa != null ? formatCurrency(ad.cpa) : '—'}
                    </td>

                    {/* CTR */}
                    <td className="td td-r" style={{ color: 'var(--muted-light)' }}>
                      {formatPercent(ad.ctr)}
                    </td>
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
