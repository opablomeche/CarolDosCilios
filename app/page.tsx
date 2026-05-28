'use client'

import { useCallback, useEffect, useState } from 'react'
import { format, subDays, startOfYesterday, endOfYesterday } from 'date-fns'
import { ActiveTab, DatePreset, DateRange, DashboardData, KiwifyData } from '@/types'
import Sidebar           from '@/components/Sidebar'
import Header            from '@/components/Header'
import KPICards          from '@/components/KPICards'
import KiwifySidebar     from '@/components/KiwifySidebar'
import ConversionFunnel  from '@/components/ConversionFunnel'
import Charts            from '@/components/Charts'
import CampaignDrillDown from '@/components/CampaignDrillDown'
import CreativesGrid     from '@/components/CreativesGrid'

function getDateRange(preset: DatePreset, custom: DateRange): DateRange {
  const today = new Date()
  switch (preset) {
    case 'today':
      return { start: format(today, 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
    case 'yesterday':
      return { start: format(startOfYesterday(), 'yyyy-MM-dd'), end: format(endOfYesterday(), 'yyyy-MM-dd') }
    case 'last_7d':
      return { start: format(subDays(today, 6), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
    case 'custom':
      return custom
  }
}

interface ApiResponse extends DashboardData {
  dailySpend: { date: string; campaign: string; spend: number }[]
  error?: string
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="font-body uppercase"
        style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--muted)' }}
      >
        {children}
      </span>
      <div className="flex-1" style={{ height: '1px', background: 'var(--border-subtle)' }} />
    </div>
  )
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'overview',   label: 'Visão Geral' },
  { id: 'campaigns',  label: 'Campanhas'   },
  { id: 'creatives',  label: 'Criativos'   },
]

function MobileTopNav({
  activeTab,
  onTabChange,
}: {
  activeTab: ActiveTab
  onTabChange: (t: ActiveTab) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Top bar */}
      <div
        className="flex items-center justify-between"
        style={{ height: '52px', padding: '0 16px', background: '#080808', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <img src="/ak-logo.png" alt="AK Media" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span className="font-body" style={{ fontSize: '12px', color: 'var(--muted-light)', fontWeight: 400 }}>
            {process.env.NEXT_PUBLIC_CLIENT_NAME ?? 'Carol dos Cílios'}
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-light)', padding: '8px', display: 'flex', alignItems: 'center' }}
          aria-label="Menu"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <line x1="0" y1="1"  x2="18" y2="1"/>
            <line x1="0" y1="7"  x2="18" y2="7"/>
            <line x1="0" y1="13" x2="18" y2="13"/>
          </svg>
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ width: '220px', height: '100%', background: '#080808', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <img src="/ak-logo.png" alt="AK Media" style={{ width: '40px', height: '40px', objectFit: 'contain', marginBottom: '10px' }} />
              <p className="font-body" style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>
                {process.env.NEXT_PUBLIC_CLIENT_NAME ?? 'Carol dos Cílios'}
              </p>
            </div>
            <nav style={{ flex: 1, paddingTop: '8px' }}>
              {NAV_ITEMS.map(({ id, label }) => {
                const isActive = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => { onTabChange(id); setOpen(false) }}
                    className="w-full outline-none"
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      padding:      `10px 20px 10px ${isActive ? '18px' : '20px'}`,
                      borderTop:    'none',
                      borderRight:  'none',
                      borderBottom: 'none',
                      borderLeft:   `2px solid ${isActive ? 'var(--white)' : 'transparent'}`,
                      background:   isActive ? 'var(--surface-2)' : 'transparent',
                      color:        isActive ? 'var(--white)' : 'var(--muted)',
                      fontSize:     '13px',
                      fontFamily:   '"DM Sans", system-ui, sans-serif',
                      cursor:       'pointer',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </nav>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />
        </div>
      )}
    </>
  )
}

const EMPTY_KIWIFY: KiwifyData = {
  total_sales: 0, gross_revenue: 0, avg_ticket: 0, last_sale_at: null,
  by_source: { paid_traffic: 0, instagram: 0, manychat: 0, whatsapp: 0, direct: 0 },
}

export default function DashboardPage() {
  const [activeTab,     setActiveTab]     = useState<ActiveTab>('overview')
  const [preset,        setPreset]        = useState<DatePreset>('last_7d')
  const [customRange,   setCustomRange]   = useState<DateRange>({
    start: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    end:   format(new Date(), 'yyyy-MM-dd'),
  })
  const [data,          setData]          = useState<ApiResponse | null>(null)
  const [kiwifyData,    setKiwifyData]    = useState<KiwifyData | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [kiwifyLoading, setKiwifyLoading] = useState(true)
  const [error,         setError]         = useState<string | null>(null)

  const currentRange = getDateRange(preset, customRange)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const range = getDateRange(preset, customRange)
    try {
      const res  = await fetch(`/api/meta?date_start=${range.start}&date_end=${range.end}`)
      const json = await res.json() as ApiResponse
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [preset, customRange])

  const fetchKiwify = useCallback(async () => {
    setKiwifyLoading(true)
    try {
      const res  = await fetch('/api/kiwify')
      const json = await res.json() as KiwifyData
      setKiwifyData(json)
    } catch {
      setKiwifyData(EMPTY_KIWIFY)
    } finally {
      setKiwifyLoading(false)
    }
  }, [])

  useEffect(() => { fetchData()   }, [fetchData])
  useEffect(() => { fetchKiwify() }, [fetchKiwify])
  useEffect(() => {
    const t = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [fetchData])

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar — desktop only */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile nav — below lg */}
        <div className="lg:hidden">
          <MobileTopNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Header — lg and above */}
        <div className="hidden lg:block">
          <Header
            preset={preset}
            customRange={customRange}
            updatedAt={data?.updatedAt}
            onPresetChange={setPreset}
            onCustomRangeChange={setCustomRange}
          />
        </div>

        <main className="flex-1 overflow-y-auto" style={{ padding: '24px 20px' }}>

          {/* Error banner */}
          {error && !loading && (
            <div
              className="flex items-center gap-3 rounded-card border mb-6"
              style={{ background: 'rgba(184,90,90,0.05)', borderColor: 'rgba(184,90,90,0.2)', padding: '12px 16px' }}
            >
              <span style={{ color: 'var(--paused-text)' }}>⚠</span>
              <div className="flex-1">
                <p className="font-body" style={{ fontSize: '13px', color: 'var(--paused-text)' }}>Erro ao carregar dados</p>
                <p className="font-body" style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 300, marginTop: '2px' }}>{error}</p>
              </div>
              <button
                onClick={fetchData}
                className="font-body underline"
                style={{ fontSize: '12px', color: 'var(--paused-text)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* ── Visão Geral — 2 columns on lg+ ── */}
          {activeTab === 'overview' && (
            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                {/* Left column: Meta metrics */}
                <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <section>
                    <SectionLabel>KPIs Principais</SectionLabel>
                    <KPICards data={data} loading={loading} />
                  </section>

                  <section>
                    <SectionLabel>Funil de Conversão</SectionLabel>
                    <div
                      className="rounded-card border overflow-x-auto"
                      style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)', padding: '24px 20px 20px' }}
                    >
                      <ConversionFunnel data={data} loading={loading} />
                    </div>
                  </section>

                  <section>
                    <SectionLabel>Distribuição de Investimento</SectionLabel>
                    <Charts data={data} dailySpend={data?.dailySpend ?? []} loading={loading} />
                  </section>
                </div>

                {/* Right column: Kiwify sidebar */}
                <div className="w-full lg:w-80 shrink-0">
                  <KiwifySidebar kiwify={kiwifyData} metaData={data} loading={kiwifyLoading} />
                </div>

              </div>
            </div>
          )}

          {/* ── Campanhas ── */}
          {activeTab === 'campaigns' && (
            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
              <CampaignDrillDown
                campaigns={data?.campaigns ?? []}
                loading={loading}
                dateRange={currentRange}
              />
            </div>
          )}

          {/* ── Criativos ── */}
          {activeTab === 'creatives' && (
            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
              <CreativesGrid ads={data?.ads ?? []} loading={loading} />
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
