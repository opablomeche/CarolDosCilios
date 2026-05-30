'use client'

import { useState, useCallback } from 'react'
import { MetaCampaign, MetaAdSet, MetaAd, DateRange } from '@/types'
import { formatCurrency, formatNumber, formatPercent, formatCompact } from '@/lib/formatters'

interface Props {
  campaigns:  MetaCampaign[]
  loading:    boolean
  dateRange:  DateRange
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

type AnyStatus = 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'

function StatusBadge({ status }: { status: AnyStatus }) {
  const isActive = status === 'ACTIVE'
  return (
    <span
      className="font-body"
      style={{
        display: 'inline-block',
        padding: '2px 7px',
        fontSize: '11px',
        fontWeight: 400,
        borderRadius: '3px',
        background: isActive ? 'var(--active-bg)' : 'var(--paused-bg)',
        color: isActive ? 'var(--active-text)' : 'var(--paused-text)',
        border: `1px solid ${isActive ? 'var(--active-border)' : 'var(--paused-border)'}`,
      }}
    >
      {isActive ? 'Ativa' : 'Pausada'}
    </span>
  )
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="td">
          <div className="skeleton" style={{ height: '11px', width: i === 0 ? '70%' : '50%' }} />
        </td>
      ))}
    </tr>
  )
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

interface Crumb {
  label: string
  color: string
  onClick: () => void
}

function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div className="flex items-center gap-2 mb-5 font-body" style={{ fontSize: '13px' }}>
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span style={{ color: 'var(--muted)' }}>›</span>}
          <button
            onClick={c.onClick}
            style={{
              color: i === crumbs.length - 1 ? 'var(--white)' : c.color,
              fontWeight: i === crumbs.length - 1 ? 400 : 300,
              cursor: i === crumbs.length - 1 ? 'default' : 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: '"DM Sans"',
              fontSize: '13px',
            }}
          >
            {c.label}
          </button>
        </span>
      ))}
    </div>
  )
}

// ─── Level 1 — Campaigns ─────────────────────────────────────────────────────

