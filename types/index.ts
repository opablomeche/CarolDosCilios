export interface MetaCampaign {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'
  insights?: MetaInsights
}

export interface MetaAdSet {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'
  campaign_id?: string
  insights?: MetaInsights
}

export interface MetaAd {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'
  campaign_id: string
  campaign_name?: string
  adset_id?: string
  adset_name?: string
  thumbnail_url?: string
  instagram_permalink_url?: string
  insights?: MetaInsights
}

export interface MetaInsights {
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpm: number
  cpc: number
  landing_page_views: number
  initiate_checkout: number
  purchases: number
  cost_per_purchase: number
}

export interface DashboardData {
  campaigns: MetaCampaign[]
  ads: MetaAd[]
  totals: MetaInsights & {
    page_view_rate: number
    checkout_rate: number
    purchase_rate: number
    cpa_with_tax: number
  }
  updatedAt: string
}

export type DatePreset = 'today' | 'yesterday' | 'last_7d' | 'custom'

export interface DateRange {
  start: string
  end: string
}

export interface KiwifyData {
  total_sales: number
  gross_revenue: number
  avg_ticket: number
  last_sale_at: string | null
  by_source: {
    paid_traffic: number
    instagram: number
    manychat: number
    whatsapp: number
    direct: number
  }
}

export type ActiveTab = 'overview' | 'campaigns' | 'creatives'

export type DrillLevel = 1 | 2 | 3
