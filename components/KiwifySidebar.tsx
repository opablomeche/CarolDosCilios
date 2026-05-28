'use client'

import { KiwifyData, DashboardData } from '@/types'
import { formatCurrency, formatNumber } from '@/lib/formatters'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  kiwify: KiwifyData | null
  metaData: DashboardData | null
  loading: boolean
}

function Divider() {
  return <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '16px 0' }} />
}

function MetricRow({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <p
        className="font-body uppercase"
        style={{ fontSize: '9px', fontWeight: 400, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '3px' }}
      >
        {label}
      </p>
      <p
        className="font-display"
        style={{ fontSize: large ? '26px' : '20px', fontWeight: 600, color: 'var(--white)', lineHeight: 1.1 }}
      >
        {value}
      </p>
    </div>
  )
}

const EMPTY_SOURCE = { paid_traffic: 0, instagram: 0, manychat: 0, whatsapp: 0, direct: 0 }

export default function KiwifySidebar({ kiwify, metaData, loading }: Props) {
  const metaSpend     = metaData?.totals.spend     ?? 0
  const metaPurchases = metaData?.totals.purchases ?? 0
  const kiwifySales   = kiwify?.total_sales        ?? 0
  const cpaReal       = kiwifySales > 0 ? metaSpend / kiwifySales : 0
  const diff          = kiwifySales - metaPurchases
  const src           = kiwify?.by_source ?? EMPTY_SOURCE

  const sources = [
    { icon: '🎯', label: 'Tráfego Pago', value: src.paid_traffic },
    { icon: '📱', label: 'Instagram',    value: src.instagram     },
    { icon: '💬', label: 'ManyChat',     value: src.manychat      },
    { icon: '📲', label: 'WhatsApp',     value: src.whatsapp      },
    { icon: '🔗', label: 'Link na Bio',  value: src.direct        },
  ]

  return (
    <div
      className="rounded-card border"
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border-subtle)',
        padding: '20px',
        position: 'sticky',
        top: 0,
        maxHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <p
        className="font-body uppercase"
        style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em', color: 'var(--white)', marginBottom: '2px' }}
      >
        KIWIFY
      </p>
      <p className="font-body" style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 300, marginBottom: '4px' }}>
        Vendas Reais
      </p>

      <Divider />

      {loading ? (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div className="skeleton" style={{ height: '8px', width: '60px', marginBottom: '6px' }} />
              <div className="skeleton" style={{ height: '22px', width: '80px' }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <MetricRow label="Vendas Totais"    value={formatNumber(kiwifySales)}                                                     large />
          <MetricRow label="Faturamento Bruto" value={kiwify?.gross_revenue ? formatCurrency(kiwify.gross_revenue) : '—'} />
          <MetricRow label="Ticket Médio"     value={kiwifySales > 0 && kiwify?.avg_ticket ? formatCurrency(kiwify.avg_ticket) : '—'} />
          <MetricRow
            label="Última Venda"
            value={
              kiwify?.last_sale_at
                ? format(new Date(kiwify.last_sale_at), "dd/MM 'às' HH:mm", { locale: ptBR })
                : '—'
            }
          />
          <MetricRow label="CPA Real" value={cpaReal > 0 ? formatCurrency(cpaReal) : '—'} />

          <Divider />

          {/* Pixel vs Real */}
          <p
            className="font-body uppercase"
            style={{ fontSize: '9px', fontWeight: 400, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '10px' }}
          >
            PIXEL VS REAL
          </p>
          <div className="flex gap-5" style={{ marginBottom: '8px' }}>
            <div>
              <p className="font-body" style={{ fontSize: '9px', color: 'var(--muted)', marginBottom: '3px' }}>
                Meta (pixel)
              </p>
              <p
                className="font-display"
                style={{ fontSize: '20px', fontWeight: 600, color: 'var(--muted-light)', lineHeight: 1.1 }}
              >
                {formatNumber(metaPurchases)}
              </p>
            </div>
            <div>
              <p className="font-body" style={{ fontSize: '9px', color: 'var(--muted)', marginBottom: '3px' }}>
                Kiwify
              </p>
              <p
                className="font-display"
                style={{ fontSize: '20px', fontWeight: 600, color: 'var(--white)', lineHeight: 1.1 }}
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
                padding: '2px 7px',
                borderRadius: '3px',
                fontSize: '10px',
                background: 'rgba(100,200,120,0.1)',
                color: '#6dc87a',
                border: '1px solid rgba(100,200,120,0.2)',
              }}
            >
              +{formatNumber(diff)} não rastreadas
            </span>
          ) : (
            <span className="font-body" style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 300 }}>
              Aguardando dados
            </span>
          )}

          <Divider />

          {/* Origem das Vendas */}
          <p
            className="font-body uppercase"
            style={{ fontSize: '9px', fontWeight: 400, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '10px' }}
          >
            ORIGEM DAS VENDAS
          </p>
          <div>
            {sources.map(s => (
              <div
                key={s.label}
                className="flex items-center justify-between"
                style={{ marginBottom: '8px' }}
              >
                <span className="font-body" style={{ fontSize: '11px', color: 'var(--muted-light)' }}>
                  {s.icon} {s.label}
                </span>
                <span
                  className="font-display"
                  style={{ fontSize: '13px', fontWeight: 500, color: s.value > 0 ? 'var(--white)' : 'var(--muted)' }}
                >
                  {formatNumber(s.value)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
