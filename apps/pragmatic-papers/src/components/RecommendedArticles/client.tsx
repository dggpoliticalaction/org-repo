"use client"

import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"

const VARIANT_COOKIE = "pp_rec_variant"
const VIEWED_STORAGE_KEY = "pp_viewed_articles"
const DISPLAY_COUNT = 4
const VARIANTS = ["engagement", "recency", "random"] as const
type Variant = (typeof VARIANTS)[number]

interface RankedArticle {
  slug: string
  title: string
  metaImage: string | null
  metaDescription: string | null
  engagementScore: number
  publishedAt: string | null
}

interface Props {
  rankings: RankedArticle[]
  currentArticleSlug: string
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

function getOrAssignVariant(): Variant {
  const existing = getCookie(VARIANT_COOKIE)
  if (existing && VARIANTS.includes(existing as Variant)) return existing as Variant

  const variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)]!
  setCookie(VARIANT_COOKIE, variant, 90)
  return variant
}

function getViewedSlugs(): Set<string> {
  try {
    const stored = localStorage.getItem(VIEWED_STORAGE_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function markAsViewed(slug: string): void {
  try {
    const viewed = getViewedSlugs()
    viewed.add(slug)
    // Keep last 100 to avoid unbounded growth
    const arr = [...viewed].slice(-100)
    localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(arr))
  } catch {
    // localStorage unavailable
  }
}

function sortByVariant(articles: RankedArticle[], variant: Variant): RankedArticle[] {
  const copy = [...articles]
  switch (variant) {
    case "engagement":
      return copy.sort((a, b) => b.engagementScore - a.engagementScore)
    case "recency":
      return copy.sort(
        (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime(),
      )
    case "random":
      // Fisher-Yates shuffle
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = copy[i]!
        copy[i] = copy[j]!
        copy[j] = temp
      }
      return copy
  }
}

function RecommendationCard({ article, compact }: { article: RankedArticle; compact?: boolean }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className={`group block ${compact ? "" : "rounded-lg"}`}
    >
      {article.metaImage && (
        <div
          className={`overflow-hidden rounded ${compact ? "mb-2 aspect-[16/9]" : "mb-3 aspect-[4/3]"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.metaImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}
      <h3
        className={`group-hover:text-brand font-sans leading-snug font-semibold transition-colors ${compact ? "text-sm" : "text-base"}`}
      >
        {article.title}
      </h3>
      {!compact && article.metaDescription && (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{article.metaDescription}</p>
      )}
    </Link>
  )
}

export function RecommendedArticlesClient({
  rankings,
  currentArticleSlug,
}: Props): React.ReactNode {
  const [variant, setVariant] = useState<Variant | null>(null)

  useEffect(() => {
    const v = getOrAssignVariant()
    setVariant(v)

    // Track current article as viewed
    markAsViewed(currentArticleSlug)

    // Set GA4 custom dimension for A/B analysis
    if (typeof window !== "undefined" && "gtag" in window) {
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
        "set",
        "user_properties",
        { recommendation_variant: v },
      )
    }
  }, [currentArticleSlug])

  const articles = useMemo(() => {
    if (!variant) return []

    const viewedSlugs = getViewedSlugs()
    const filtered = rankings.filter(
      (r) => r.slug !== currentArticleSlug && !viewedSlugs.has(r.slug),
    )

    // If we filtered too aggressively, fall back to just excluding current
    const candidates =
      filtered.length >= DISPLAY_COUNT
        ? filtered
        : rankings.filter((r) => r.slug !== currentArticleSlug)

    return sortByVariant(candidates, variant).slice(0, DISPLAY_COUNT)
  }, [variant, rankings, currentArticleSlug])

  // Don't render until variant is assigned (avoids hydration mismatch)
  if (!variant || articles.length === 0) return null

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden xl:block" aria-label="Recommended articles">
        <div className="sticky top-24">
          <h2 className="text-muted-foreground mb-4 border-b pb-2 font-sans text-xs font-bold tracking-wider uppercase">
            Recommended
          </h2>
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <RecommendationCard key={article.slug} article={article} compact />
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile / tablet bottom section */}
      <section className="mt-12 border-t pt-8 xl:hidden" aria-label="Recommended articles">
        <h2 className="text-muted-foreground mb-4 font-sans text-xs font-bold tracking-wider uppercase">
          Recommended
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {articles.map((article) => (
            <RecommendationCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </>
  )
}
