import { MetaCampaign, MetaAdSet, MetaAd, MetaInsights } from '@/types'

const BASE_URL = 'https://graph.facebook.com/v19.0'

function getAccountId(): string {
  const id = process.env.META_AD_ACCOUNT_ID
  if (!id) throw new Error('META_AD_ACCOUNT_ID não configurado')
  // Normaliza: garante que sempre tem prefixo act_
  return id.startsWith('act_') ? id : `act_${id}`
}

function getCampaignFilter(): string {
  return process.env.META_CAMPAIGN_FILTER ?? ''
}

const INSIGHT_FIELDS = [
  'spend', 'impressions', 'outbound_clicks', 'outbound_clicks_ctr', 'cpm', 'cpc',
  'actions', 'cost_per_action_type',
].join(',')

type InsightRow = Record<string, unknown>
type MetaPage<T> = {
  data: T[]
  paging?: { cursors?: { after?: string }; next?: string }
}

async function fetchAllMetaPages<T>(path: string, params: Record<string, string>): Promise<T[]> {
  const all: T[] = []
  let after: string | undefined
  while (true) {
    const p = after ? { ...params, after } : params
    const page = await fetchMeta<MetaPage<T>>(path, p)
    all.push(...(page.data ?? []))
    if (!page.paging?.next || !page.paging?.cursors?.after) break
    after = page.paging.cursors.after
  }
  return all
}

function parseActionArray(field: unknown): string {
  if (!Array.isArray(field) || field.length === 0) return '0'
  return (field[0] as { value?: string }).value ?? '0'
}

function parseInsights(row: InsightRow): MetaInsights {
  const actions     = (row.actions          as { action_type: string; value: string }[]) ?? []
  const costPerAct  = (row.cost_per_action_type as { action_type: string; value: string }[]) ?? []

  const getA = (t: string) => parseFloat(actions.find(a => a.action_type === t)?.value ?? '0')
  const getC = (t: string) => parseFloat(costPerAct.find(a => a.action_type === t)?.value ?? '0')

  return {
    spend:              parseFloat((row.spend       as string) ?? '0'),
    impressions:        parseInt((row.impressions   as string) ?? '0', 10),
    clicks:             parseInt(parseActionArray(row.outbound_clicks), 10),
    ctr:                parseFloat(parseActionArray(row.outbound_clicks_ctr)),
    cpm:                parseFloat((row.cpm         as string) ?? '0'),
    cpc:                parseFloat((row.cpc         as string) ?? '0'),
    landing_page_views: getA('landing_page_view'),
    initiate_checkout:  getA('initiate_checkout'),
    purchases:          getA('purchase'),
    cost_per_purchase:  getC('purchase'),
  }
}

async function fetchMeta<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = process.env.META_ACCESS_TOKEN
  if (!token) throw new Error('META_ACCESS_TOKEN não configurado')

  const accountId = getAccountId()
  console.log(`[META API] account_id: ${accountId} | path: ${path}`)

  const url = new URL(`${BASE_URL}/${path}`)
  url.searchParams.set('access_token', token)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    const msg = err?.error?.message ?? `Meta API error ${res.status}`
    console.error(`[META API] ERROR: ${msg}`)
    throw new Error(msg)
  }

  const json = await res.json() as Record<string, unknown>
  console.log(`[META API] rows: ${Array.isArray(json.data) ? (json.data as unknown[]).length : '?'}`)
  return json as T
}

function buildFiltering(filter: string, field: string): string {
  if (!filter) return '[]'
  return JSON.stringify([{ field, operator: 'CONTAIN', value: filter }])
}

