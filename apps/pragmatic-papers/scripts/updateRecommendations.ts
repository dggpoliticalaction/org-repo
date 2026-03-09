import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { getPayload } from 'payload'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const payloadConfigPath = path.join(__dirname, '../src/payload.config.ts')

/** Exponential decay factor per week. 0.15 ≈ half-life of ~4.6 weeks. */
const DECAY_LAMBDA = 0.15

/** How many top articles to store in the global. */
const MAX_RANKINGS = 20

/** GA4 date range to query. */
const DATE_RANGE_START = '90daysAgo'

/**
 * Minimum total users an article must have to be included in rankings.
 * Prevents old articles with very few visitors from having inflated scroll rates.
 * Articles in the latest volume are exempt from this threshold.
 */
const MIN_TOTAL_USERS = 10

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

const DRY_RUN = process.argv.includes('--dry-run')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ArticleMetrics {
  scrolledUsers: number
  totalUsers: number
  scrollRate: number
}

/** A candidate article with everything needed to score it. */
interface ArticleCandidate {
  /** Payload article ID (null in dry-run mode). */
  id: number | null
  slug: string
  title: string
  publishedAt: Date
  metrics: ArticleMetrics
  isLatestVolume: boolean
}

interface ScoredArticle {
  id: number | null
  slug: string
  title: string
  totalUsers: number
  scrolledUsers: number
  scrollRate: number
  weeksSincePublish: number
  recencyMultiplier: number
  engagementScore: number
  publishedAt: string
}

// ---------------------------------------------------------------------------
// GA4 fetch
// ---------------------------------------------------------------------------

async function fetchGA4Metrics(
  analytics: BetaAnalyticsDataClient,
  propertyId: string,
): Promise<Map<string, ArticleMetrics>> {
  const [report] = await analytics.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: DATE_RANGE_START, endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'scrolledUsers' }, { name: 'totalUsers' }],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePath',
        stringFilter: {
          matchType: 'BEGINS_WITH',
          value: '/articles/',
        },
      },
    },
  })

  const metricsBySlug = new Map<string, { scrolled: number; total: number }>()
  for (const row of report?.rows || []) {
    const pagePath = row.dimensionValues?.[0]?.value || ''
    const slug = pagePath.replace(/^\/articles\//, '').replace(/[/?#].*$/, '')
    if (!slug) continue

    const scrolled = parseInt(row.metricValues?.[0]?.value || '0', 10)
    const total = parseInt(row.metricValues?.[1]?.value || '0', 10)
    const existing = metricsBySlug.get(slug) || { scrolled: 0, total: 0 }
    metricsBySlug.set(slug, {
      scrolled: existing.scrolled + scrolled,
      total: existing.total + total,
    })
  }

  const result = new Map<string, ArticleMetrics>()
  for (const [slug, { scrolled, total }] of metricsBySlug) {
    result.set(slug, {
      scrolledUsers: scrolled,
      totalUsers: total,
      scrollRate: total > 0 ? scrolled / total : 0,
    })
  }

  return result
}

// ---------------------------------------------------------------------------
// Scoring (shared between dry-run and production)
// ---------------------------------------------------------------------------

function scoreArticles(candidates: ArticleCandidate[], now: number): ScoredArticle[] {
  return candidates
    .filter((c) => {
      if (c.metrics.totalUsers < MIN_TOTAL_USERS && !c.isLatestVolume) return false
      return true
    })
    .map((c) => {
      const weeksSincePublish = (now - c.publishedAt.getTime()) / MS_PER_WEEK
      const recencyMultiplier = Math.exp(-DECAY_LAMBDA * weeksSincePublish)
      const engagementScore = c.metrics.scrollRate * recencyMultiplier

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        totalUsers: c.metrics.totalUsers,
        scrolledUsers: c.metrics.scrolledUsers,
        scrollRate: Math.round(c.metrics.scrollRate * 10000) / 10000,
        weeksSincePublish: Math.round(weeksSincePublish * 10) / 10,
        recencyMultiplier: Math.round(recencyMultiplier * 1000) / 1000,
        engagementScore: Math.round(engagementScore * 1_000_000) / 1_000_000,
        publishedAt: c.publishedAt.toISOString().slice(0, 10),
      }
    })
    .sort((a, b) => b.engagementScore - a.engagementScore)
}

