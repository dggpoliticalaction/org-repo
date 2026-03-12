import type { Article, User, Media } from "../payload-types"
import { getServerSideURL } from "./getURL"
import { getMediaUrl } from "./getMediaUrl"

const SITE_NAME = "The Pragmatic Papers"
const SITE_DESCRIPTION =
  "Pragmatic, community-driven articles focusing on news, politics, economics, and more."

function getImageUrl(media: Media | number | null | undefined): string | undefined {
  if (!media || typeof media === "number") return undefined
  return getMediaUrl(media.sizes?.og?.url || media.url) || undefined
}

export function buildArticleJsonLd(article: Article, url: string) {
  const serverUrl = getServerSideURL()
  const authors = (article.authors || [])
    .filter((a): a is User => typeof a !== "number")
    .map((author) => ({
      "@type": "Person" as const,
      name: author.name || undefined,
      url: author.slug ? `${serverUrl}/authors/${author.slug}` : undefined,
    }))

  const image = getImageUrl(article.heroImage) || getImageUrl(article.meta?.image)

  return {
    "@context": "https://schema.org" as const,
    "@type": "Article" as const,
    headline: article.meta?.title || article.title,
    description: article.meta?.description || undefined,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: authors.length > 0 ? authors : undefined,
    publisher: {
      "@type": "Organization" as const,
      name: SITE_NAME,
      url: serverUrl,
      logo: {
        "@type": "ImageObject" as const,
        url: `${serverUrl}/the-pragmatic-papers-opengraph-image.png`,
      },
    },
    image: image || undefined,
    mainEntityOfPage: {
      "@type": "WebPage" as const,
      "@id": url,
    },
  }
}

export function buildOrganizationJsonLd() {
  const serverUrl = getServerSideURL()
  return {
    "@context": "https://schema.org" as const,
    "@type": "Organization" as const,
    name: SITE_NAME,
    url: serverUrl,
    logo: {
      "@type": "ImageObject" as const,
      url: `${serverUrl}/the-pragmatic-papers-opengraph-image.png`,
    },
    description: SITE_DESCRIPTION,
  }
}

export function buildWebSiteJsonLd() {
  const serverUrl = getServerSideURL()
  return {
    "@context": "https://schema.org" as const,
    "@type": "WebSite" as const,
    name: SITE_NAME,
    url: serverUrl,
  }
}

export function buildPersonJsonLd(user: User, url: string) {
  const image = getImageUrl(user.profileImage)
  const sameAs = (user.socials || [])
    .map((s) => (s.link?.type === "custom" ? s.link.url : null))
    .filter((u): u is string => Boolean(u))

  return {
    "@context": "https://schema.org" as const,
    "@type": "Person" as const,
    name: user.name || undefined,
    url,
    image: image || undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    affiliation: user.affiliation
      ? { "@type": "Organization" as const, name: user.affiliation }
      : undefined,
  }
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function buildCollectionPageJsonLd(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "CollectionPage" as const,
    name: title,
    description,
    url,
  }
}
