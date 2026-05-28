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
    </div>
  )
}

// ─── Level 3 — Ads grid ───────────────────────────────────────────────────────

function AdCard({ ad }: { ad: MetaAd }) {
  const isPaused = ad.status !== 'ACTIVE'

  function openAd() {
    const url = ad.instagram_permalink_url
      ?? `https://www.instagram.com/ads/archive/preview/${ad.id}/`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div
      className="rounded-card border overflow-hidden group transition-shadow duration-150"
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border-subtle)',
        opacity: isPaused ? 0.55 : 1,
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative cursor-pointer"
        style={{ aspectRatio: '16/9', background: 'var(--surface-3)' }}
        onClick={openAd}
      >
        {/* Status badge */}
        <span
          className="absolute top-2 right-2 z-10 font-body"
          style={{
            padding: '2px 7px',
            fontSize: '10px',
            borderRadius: '3px',
            background: isPaused ? 'var(--paused-bg)' : 'var(--active-bg)',
            color: isPaused ? 'var(--paused-text)' : 'var(--active-text)',
            border: `1px solid ${isPaused ? 'var(--paused-border)' : 'var(--active-border)'}`,
          }}
        >
          {isPaused ? 'Pausado' : 'Ativo'}
        </span>

        {ad.thumbnail_url
          ? <img src={ad.thumbnail_url} alt="" className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ color: 'var(--border)', fontSize: '28px' }}>▷</span>
            </div>
          )
        }

        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="#000"><path d="M3 2l9 5-9 5V2z"/></svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <p className="font-body mb-3 line-clamp-2" style={{ fontSize: '11px', color: 'var(--muted-light)', lineHeight: 1.4 }}
          title={ad.name}>{ad.name}</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { l: 'Invest.', v: ad.insights ? formatCurrency(ad.insights.spend) : '—' },
            { l: 'Compras', v: ad.insights ? formatNumber(ad.insights.purchases) : '—' },
            { l: 'CPA',     v: ad.insights?.cost_per_purchase ? formatCurrency(ad.insights.cost_per_purchase) : '—', hi: true },
            { l: 'CTR',     v: ad.insights ? formatPercent(ad.insights.ctr) : '—' },
          ].map(m => (
            <div key={m.l} className="text-center">
              <p className="font-body uppercase" style={{ fontSize: '9px', fontWeight: 300, color: 'var(--muted)', letterSpacing: '0.08em', marginBottom: '3px' }}>{m.l}</p>
              <p className="font-display" style={{ fontSize: '15px', fontWeight: 500, color: m.hi ? 'var(--gold)' : 'var(--white)' }}>{m.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdsGrid({ ads, loading }: { ads: MetaAd[]; loading: boolean }) {
  const sorted = [...ads].sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
    return (a.insights?.cost_per_purchase ?? Infinity) - (b.insights?.cost_per_purchase ?? Infinity)
  })

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-card border overflow-hidden" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
            <div className="skeleton" style={{ aspectRatio: '16/9' }} />
            <div style={{ padding: '12px' }}>
              <div className="skeleton mb-3" style={{ height: '9px', width: '80%' }} />
              <div className="grid grid-cols-4 gap-2">
                {[0,1,2,3].map(j => <div key={j} className="skeleton" style={{ height: '28px' }} />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 rounded-card border" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
        <p className="font-body" style={{ fontSize: '13px', color: 'var(--muted)' }}>Nenhum anúncio encontrado</p>
      </div>
    )
  }

  return (
    <div>
      <div
        className="mb-4 px-4 py-2 rounded font-body"
        style={{ background: 'var(--accent-teal-bg)', border: '1px solid var(--accent-teal)', fontSize: '11px', color: 'var(--accent-teal)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <span>Criativos deste conjunto</span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span>{sorted.filter(a => a.status === 'ACTIVE').length} ativos</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map(ad => <AdCard key={ad.id} ad={ad} />)}
      </div>
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
    setLevel(2)
    setLoadingL2(true)
    try {
      const res = await fetch(
        `/api/meta/adsets?campaign_id=${c.id}&date_start=${dateRange.start}&date_end=${dateRange.end}`
      )
      const data = await res.json()
      setAdsets(data.adsets ?? [])
    } catch { setAdsets([]) }
    finally { setLoadingL2(false) }
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
        <AdsGrid ads={drillAds} loading={loadingL3} />
      )}
    </div>
  )
}
