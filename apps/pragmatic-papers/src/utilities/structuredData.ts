import type { Article, Media, Topic, User } from "@/payload-types"
import { getMediaUrl } from "@/utilities/getMediaUrl"
import { getServerSideURL } from "@/utilities/getURL"
import type {
  ArticleLeaf,
  BreadcrumbListLeaf,
  CollectionPageLeaf,
  OrganizationLeaf,
  PeriodicalLeaf,
  PersonLeaf,
  PublicationVolumeLeaf,
  Thing,
  WebSiteLeaf,
  WithContext,
} from "schema-dts"

const SERVER_URL = getServerSideURL()
const SITE_NAME = "The Pragmatic Papers"
const SITE_DESCRIPTION =
  "Pragmatic, community-driven articles focusing on news, politics, economics, and more."

export type JsonLdData = WithContext<Thing>

function getImageUrl(media: Media | number | null | undefined): string | undefined {
  if (!media || typeof media === "number") return undefined
  return getMediaUrl(media.sizes?.og?.url || media.url) || undefined
}

export function buildArticleJsonLd(article: Article, path: string): WithContext<ArticleLeaf> {
  const authors = (article.authors || [])
    .filter((a): a is User => typeof a !== "number")
    .map(
      (author): PersonLeaf => ({
        "@type": "Person",
        name: author.name || undefined,
        url: author.slug ? `${SERVER_URL}/authors/${author.slug}` : undefined,
      }),
    )

  const keywords = (article.topics || [])
    .filter((t): t is Topic => typeof t !== "number")
    .map((t) => t.name)

  const image = getImageUrl(article.meta?.image || article.heroImage)
  const publisher: OrganizationLeaf = {
    "@type": "Organization",
    name: SITE_NAME,
    url: SERVER_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SERVER_URL}/the-pragmatic-papers-opengraph-image.png`,
    },
  }

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.meta?.title || article.title || undefined,
    description: article.meta?.description || undefined,
    datePublished: article.publishedAt ?? article.createdAt,
    dateModified: article.updatedAt,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    author: authors.length > 0 ? authors : undefined,
    publisher,
    isPartOf: article.populatedVolume?.id
      ? ({
          "@type": "PublicationVolume",
          name:
            article.populatedVolume.title ??
            `Volume ${article.populatedVolume.volumeNumber}`,
          volumeNumber: article.populatedVolume.volumeNumber ?? undefined,
          isPartOf: {
            "@type": "Periodical",
            name: SITE_NAME,
            url: SERVER_URL,
          } satisfies PeriodicalLeaf,
        } satisfies PublicationVolumeLeaf)
      : undefined,
    image: image || undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SERVER_URL}${path}`,
    },
  }
}

export function buildOrganizationJsonLd(): WithContext<OrganizationLeaf> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SERVER_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SERVER_URL}/the-pragmatic-papers-opengraph-image.png`,
    },
    description: SITE_DESCRIPTION,
  }
}

export function buildWebSiteJsonLd(): WithContext<WebSiteLeaf> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SERVER_URL,
  }
}

export function buildPersonJsonLd(user: User, path: string): WithContext<PersonLeaf> {
  const image = getImageUrl(user.profileImage)
  const sameAs = (user.socials || [])
    .map((s) => (s.link?.type === "custom" ? s.link.url : null))
    .filter((u): u is string => Boolean(u))

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name || undefined,
    url: `${SERVER_URL}${path}`,
    image: image || undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    affiliation: user.affiliation ? { "@type": "Organization", name: user.affiliation } : undefined,
  }
}

export function buildBreadcrumbJsonLd(
  items?: { name: string; path: string }[],
): WithContext<BreadcrumbListLeaf> {
  const allItems = [
    { name: "Home", item: SERVER_URL },
    ...(items ?? []).map((item) => ({ name: item.name, item: `${SERVER_URL}${item.path}` })),
  ]
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  }
}

export function buildCollectionPageJsonLd(
  title: string,
  description: string,
  path: string,
): WithContext<CollectionPageLeaf> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `${SERVER_URL}${path}`,
  }
}
