'use client'

import { KiwifyData, DashboardData } from '@/types'
import { formatCurrency, formatNumber } from '@/lib/formatters'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface KiwifyKPIsProps {
  kiwify: KiwifyData | null
  metaData: DashboardData | null
  loading: boolean
}

interface CardDef {
  label: string
  value: string
  sub?: string
}

function buildCards(kiwify: KiwifyData, metaSpend: number, metaPurchases: number): CardDef[] {
  const cpaReal = kiwify.total_sales > 0 ? metaSpend / kiwify.total_sales : 0
  const diff = kiwify.total_sales - metaPurchases

  return [
    {
      label: 'Vendas Totais',
      value: formatNumber(kiwify.total_sales),
    },
    {
      label: 'Faturamento Bruto',
      value: formatCurrency(kiwify.gross_revenue),
    },
    {
      label: 'Ticket Médio',
      value: kiwify.total_sales > 0 ? formatCurrency(kiwify.avg_ticket) : '—',
    },
    {
      label: 'Última Venda',
      value: kiwify.last_sale_at
        ? format(new Date(kiwify.last_sale_at), "dd/MM 'às' HH:mm", { locale: ptBR })
        : '—',
    },
    {
      label: 'CPA Real',
      value: cpaReal > 0 ? formatCurrency(cpaReal) : '—',
      sub: 'Investimento ÷ Vendas Kiwify',
    },
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

function PixelVsRealCard({
  metaPurchases,
  kiwifySales,
  loading,
}: {
  metaPurchases: number
  kiwifySales: number
  loading: boolean
}) {
  const diff = kiwifySales - metaPurchases

  if (loading) return <Skeleton />

  return (
    <div
      className="rounded-card border overflow-hidden"
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
          Pixel vs Real
        </p>
        <div className="flex gap-4 mb-3">
          <div>
            <p className="font-body" style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
              Meta (pixel)
            </p>
            <p
              className="font-display leading-none"
              style={{ fontSize: '24px', fontWeight: 600, color: 'var(--muted-light)' }}
            >
              {formatNumber(metaPurchases)}
            </p>
          </div>
          <div>
            <p className="font-body" style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
              Kiwify (real)
            </p>
            <p
              className="font-display leading-none"
              style={{ fontSize: '24px', fontWeight: 600, color: 'var(--white)' }}
            >
              {formatNumber(kiwifySales)}
            </p>
          </div>
        </div>
        {diff > 0 ? (
          <span
            className="font-body"
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '3px',
              fontSize: '11px',
              background: 'rgba(100,200,120,0.1)',
              color: '#6dc87a',
              border: '1px solid rgba(100,200,120,0.25)',
            }}
          >
            +{formatNumber(diff)} não rastreadas
          </span>
        ) : (
          <span
            className="font-body"
            style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 300 }}
          >
            Aguardando dados Kiwify
          </span>
        )}
      </div>
    </div>
  )
}

export default function KiwifyKPIs({ kiwify, metaData, loading }: KiwifyKPIsProps) {
  const metaSpend     = metaData?.totals.spend     ?? 0
  const metaPurchases = metaData?.totals.purchases ?? 0
  const kiwifySales   = kiwify?.total_sales        ?? 0

  if (loading || !kiwify) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    )
  }

  const cards = buildCards(kiwify, metaSpend, metaPurchases)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-card border overflow-hidden"
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
      <PixelVsRealCard
        metaPurchases={metaPurchases}
        kiwifySales={kiwifySales}
        loading={false}
      />
    </div>
  )
}
