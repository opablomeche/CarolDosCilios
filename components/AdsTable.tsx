'use client'

import { MetaAd } from '@/types'
import { formatCurrency, formatNumber, formatPercent, formatCompact } from '@/lib/formatters'

interface AdsTableProps {
  ads: MetaAd[]
  loading: boolean
}

function StatusBadge({ status }: { status: MetaAd['status'] }) {
  const isActive = status === 'ACTIVE'
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium',
        isActive
          ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
          : 'bg-red-500/10 text-red-400 border border-red-500/20',
      ].join(' ')}
    >
      <span
        className={[
          'w-1.5 h-1.5 rounded-full',
          isActive ? 'bg-lime-400 animate-pulse-lime' : 'bg-red-400',
        ].join(' ')}
      />
      {isActive ? 'Ativo' : 'Pausado'}
    </span>
  )
}

const COL_HEADERS = [
  { label: 'Anúncio', className: 'w-[35%]' },
  { label: 'Status', className: 'w-24' },
  { label: 'Investimento', className: 'text-right' },
  { label: 'Compras', className: 'text-right' },
  { label: 'CPA', className: 'text-right' },
  { label: 'CTR', className: 'text-right' },
  { label: 'Impressões', className: 'text-right' },
]

function SkeletonRow() {
  return (
    <tr>
      {COL_HEADERS.map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded bg-surface-3 animate-pulse" style={{ width: i === 0 ? '80%' : '60%' }} />
        </td>
      ))}
    </tr>
  )
}

export default function AdsTable({ ads, loading }: AdsTableProps) {
  const active = [...ads]
    .filter((a) => a.status === 'ACTIVE')
    .sort((a, b) => {
      const aCpa = a.insights?.cost_per_purchase ?? Infinity
      const bCpa = b.insights?.cost_per_purchase ?? Infinity
      return aCpa - bCpa
    })

  const paused = [...ads]
    .filter((a) => a.status !== 'ACTIVE')
    .sort((a, b) => {
      const aCpa = a.insights?.cost_per_purchase ?? Infinity
      const bCpa = b.insights?.cost_per_purchase ?? Infinity
      return aCpa - bCpa
    })

  const sorted = [...active, ...paused]

  return (
    <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="font-display font-semibold text-sm text-ink-primary tracking-tight">
            Anúncios
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Ativos primeiro · menor CPA → maior · pausados no final
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-lime-400 bg-lime-400/10 border border-lime-400/20 px-2 py-1 rounded-md">
            {loading ? '—' : active.length} ativos
          </span>
          <span className="text-xs font-mono text-ink-muted bg-surface-3 px-2 py-1 rounded-md">
            {loading ? '—' : paused.length} pausados
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              {COL_HEADERS.map((h) => (
                <th key={h.label} className={`table-header ${h.className ?? ''}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : sorted.map((ad, i) => {
                  const isPaused = ad.status !== 'ACTIVE'
                  return (
                    <tr
                      key={ad.id}
                      className={[
                        'border-b border-border-subtle last:border-0',
                        'hover:bg-surface-2/50 transition-colors duration-100',
                        isPaused ? 'opacity-50' : '',
                      ].join(' ')}
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <td className="table-cell font-body text-ink-primary max-w-xs">
                        <span className="block truncate" title={ad.name}>
                          {ad.name}
                        </span>
                        {ad.campaign_name && (
                          <span className="block text-xs text-ink-muted truncate mt-0.5" title={ad.campaign_name}>
                            {ad.campaign_name}
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={ad.status} />
                      </td>
                      <td className="table-cell text-right text-amber-400 font-semibold">
                        {ad.insights ? formatCurrency(ad.insights.spend) : '—'}
                      </td>
                      <td className="table-cell text-right">
                        {ad.insights ? formatNumber(ad.insights.purchases) : '—'}
                      </td>
                      <td className="table-cell text-right">
                        {ad.insights?.cost_per_purchase ? (
                          <span className="text-lime-400 font-semibold">
                            {formatCurrency(ad.insights.cost_per_purchase)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="table-cell text-right">
                        {ad.insights ? formatPercent(ad.insights.ctr) : '—'}
                      </td>
                      <td className="table-cell text-right">
                        {ad.insights ? formatCompact(ad.insights.impressions) : '—'}
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