// ---------------------------------------------------------------------------
// Data sources: build candidates from either the live site or the DB
// ---------------------------------------------------------------------------

async function buildCandidatesFromSite(
  metricsBySlug: Map<string, ArticleMetrics>,
  logger: { info: (msg: string) => void },
): Promise<ArticleCandidate[]> {
  const SITE_URL = 'https://pragmaticpapers.com'
  const articleLinkRegex = /href="\/articles\/([^"]+)"/g
  const dateTimeRegex = /<time\s+dateTime="([^"]+)"/i

  const slugDates = new Map<string, Date>()
  const latestVolumeSlugs = new Set<string>()

  logger.info(`Fetching volume pages from ${SITE_URL}...`)

  let volumeNum = 38
  let consecutive404s = 0
  let isLatestVolume = true
  while (consecutive404s < 3) {
    const res = await fetch(`${SITE_URL}/volumes/${volumeNum}`)
    if (!res.ok) {
      consecutive404s++
      volumeNum--
      continue
    }
    consecutive404s = 0

    const html = await res.text()
    const dateMatch = dateTimeRegex.exec(html)
    const publishDate = dateMatch?.[1] ? new Date(dateMatch[1]) : null

    let articleCount = 0
    let linkMatch: RegExpExecArray | null
    while ((linkMatch = articleLinkRegex.exec(html)) !== null) {
      const slug = linkMatch[1]
      if (slug && !slugDates.has(slug)) {
        if (publishDate) slugDates.set(slug, publishDate)
        if (isLatestVolume) latestVolumeSlugs.add(slug)
        articleCount++
      }
    }

    logger.info(
      `  Volume ${volumeNum}: ${articleCount} articles, published ${publishDate?.toISOString().slice(0, 10) ?? 'unknown'}`,
    )
    isLatestVolume = false
    volumeNum--
  }

  logger.info(`Mapped ${slugDates.size} articles to publish dates`)

  const candidates: ArticleCandidate[] = []
  for (const [slug, publishedAt] of slugDates) {
    const metrics = metricsBySlug.get(slug)
    if (!metrics) continue
    candidates.push({
      id: null,
      slug,
      title: slug, // No title available in dry-run; slug is used for display
      publishedAt,
      metrics,
      isLatestVolume: latestVolumeSlugs.has(slug),
    })
  }

  return candidates
}

async function buildCandidatesFromDB(
  payload: Awaited<ReturnType<typeof getPayload>>,
  metricsBySlug: Map<string, ArticleMetrics>,
): Promise<ArticleCandidate[]> {
  const articles = await payload.find({
    collection: 'articles',
    draft: false,
    limit: 1000,
    pagination: false,
    overrideAccess: true,
    select: {
      slug: true,
      title: true,
      publishedAt: true,
    },
  })

  const latestVolume = await payload.find({
    collection: 'volumes',
    draft: false,
    limit: 1,
    sort: '-volumeNumber',
    overrideAccess: true,
    select: {
      articles: true,
    },
  })

  const latestVolumeArticleIds = new Set<number>()
  for (const ref of latestVolume.docs[0]?.articles || []) {
    latestVolumeArticleIds.add(typeof ref === 'number' ? ref : ref.id)
  }

  const candidates: ArticleCandidate[] = []
  for (const article of articles.docs) {
    if (!article.slug || !article.publishedAt) continue
    const metrics = metricsBySlug.get(article.slug)
    if (!metrics) continue
    candidates.push({
      id: article.id,
      slug: article.slug,
      title: article.title,
      publishedAt: new Date(article.publishedAt),
      metrics,
      isLatestVolume: latestVolumeArticleIds.has(article.id),
    })
  }

  return candidates
}

// ---------------------------------------------------------------------------
// Logging helpers
// ---------------------------------------------------------------------------