function CampaignTable({
  campaigns, loading, onSelect,
}: { campaigns: MetaCampaign[]; loading: boolean; onSelect: (c: MetaCampaign) => void }) {
  const sorted = [...campaigns].sort((a, b) =>
    (a.insights?.cost_per_purchase ?? Infinity) - (b.insights?.cost_per_purchase ?? Infinity)
  )

  return (
    <div className="rounded-card border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: 'var(--surface-2)' }}>
            <tr>
              {['Campanha','Status','Investimento','Compras','CPA','CTR','Impressões',''].map((h, i) => (
                <th key={i} className={`th ${i > 1 && i < 7 ? 'th-r' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: 'var(--surface-1)' }}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
              : sorted.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelect(c)}
                    style={{
                      background: i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)',
                      cursor: 'pointer',
                      transition: '150ms ease',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-3)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)'}
                  >
                    <td className="td" style={{ maxWidth: '260px' }}>
                      <span className="block truncate" style={{ fontSize: '12px' }} title={c.name}>{c.name}</span>
                    </td>
                    <td className="td"><StatusBadge status={c.status} /></td>
                    <td className="td td-r" style={{ color: 'var(--gold)' }}>
                      {c.insights ? formatCurrency(c.insights.spend) : '—'}
                    </td>
                    <td className="td td-r">{c.insights ? formatNumber(c.insights.purchases) : '—'}</td>
                    <td className="td td-r" style={{ color: c.insights?.cost_per_purchase ? 'var(--gold)' : 'var(--muted)' }}>
                      {c.insights?.cost_per_purchase ? formatCurrency(c.insights.cost_per_purchase) : '—'}
                    </td>
                    <td className="td td-r" style={{ color: 'var(--muted-light)' }}>
                      {c.insights ? formatPercent(c.insights.ctr) : '—'}
                    </td>
                    <td className="td td-r" style={{ color: 'var(--muted-light)' }}>
                      {c.insights ? formatCompact(c.insights.impressions) : '—'}
                    </td>
                    <td className="td" style={{ color: 'var(--muted)', textAlign: 'right', paddingRight: '16px' }}>›</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Level 2 — AdSets ────────────────────────────────────────────────────────

function AdSetTable({
  adsets, loading, onSelect,
}: { adsets: MetaAdSet[]; loading: boolean; onSelect: (a: MetaAdSet) => void }) {
  const sorted = [...adsets].sort((a, b) =>
    (a.insights?.cost_per_purchase ?? Infinity) - (b.insights?.cost_per_purchase ?? Infinity)
  )

  return (
    <div className="rounded-card border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
      <div
        className="px-4 py-2 font-body"
        style={{ background: 'var(--accent-blue-bg)', borderBottom: `1px solid var(--accent-blue)`, fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        Conjuntos de Anúncios
      </div>

      {!loading && sorted.length === 0 && (
        <div className="flex items-center justify-center py-10" style={{ background: 'var(--surface-1)' }}>
          <p className="font-body" style={{ fontSize: '13px', color: 'var(--muted)' }}>Nenhum conjunto encontrado para este período</p>
        </div>
      )}

      {(loading || sorted.length > 0) && (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: 'var(--surface-2)' }}>
            <tr>
              {['Conjunto','Status','Investimento','Compras','CPA','CTR','Impressões',''].map((h, i) => (
                <th key={i} className={`th ${i > 1 && i < 7 ? 'th-r' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: 'var(--surface-1)' }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
              : sorted.map((a, i) => (
                  <tr
                    key={a.id}
                    onClick={() => onSelect(a)}
                    style={{
                      background: i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)',
                      cursor: 'pointer',
                      transition: '150ms ease',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-3)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)'}
                  >
                    <td className="td" style={{ maxWidth: '260px' }}>
                      <span className="block truncate" style={{ fontSize: '12px', color: 'var(--accent-blue)' }} title={a.name}>{a.name}</span>
                    </td>
                    <td className="td"><StatusBadge status={a.status} /></td>
                    <td className="td td-r" style={{ color: 'var(--gold)' }}>
                      {a.insights ? formatCurrency(a.insights.spend) : '—'}
                    </td>
                    <td className="td td-r">{a.insights ? formatNumber(a.insights.purchases) : '—'}</td>
                    <td className="td td-r" style={{ color: a.insights?.cost_per_purchase ? 'var(--gold)' : 'var(--muted)' }}>
                      {a.insights?.cost_per_purchase ? formatCurrency(a.insights.cost_per_purchase) : '—'}
                    </td>
                    <td className="td td-r" style={{ color: 'var(--muted-light)' }}>
                      {a.insights ? formatPercent(a.insights.ctr) : '—'}
                    </td>
                    <td className="td td-r" style={{ color: 'var(--muted-light)' }}>
                      {a.insights ? formatCompact(a.insights.impressions) : '—'}
                    </td>
                    <td className="td" style={{ color: 'var(--muted)', textAlign: 'right', paddingRight: '16px' }}>›</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}

// ─── Level 3 — Ads table (active only) ───────────────────────────────────────

function AdsTable({ ads, loading }: { ads: MetaAd[]; loading: boolean }) {
  const active = [...ads]
    .filter(a => a.status === 'ACTIVE')
    .sort((a, b) => (a.insights?.cost_per_purchase ?? Infinity) - (b.insights?.cost_per_purchase ?? Infinity))

  return (
    <div className="rounded-card border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
      <div
        className="px-4 py-2 font-body flex items-center gap-2"
        style={{ background: 'var(--accent-teal-bg)', borderBottom: '1px solid var(--accent-teal)', fontSize: '11px', color: 'var(--accent-teal)', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        <span>Criativos ativos</span>
        {!loading && <><span style={{ opacity: 0.6 }}>·</span><span>{active.length}</span></>}
      </div>

      {!loading && active.length === 0 && (
        <div className="flex items-center justify-center py-10" style={{ background: 'var(--surface-1)' }}>
          <p className="font-body" style={{ fontSize: '13px', color: 'var(--muted)' }}>Nenhum criativo ativo neste período</p>
        </div>
      )}

      {(loading || active.length > 0) && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'var(--surface-2)' }}>
              <tr>
                {['Criativo', 'Investimento', 'Compras', 'CPA', 'CTR'].map((h, i) => (
                  <th key={i} className={`th ${i > 0 ? 'th-r' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: 'var(--surface-1)' }}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                : active.map((ad, i) => (
                    <tr
                      key={ad.id}
                      style={{ background: i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)' }}
                    >
                      <td className="td" style={{ maxWidth: '300px' }}>
                        <div className="flex items-center gap-2">
                          {ad.thumbnail_url
                            ? <img src={ad.thumbnail_url} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} />
                            : <div style={{ width: '32px', height: '32px', borderRadius: '3px', background: 'var(--surface-3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'var(--border)', fontSize: '10px' }}>▷</span></div>
                          }
                          <span className="block truncate font-body" style={{ fontSize: '12px', color: 'var(--accent-teal)' }} title={ad.name}>{ad.name}</span>
                        </div>
                      </td>
                      <td className="td td-r" style={{ color: 'var(--gold)' }}>
                        {ad.insights ? formatCurrency(ad.insights.spend) : '—'}
                      </td>
                      <td className="td td-r">
                        {ad.insights ? formatNumber(ad.insights.purchases) : '—'}
                      </td>
                      <td className="td td-r" style={{ color: ad.insights?.cost_per_purchase ? 'var(--gold)' : 'var(--muted)' }}>
                        {ad.insights?.cost_per_purchase ? formatCurrency(ad.insights.cost_per_purchase) : '—'}
                      </td>
                      <td className="td td-r" style={{ color: 'var(--muted-light)' }}>
                        {ad.insights ? formatPercent(ad.insights.ctr) : '—'}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CampaignDrillDown({ campaigns, loading, dateRange }: Props) {
  const [level,      setLevel]      = useState<1 | 2 | 3>(1)
  const [selCamp,    setSelCamp]    = useState<MetaCampaign | null>(null)
  const [selAdset,   setSelAdset]   = useState<MetaAdSet | null>(null)
  const [adsets,     setAdsets]     = useState<MetaAdSet[]>([])
  const [drillAds,   setDrillAds]   = useState<MetaAd[]>([])
  const [loadingL2,  setLoadingL2]  = useState(false)
  const [loadingL3,  setLoadingL3]  = useState(false)

  const handleCampaignSelect = useCallback(async (c: MetaCampaign) => {
    setSelCamp(c)
    setAdsets([])
    setLevel(2)
    setLoadingL2(true)
    try {
      const res  = await fetch(
        `/api/meta/adsets?campaign_id=${c.id}&date_start=${dateRange.start}&date_end=${dateRange.end}`
      )
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setAdsets(json.adsets ?? [])
    } catch (err) {
      console.error('[Adsets]', err)
      setAdsets([])
    } finally {
      setLoadingL2(false)
    }
  }, [dateRange])

  const handleAdsetSelect = useCallback(async (a: MetaAdSet) => {
    setSelAdset(a)
    setLevel(3)
    setLoadingL3(true)
    try {
      const res = await fetch(
        `/api/meta/ads?adset_id=${a.id}&date_start=${dateRange.start}&date_end=${dateRange.end}`
      )
      const data = await res.json()
      setDrillAds(data.ads ?? [])
    } catch { setDrillAds([]) }
    finally { setLoadingL3(false) }
  }, [dateRange])

  const goToL1 = () => { setLevel(1); setSelCamp(null); setSelAdset(null) }
  const goToL2 = () => { setLevel(2); setSelAdset(null) }

  // Breadcrumbs
  const crumbs: Crumb[] = [
    { label: 'Campanhas', color: 'var(--muted-light)', onClick: goToL1 },
    ...(selCamp  ? [{ label: selCamp.name.length > 36 ? selCamp.name.slice(0,36)+'…' : selCamp.name, color: 'var(--accent-blue)', onClick: goToL2 }] : []),
    ...(selAdset ? [{ label: selAdset.name.length > 36 ? selAdset.name.slice(0,36)+'…' : selAdset.name, color: 'var(--accent-teal)', onClick: () => {} }] : []),
  ]

  return (
    <div>
      {level > 1 && <Breadcrumb crumbs={crumbs} />}

      {level === 1 && (
        <CampaignTable campaigns={campaigns} loading={loading} onSelect={handleCampaignSelect} />
      )}
      {level === 2 && (
        <AdSetTable adsets={adsets} loading={loadingL2} onSelect={handleAdsetSelect} />
      )}
      {level === 3 && (
        <AdsTable ads={drillAds} loading={loadingL3} />
      )}
    </div>
  )
}
