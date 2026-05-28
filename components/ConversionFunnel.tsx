'use client'

import { DashboardData } from '@/types'
import { formatCurrency, formatCompact, formatPercent, safeDiv } from '@/lib/formatters'

interface Props { data: DashboardData | null; loading: boolean }

interface Step {
  label:          string
  display:        string
  barPct:         number
  fillOpacity:    number
  isLast:         boolean
  connRate?:      string
  connLabel?:     string
  metrics:        { label: string; value: string }[]
}

function buildSteps(data: DashboardData): Step[] {
  const t = data.totals
  const max = t.impressions || 1

  const pct = (n: number) => Math.max(3, (n / max) * 100)

  return [
    {
      label: 'Impressões', display: formatCompact(t.impressions),
      barPct: 100, fillOpacity: 0.18, isLast: false,
      metrics: [
        { label: 'CPM', value: formatCurrency(t.cpm) },
        { label: 'CTR', value: formatPercent(t.ctr) },
      ],
    },
    {
      label: 'Cliques no Link', display: formatCompact(t.clicks),
      barPct: pct(t.clicks), fillOpacity: 0.13, isLast: false,
      connRate: formatPercent(safeDiv(t.clicks, t.impressions) * 100), connLabel: 'CTR',
      metrics: [{ label: 'CPC', value: formatCurrency(t.cpc) }],
    },
    {
      label: 'Views de Página', display: formatCompact(t.landing_page_views),
      barPct: pct(t.landing_page_views), fillOpacity: 0.10, isLast: false,
      connRate: formatPercent(t.page_view_rate), connLabel: 'Connect Rate',
      metrics: [
        { label: 'Connect Rate', value: formatPercent(t.page_view_rate) },
        { label: 'Custo/View',   value: formatCurrency(safeDiv(t.spend, t.landing_page_views)) },
      ],
    },
    {
      label: 'Checkouts', display: formatCompact(t.initiate_checkout),
      barPct: pct(t.initiate_checkout), fillOpacity: 0.08, isLast: false,
      connRate: formatPercent(t.checkout_rate), connLabel: 'Pág → Checkout',
      metrics: [
        { label: 'Pág × Checkout',  value: formatPercent(t.checkout_rate) },
        { label: 'Custo/Checkout', value: formatCurrency(safeDiv(t.spend, t.initiate_checkout)) },
      ],
    },
    {
      label: 'Compras', display: formatCompact(t.purchases),
      barPct: pct(t.purchases), fillOpacity: 0.22, isLast: true,
      connRate: formatPercent(t.purchase_rate), connLabel: 'Checkout → Compra',
      metrics: [
        { label: 'Checkout × Compra', value: formatPercent(t.purchase_rate) },
        { label: 'CPA',               value: formatCurrency(t.cost_per_purchase) },
        { label: 'CPA c/ Imposto',    value: formatCurrency(t.cpa_with_tax) },
      ],
    },
  ]
}

export default function ConversionFunnel({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="space-y-2" style={{ paddingLeft: '160px' }}>
        {[100, 68, 48, 30, 18].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: '36px', width: `${w}%` }} />
        ))}
      </div>
    )
  }

  const steps = buildSteps(data)

  return (
    <div>
      {steps.map((step, i) => (
        <div key={step.label}>
          {/* Connector */}
          {i > 0 && step.connRate && (
            <div className="flex items-center" style={{ height: '24px', paddingLeft: '160px' }}>
              <div style={{ width: '1px', height: '100%', background: 'var(--border)', marginRight: '10px' }} />
              <span className="font-body" style={{ fontSize: '11px', color: 'var(--muted-light)' }}>
                {step.connRate}
              </span>
              <span className="font-body ml-1.5" style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 300 }}>
                {step.connLabel}
              </span>
            </div>
          )}

          {/* Step row: [label 160px] [bar flex-1] [metrics 220px] */}
          <div className="flex items-center" style={{ height: '36px' }}>
            {/* Label */}
            <div
              className="flex items-center justify-end font-body"
              style={{ width: '160px', flexShrink: 0, paddingRight: '14px', fontSize: '12px', color: 'var(--muted-light)', fontWeight: 400 }}
            >
              {step.label}
            </div>

            {/* Bar — gradient fill via background */}
            <div className="flex-1 flex items-center" style={{ minWidth: 0 }}>
              <div
                className="flex items-center font-display"
                style={{
                  width: '100%',
                  height: '36px',
                  borderRadius: '3px',
                  background: `linear-gradient(to right, rgba(255,255,255,${step.fillOpacity}) ${step.barPct}%, var(--surface-3) ${step.barPct}%)`,
                  border: step.isLast ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                  paddingLeft: '12px',
                }}
              >
                <span
                  style={{ fontSize: '16px', fontWeight: 500, color: 'var(--white)', lineHeight: 1, whiteSpace: 'nowrap' }}
                >
                  {step.display}
                </span>
              </div>
            </div>

            {/* Metrics — always outside the bar */}
            <div
              className="flex items-center gap-5 font-body"
              style={{ width: '220px', flexShrink: 0, paddingLeft: '16px' }}
            >
              {step.metrics.map((m) => (
                <div key={m.label}>
                  <p style={{ fontSize: '10px', fontWeight: 300, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                    {m.label}
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: 400, color: 'var(--muted-light)' }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