function logRawMetrics(
  metricsBySlug: Map<string, ArticleMetrics>,
  logger: { info: (msg: string) => void },
): void {
  const sortedByTotal = [...metricsBySlug.entries()].sort((a, b) => b[1].totalUsers - a[1].totalUsers)
  logger.info('Raw metrics (top 30 by traffic):')
  logger.info(
    `${''.padStart(6)} | ${'Total'.padStart(5)} | ${'Scroll'.padStart(6)} | ${'Rate'.padStart(6)} | Slug`,
  )
  for (const [slug, m] of sortedByTotal.slice(0, 30)) {
    logger.info(
      `${''.padStart(6)} | ${String(m.totalUsers).padStart(5)} | ${String(m.scrolledUsers).padStart(6)} | ${(m.scrollRate * 100).toFixed(1).padStart(5)}% | ${slug}`,
    )
  }
}

function logFilteredArticles(
  candidates: ArticleCandidate[],
  logger: { info: (msg: string) => void },
): void {
  const filtered = candidates.filter(
    (c) => c.metrics.totalUsers < MIN_TOTAL_USERS && !c.isLatestVolume,
  )
  if (filtered.length > 0) {
    logger.info(`\nFiltered out ${filtered.length} articles with < ${MIN_TOTAL_USERS} total users:`)
    for (const c of filtered.slice(0, 10)) {
      logger.info(
        `  ${c.metrics.totalUsers} users, ${(c.metrics.scrollRate * 100).toFixed(0)}% rate - ${c.slug}`,
      )
    }
  }
}

function logRankings(
  scored: ScoredArticle[],
  logger: { info: (msg: string) => void },
): void {
  logger.info(`\n=== FINAL RANKINGS (scrollRate × recency decay, min ${MIN_TOTAL_USERS} users) ===\n`)
  logger.info(
    `${'#'.padStart(3)} | ${'Score'.padStart(10)} | ${'Users'.padStart(5)} | ${'Scrolled'.padStart(8)} | ${'Rate'.padStart(6)} | ${'Decay'.padStart(5)} | ${'Wks'.padStart(4)} | ${'Published'.padEnd(10)} | Slug`,
  )
  logger.info('-'.repeat(120))
  for (let i = 0; i < Math.min(scored.length, 30); i++) {
    const s = scored[i]!
    logger.info(
      `${String(i + 1).padStart(3)} | ${s.engagementScore.toFixed(6).padStart(10)} | ${String(s.totalUsers).padStart(5)} | ${String(s.scrolledUsers).padStart(8)} | ${(s.scrollRate * 100).toFixed(1).padStart(5)}% | ${s.recencyMultiplier.toFixed(3).padStart(5)} | ${s.weeksSincePublish.toFixed(1).padStart(4)} | ${s.publishedAt.padEnd(10)} | ${s.slug}`,
    )
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const awaitedConfig = (await import(payloadConfigPath)).default
  const payload = await getPayload({ config: awaitedConfig })

  const propertyId = process.env.GA4_PROPERTY_ID
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!propertyId || !clientEmail || !privateKey) {
    payload.logger.error(
      'Missing required env vars: GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
    )
    process.exit(1)
  }

  const analytics = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  })

  payload.logger.info(`Fetching metrics from GA4 property ${propertyId}...`)
  const metricsBySlug = await fetchGA4Metrics(analytics, propertyId)
  payload.logger.info(`Got metrics for ${metricsBySlug.size} article paths`)

  const now = Date.now()

  // Build candidates from the appropriate source
  const candidates = DRY_RUN
    ? await buildCandidatesFromSite(metricsBySlug, payload.logger)
    : await buildCandidatesFromDB(payload, metricsBySlug)

  // Score using shared logic
  const scored = scoreArticles(candidates, now)

  if (DRY_RUN) {
    payload.logger.info('\n=== DRY RUN MODE ===\n')
    logRawMetrics(metricsBySlug, payload.logger)
    logFilteredArticles(candidates, payload.logger)
    logRankings(scored, payload.logger)
    payload.logger.info('\nDry run complete — no data written to DB.')
  } else {
    const topRankings = scored.slice(0, MAX_RANKINGS).map((s) => ({
      article: s.id!,
      engagementScore: s.engagementScore,
    }))

    await payload.updateGlobal({
      slug: 'article-recommendations',
      data: {
        lastUpdated: new Date().toISOString(),
        rankings: topRankings,
      },
    })

    payload.logger.info(`Updated recommendations with ${topRankings.length} articles`)
    logRankings(scored.slice(0, MAX_RANKINGS), payload.logger)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('Failed to update recommendations:', err)
  process.exit(1)
})
