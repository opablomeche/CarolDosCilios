'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { DashboardData } from '@/types'
import { formatCurrency, formatCompact, formatPercent } from '@/lib/formatters'

interface ChartsProps {
  data:       DashboardData | null
  dailySpend: { date: string; campaign: string; spend: number }[]
  loading:    boolean
}

const COLD_COLOR  = '#4a7ab8'
const WARM_COLOR  = '#b87a4a'
const OTHER_COLOR = '#555555'

function audienceType(name: string): 'cold' | 'warm' | 'other' {
  const n = name.toLowerCase()
  if (n.includes('cold')) return 'cold'
  if (n.includes('warm')) return 'warm'
  return 'other'
}

function campaignColor(name: string): string {
  const t = audienceType(name)
  return t === 'cold' ? COLD_COLOR : t === 'warm' ? WARM_COLOR : OTHER_COLOR
}

function buildDailyData(rows: { date: string; campaign: string; spend: number }[]) {
  const byDate: Record<string, Record<string, number>> = {}
  const campaigns = new Set<string>()
  for (const row of rows) {
    const d = row.date.slice(5)
    byDate[d] = byDate[d] ?? {}
    byDate[d][row.campaign] = (byDate[d][row.campaign] ?? 0) + row.spend
    campaigns.add(row.campaign)
  }
  const dates = Object.keys(byDate).sort()
  return {
    chartData: dates.map(d => ({ date: d, ...byDate[d] })),
    campaigns: Array.from(campaigns),
  }
}

function buildPieData(data: DashboardData) {
  let cold = 0, warm = 0, other = 0
  for (const c of data.campaigns) {
    const spend = c.insights?.spend ?? 0
    const t = audienceType(c.name)
    if (t === 'cold') cold += spend
    else if (t === 'warm') warm += spend
    else other += spend
  }
  const total = cold + warm + other || 1
  const result = []
  if (cold  > 0) result.push({ name: 'Cold',  value: cold,  color: COLD_COLOR,  pct: (cold  / total) * 100 })
  if (warm  > 0) result.push({ name: 'Warm',  value: warm,  color: WARM_COLOR,  pct: (warm  / total) * 100 })
  if (other > 0) result.push({ name: 'Outros',value: other, color: OTHER_COLOR, pct: (other / total) * 100 })
  return result
}

const TIP_STYLE = {
  backgroundColor: 'var(--surface-3)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontFamily: '"DM Sans", system-ui',
  fontSize: '11px',
  color: 'var(--white)',
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-card border p-5"
      style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}
    >
      <p
        className="font-body uppercase mb-5"
        style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.12em', color: 'var(--muted)' }}
      >
        {title}
      </p>
      {children}
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="flex items-end gap-1" style={{ height: '200px', padding: '0 4px' }}>
      {[50, 70, 45, 85, 60, 75, 40].map((h, i) => (
        <div key={i} className="skeleton flex-1" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

export default function Charts({ data, dailySpend, loading }: ChartsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Gasto Diário por Campanha"><SkeletonChart /></ChartCard>
        <ChartCard title="Distribuição por Audiência"><SkeletonChart /></ChartCard>
      </div>
    )
  }

  const { chartData, campaigns } = buildDailyData(dailySpend)
  const pieData = buildPieData(data)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar chart */}
      <ChartCard title="Gasto Diário por Campanha">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={14} barCategoryGap="35%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#5a5a5a', fontSize: 10, fontFamily: '"DM Sans"', fontWeight: 300 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tickFormatter={v => formatCompact(v)}
              tick={{ fill: '#5a5a5a', fontSize: 10, fontFamily: '"DM Sans"', fontWeight: 300 }}
              axisLine={false} tickLine={false} width={46}
            />
            <Tooltip
              contentStyle={TIP_STYLE}
              formatter={(value) => [formatCurrency(Number(value)), '']}
              labelStyle={{ color: 'var(--muted)', marginBottom: 4 }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            {campaigns.map((camp, i) => (
              <Bar
                key={camp}
                dataKey={camp}
                stackId="s"
                fill={campaignColor(camp)}
                radius={i === campaigns.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                name={camp.length > 26 ? camp.slice(0, 26) + '…' : camp}
                opacity={0.9}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Pie chart */}
      <ChartCard title="Distribuição por Audiência">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="40%"
              cy="50%"
              innerRadius={48}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              label={(props) => {
                const entry = pieData.find(p => p.name === props.name)
                return entry ? `${formatPercent(entry.pct, 0)}` : ''
              }}
              labelLine={false}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={0.9} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TIP_STYLE}
              formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value, entry) => {
                const item = pieData.find(p => p.name === value)
                return (
                  <span style={{ color: 'var(--muted-light)', fontSize: 11, fontFamily: '"DM Sans"', fontWeight: 300 }}>
                    {value} — {item ? formatCurrency(item.value) : ''}
                  </span>
                )
              }}
              iconType="circle"
              iconSize={7}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