function buildEqualFilter(value: string, field: string): string {
  return JSON.stringify([{ field, operator: 'EQUAL', value }])
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function fetchCampaigns(dateStart: string, dateEnd: string): Promise<MetaCampaign[]> {
  const accountId = getAccountId()
  const filter = getCampaignFilter()
  const timeRange = JSON.stringify({ since: dateStart, until: dateEnd })

  type CM = { id: string; name: string; status: MetaCampaign['status'] }
  const metaRes = await fetchMeta<MetaPage<CM>>(`${accountId}/campaigns`, {
    fields: 'id,name,status',
    filtering: buildFiltering(filter, 'name'),
    limit: '200',
  })
  const campaigns = metaRes.data ?? []
  if (campaigns.length === 0) return []

  const insightRes = await fetchMeta<MetaPage<InsightRow>>(`${accountId}/insights`, {
    fields: `campaign_id,${INSIGHT_FIELDS}`,
    level: 'campaign',
    time_range: timeRange,
    filtering: buildFiltering(filter, 'campaign.name'),
    limit: '200',
  })

  const iMap = new Map(
    (insightRes.data ?? []).map(r => [r.campaign_id as string, parseInsights(r)])
  )

  return campaigns.map(c => ({ ...c, insights: iMap.get(c.id) }))
}

// ─── AdSets ──────────────────────────────────────────────────────────────────

export async function fetchAdSets(campaignId: string, dateStart: string, dateEnd: string): Promise<MetaAdSet[]> {
  const accountId = getAccountId()
  const timeRange = JSON.stringify({ since: dateStart, until: dateEnd })

  type AS = { id: string; name: string; status: MetaAdSet['status'] }
  const metaRes = await fetchMeta<MetaPage<AS>>(`${campaignId}/adsets`, {
    fields: 'id,name,status',
    limit: '200',
  })
  const adsets = metaRes.data ?? []
  if (adsets.length === 0) return []

  const insightRes = await fetchMeta<MetaPage<InsightRow>>(`${accountId}/insights`, {
    fields: `adset_id,${INSIGHT_FIELDS}`,
    level: 'adset',
    time_range: timeRange,
    filtering: buildEqualFilter(campaignId, 'campaign.id'),
    limit: '200',
  })

  const iMap = new Map(
    (insightRes.data ?? []).map(r => [r.adset_id as string, parseInsights(r)])
  )

  return adsets.map(a => ({ ...a, campaign_id: campaignId, insights: iMap.get(a.id) }))
}

// ─── Ads (by adset) ──────────────────────────────────────────────────────────

export async function fetchAdsByAdset(adsetId: string, dateStart: string, dateEnd: string): Promise<MetaAd[]> {
  const accountId = getAccountId()
  const timeRange = JSON.stringify({ since: dateStart, until: dateEnd })

  type AM = {
    id: string; name: string; status: MetaAd['status']
    adset_id: string; campaign_id: string
    creative?: { thumbnail_url?: string; instagram_permalink_url?: string }
  }

  const metaRes = await fetchMeta<MetaPage<AM>>(`${adsetId}/ads`, {
    fields: 'id,name,status,adset_id,campaign_id,creative{thumbnail_url,instagram_permalink_url}',
    limit: '200',
  })
  const ads = metaRes.data ?? []
  if (ads.length === 0) return []

  const insightRes = await fetchMeta<MetaPage<InsightRow>>(`${accountId}/insights`, {
    fields: `ad_id,${INSIGHT_FIELDS}`,
    level: 'ad',
    time_range: timeRange,
    filtering: buildEqualFilter(adsetId, 'adset.id'),
    limit: '200',
  })

  const iMap = new Map(
    (insightRes.data ?? []).map(r => [r.ad_id as string, parseInsights(r)])
  )

  return ads.map(a => ({
    id: a.id,
    name: a.name,
    status: a.status,
    campaign_id: a.campaign_id,
    adset_id: a.adset_id,
    thumbnail_url: a.creative?.thumbnail_url,
    instagram_permalink_url: a.creative?.instagram_permalink_url,
    insights: iMap.get(a.id),
  }))
}

// ─── Ads (all campaigns, for overview) ───────────────────────────────────────

export async function fetchAds(dateStart: string, dateEnd: string): Promise<MetaAd[]> {
  const accountId = getAccountId()
  const filter = getCampaignFilter()
  const timeRange = JSON.stringify({ since: dateStart, until: dateEnd })

  type AM = {
    id: string; name: string; status: MetaAd['status']
    campaign_id: string; campaign?: { name: string }
    creative?: { thumbnail_url?: string; instagram_permalink_url?: string }
  }

  const ads = await fetchAllMetaPages<AM>(`${accountId}/ads`, {
    fields: 'id,name,status,campaign_id,campaign{name},creative{thumbnail_url,instagram_permalink_url}',
    filtering: buildFiltering(filter, 'campaign.name'),
    effective_status: JSON.stringify(['ACTIVE', 'PAUSED', 'ARCHIVED']),
    limit: '200',
  })
  if (ads.length === 0) return []

  const insightRows = await fetchAllMetaPages<InsightRow>(`${accountId}/insights`, {
    fields: `ad_id,${INSIGHT_FIELDS}`,
    level: 'ad',
    time_range: timeRange,
    filtering: buildFiltering(filter, 'campaign.name'),
    limit: '200',
  })

  const iMap = new Map(insightRows.map(r => [r.ad_id as string, parseInsights(r)]))

  return ads.map(a => ({
    id: a.id,
    name: a.name,
    status: a.status,
    campaign_id: a.campaign_id,
    campaign_name: a.campaign?.name,
    thumbnail_url: a.creative?.thumbnail_url,
    instagram_permalink_url: a.creative?.instagram_permalink_url,
    insights: iMap.get(a.id),
  }))
}

// ─── Daily spend ─────────────────────────────────────────────────────────────

export async function fetchDailySpend(dateStart: string, dateEnd: string): Promise<{ date: string; campaign: string; spend: number }[]> {
  const accountId = getAccountId()
  const filter = getCampaignFilter()

  type DR = { campaign_name: string; spend: string; date_start: string }
  const data = await fetchMeta<MetaPage<DR>>(`${accountId}/insights`, {
    fields: 'campaign_name,spend,date_start',
    time_range: JSON.stringify({ since: dateStart, until: dateEnd }),
    time_increment: '1',
    level: 'campaign',
    filtering: buildFiltering(filter, 'campaign.name'),
    limit: '500',
  })

  return (data.data ?? []).map(r => ({
    date: r.date_start,
    campaign: r.campaign_name,
    spend: parseFloat(r.spend ?? '0'),
  }))
}
