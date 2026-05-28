'use client'

import { useEffect, useState } from 'react'
import { DashboardData } from '@/types'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/formatters'

interface KPICardsProps {
  data: DashboardData | null
  loading: boolean
}

interface CardDef { label: string; value: string; sub?: string; delay: string }

function buildCards(data: DashboardData): CardDef[] {
  const t = data.totals
  return [
    { label: 'Investimento',      value: formatCurrency(t.spend),            delay: 'delay-0' },
    { label: 'Compras',           value: formatNumber(t.purchases),          sub: `CPA c/ imposto ${formatCurrency(t.cpa_with_tax)}`,     delay: 'delay-80' },
    { label: 'CPA',               value: formatCurrency(t.cost_per_purchase),sub: `Meta (20%) ${formatCurrency(t.cpa_with_tax)}`,          delay: 'delay-160' },
    { label: 'Página × Checkout', value: formatPercent(t.checkout_rate),     sub: `${formatNumber(t.initiate_checkout)} checkouts`,        delay: 'delay-240' },
    { label: 'Checkout × Compra', value: formatPercent(t.purchase_rate),     sub: `${formatNumber(t.purchases)} compras confirmadas`,      delay: 'delay-320' },
  ]
}

function Skeleton() {
  return (
    <div
      className="rounded-card border p-5"
      style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)', borderTop: '2px solid var(--border)' }}
    >
      <div className="skeleton mb-4" style={{ height: '9px', width: '80px' }} />
      <div className="skeleton mb-2" style={{ height: '38px', width: '140px' }} />
      <div className="skeleton" style={{ height: '9px', width: '110px' }} />
    </div>
  )
}

export default function KPICards({ data, loading }: KPICardsProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (data && !loading) {
      const t = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(t)
    }
    setVisible(false)
  }, [data, loading])

  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {buildCards(data).map((card) => (
        <div
          key={card.label}
          className={`rounded-card border overflow-hidden ${visible ? `animate-fade-up ${card.delay}` : 'opacity-0'}`}
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border-subtle)',
            borderTop: '2px solid var(--white)',
          }}
        >
          <div style={{ padding: '20px' }}>
            <p
              className="font-body uppercase mb-3"
              style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--muted)' }}
            >
              {card.label}
            </p>
            <p
              className="font-display leading-none mb-2"
              style={{ fontSize: '32px', fontWeight: 600, color: 'var(--white)' }}
            >
              {card.value}
            </p>
            {card.sub && (
              <p
                className="font-body leading-snug"
                style={{ fontSize: '11px', fontWeight: 300, color: 'var(--muted)' }}
              >
                {card.sub}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
