import { NextRequest, NextResponse } from 'next/server'
import { fetchCampaigns, fetchAds, fetchDailySpend } from '@/lib/meta'
import { MetaInsights } from '@/types'
import { safeDiv, calcRate } from '@/lib/formatters'
import { format, subDays } from 'date-fns'

function defaultRange() {
  const today = new Date()
  return {
    start: format(subDays(today, 6), 'yyyy-MM-dd'),
    end:   format(today, 'yyyy-MM-dd'),
  }
}

function sumInsights(list: { insights?: MetaInsights }[]): MetaInsights {
  return list.reduce<MetaInsights>(
    (acc, item) => {
      const ins = item.insights
      if (!ins) return acc
      return {
        spend:              acc.spend              + ins.spend,
        impressions:        acc.impressions        + ins.impressions,
        clicks:             acc.clicks             + ins.clicks,
        ctr:                0,
        cpm:                0,
        cpc:                0,
        landing_page_views: acc.landing_page_views + ins.landing_page_views,
        initiate_checkout:  acc.initiate_checkout  + ins.initiate_checkout,
        purchases:          acc.purchases          + ins.purchases,
        cost_per_purchase:  0,
      }
    },
    { spend: 0, impressions: 0, clicks: 0, ctr: 0, cpm: 0, cpc: 0,
      landing_page_views: 0, initiate_checkout: 0, purchases: 0, cost_per_purchase: 0 }
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const range      = defaultRange()
    const dateStart  = searchParams.get('date_start') ?? range.start
    const dateEnd    = searchParams.get('date_end')   ?? range.end

    const [campaigns, ads, dailySpend] = await Promise.all([
      fetchCampaigns(dateStart, dateEnd),
      fetchAds(dateStart, dateEnd),
      fetchDailySpend(dateStart, dateEnd),
    ])

    const raw = sumInsights(campaigns)
    const totals = {
      ...raw,
      ctr:              calcRate(raw.clicks, raw.impressions),
      cpm:              safeDiv(raw.spend, raw.impressions) * 1000,
      cpc:              safeDiv(raw.spend, raw.clicks),
      cost_per_purchase: safeDiv(raw.spend, raw.purchases),
      page_view_rate:   calcRate(raw.landing_page_views, raw.clicks),
      checkout_rate:    calcRate(raw.initiate_checkout, raw.landing_page_views),
      purchase_rate:    calcRate(raw.purchases, raw.initiate_checkout),
      cpa_with_tax:     safeDiv(raw.spend, raw.purchases) * 1.2,
    }

    return NextResponse.json({ campaigns, ads, totals, dailySpend, updatedAt: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
