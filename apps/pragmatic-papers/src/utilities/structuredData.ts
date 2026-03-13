import type { Article, User, Media } from "../payload-types"
import { getServerSideURL } from "./getURL"
import { getMediaUrl } from "./getMediaUrl"

const SITE_NAME = "The Pragmatic Papers"
const SITE_DESCRIPTION =
  "Pragmatic, community-driven articles focusing on news, politics, economics, and more."

export interface ImageObjectJsonLd {
  "@type": "ImageObject"
  url: string
}

export interface OrganizationJsonLd {
  "@context": "https://schema.org"
  "@type": "Organization"
  name: string
  url: string
  logo: ImageObjectJsonLd
  description?: string
}

export interface PersonJsonLd {
  "@context": "https://schema.org"
  "@type": "Person"
  name: string | undefined
  url: string | undefined
  image: string | undefined
  sameAs: string[] | undefined
  affiliation: { "@type": "Organization"; name: string } | undefined
}

export interface ArticleJsonLd {
  "@context": "https://schema.org"
  "@type": "Article"
  headline: string | null | undefined
  description: string | undefined
  datePublished: string | null | undefined
  dateModified: string
  author: { "@type": "Person"; name: string | undefined; url: string | undefined }[] | undefined
  publisher: Omit<OrganizationJsonLd, "@context" | "description">
  image: string | undefined
  mainEntityOfPage: { "@type": "WebPage"; "@id": string }
}

export interface WebSiteJsonLd {
  "@context": "https://schema.org"
  "@type": "WebSite"
  name: string
  url: string
}

export interface BreadcrumbJsonLd {
  "@context": "https://schema.org"
  "@type": "BreadcrumbList"
  itemListElement: { "@type": "ListItem"; position: number; name: string; item: string }[]
}

export interface CollectionPageJsonLd {
  "@context": "https://schema.org"
  "@type": "CollectionPage"
  name: string
  description: string
  url: string
}

export type JsonLdData =
  | ArticleJsonLd
  | OrganizationJsonLd
  | WebSiteJsonLd
  | PersonJsonLd
  | BreadcrumbJsonLd
  | CollectionPageJsonLd

function getImageUrl(media: Media | number | null | undefined): string | undefined {
  if (!media || typeof media === "number") return undefined
  return getMediaUrl(media.sizes?.og?.url || media.url) || undefined
}

export function buildArticleJsonLd(article: Article, url: string): ArticleJsonLd {
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

export function buildOrganizationJsonLd(): OrganizationJsonLd {
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

export function buildWebSiteJsonLd(): WebSiteJsonLd {
  const serverUrl = getServerSideURL()
  return {
    "@context": "https://schema.org" as const,
    "@type": "WebSite" as const,
    name: SITE_NAME,
    url: serverUrl,
  }
}

export function buildPersonJsonLd(user: User, url: string): PersonJsonLd {
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

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): BreadcrumbJsonLd {
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

export function buildCollectionPageJsonLd(
  title: string,
  description: string,
  url: string,
): CollectionPageJsonLd {
  return {
    "@context": "https://schema.org" as const,
    "@type": "CollectionPage" as const,
    name: title,
    description,
    url,
  }
}
