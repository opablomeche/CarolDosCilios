'use client'

import { MetaCampaign } from '@/types'
import { formatCurrency, formatNumber, formatPercent, formatCompact } from '@/lib/formatters'

interface CampaignTableProps {
  campaigns: MetaCampaign[]
  loading: boolean
}

function StatusBadge({ status }: { status: MetaCampaign['status'] }) {
  const isActive = status === 'ACTIVE'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-body font-medium"
      style={{
        borderRadius: '4px',
        background: isActive ? 'var(--active)' : 'var(--paused)',
        color: isActive ? 'var(--active-text)' : 'var(--paused-text)',
        border: isActive
          ? '1px solid var(--active-text)'
          : '1px solid var(--paused-text)',
        opacity: isActive ? 1 : 0.7,
      }}
    >
      {isActive ? 'Ativa' : 'Pausada'}
    </span>
  )
}

const HEADERS = ['Campanha', 'Status', 'Investimento', 'Compras', 'CPA', 'CTR', 'Impressões']

function SkeletonRow({ alt }: { alt: boolean }) {
  return (
    <tr style={{ background: alt ? 'var(--surface-2)' : 'var(--surface-1)' }}>
      {HEADERS.map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3 rounded"
            style={{ background: 'var(--surface-3)', width: i === 0 ? '75%' : '55%' }}
          />
        </td>
      ))}
    </tr>
  )
}

export default function CampaignTable({ campaigns, loading }: CampaignTableProps) {
  const sorted = [...campaigns].sort((a, b) => {
    const aCpa = a.insights?.cost_per_purchase ?? Infinity
    const bCpa = b.insights?.cost_per_purchase ?? Infinity
    return aCpa - bCpa
  })

  return (
    <div
      className="rounded-card border overflow-hidden"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {/* Table header row */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
      >
        <div>
          <p className="text-sm font-body font-medium" style={{ color: 'var(--cream)' }}>
            Campanhas
          </p>
          <p className="text-xs font-body mt-0.5" style={{ color: 'var(--muted)' }}>
            Filtro: VR-MAI-2026 · ordenado por menor CPA
          </p>
        </div>
        <span
          className="text-xs font-body px-2 py-1 rounded"
          style={{ background: 'var(--surface-3)', color: 'var(--muted)' }}
        >
          {loading ? '—' : campaigns.length} campanha{campaigns.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {HEADERS.map((h, i) => (
                <th
                  key={h}
                  className="th"
                  style={{ textAlign: i > 1 ? 'right' : 'left' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} alt={i % 2 === 1} />)
              : sorted.map((c, i) => (
                  <tr
                    key={c.id}
                    className="transition-colors duration-150"
                    style={{
                      background: i % 2 === 1 ? 'var(--surface-2)' : 'var(--surface-1)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-3)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        i % 2 === 1 ? 'var(--surface-2)' : 'var(--surface-1)'
                    }}
                  >
                    <td className="td max-w-xs" style={{ maxWidth: '260px' }}>
                      <span className="block truncate text-sm font-body" title={c.name}
                        style={{ color: 'var(--cream)' }}>
                        {c.name}
                      </span>
                    </td>
                    <td className="td">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="td text-right">
                      <span style={{ color: 'var(--gold)' }}>
                        {c.insights ? formatCurrency(c.insights.spend) : '—'}
                      </span>
                    </td>
                    <td className="td text-right" style={{ color: 'var(--cream)' }}>
                      {c.insights ? formatNumber(c.insights.purchases) : '—'}
                    </td>
                    <td className="td text-right">
                      <span
                        style={{
                          color: c.insights?.cost_per_purchase ? 'var(--gold)' : 'var(--muted)',
                          fontWeight: c.insights?.cost_per_purchase ? 500 : 400,
                        }}
                      >
                        {c.insights?.cost_per_purchase
                          ? formatCurrency(c.insights.cost_per_purchase)
                          : '—'}
                      </span>
                    </td>
                    <td className="td text-right" style={{ color: 'var(--muted)' }}>
                      {c.insights ? formatPercent(c.insights.ctr) : '—'}
                    </td>
                    <td className="td text-right" style={{ color: 'var(--muted)' }}>
                      {c.insights ? formatCompact(c.insights.impressions) : '—'}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
