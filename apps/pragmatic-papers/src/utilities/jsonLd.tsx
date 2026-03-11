import type { Article, User, Volume, Media } from '../payload-types'
import { getServerSideURL } from './getURL'
import { getMediaUrl } from './getMediaUrl'

type JsonLdObject = Record<string, unknown>

function getImageUrl(image: Media | number | null | undefined): string | undefined {
  if (!image || typeof image === 'number') return undefined
  return getMediaUrl(image.sizes?.og?.url || image.url) || undefined
}

function getAuthorNames(authors: Article['authors']): string[] {
  if (!authors) return []
  return authors
    .map((a) => (typeof a === 'object' && a !== null ? (a as User).name : undefined))
    .filter((name): name is string => !!name)
}

export function articleJsonLd(article: Partial<Article>, slug: string): JsonLdObject {
  const baseUrl = getServerSideURL()
  const authorNames = getAuthorNames(article.authors)
  const image = getImageUrl(article.heroImage as Media | number | undefined)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.meta?.title || article.title,
    description: article.meta?.description || undefined,
    image: image || undefined,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    url: `${baseUrl}/articles/${slug}`,
    author: authorNames.map((name) => ({
      '@type': 'Person',
      name,
    })),
    publisher: {
      '@type': 'Organization',
      name: 'The Pragmatic Papers',
      url: baseUrl,
    },
  }
}

export function volumeJsonLd(
  volume: Partial<Volume>,
  slug: string,
  articleCount?: number,
): JsonLdObject {
  const baseUrl = getServerSideURL()
  const image = getImageUrl(volume.meta?.image as Media | number | undefined)

  return {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    name: volume.meta?.title || volume.title,
    description: volume.meta?.description || volume.description,
    image: image || undefined,
    datePublished: volume.publishedAt,
    url: `${baseUrl}/volumes/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'The Pragmatic Papers',
      url: baseUrl,
    },
    ...(articleCount != null && { numberOfItems: articleCount }),
  }
}

export function authorJsonLd(user: User, slug: string): JsonLdObject {
  const baseUrl = getServerSideURL()
  const profile = user.profileImage
  const profileDoc = profile && typeof profile === 'object' ? (profile as Media) : undefined
  const image = profileDoc?.sizes?.square?.url || profileDoc?.url || undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    url: `${baseUrl}/authors/${slug}`,
    ...(user.affiliation && { affiliation: { '@type': 'Organization', name: user.affiliation } }),
    ...(image && { image: getMediaUrl(image) }),
  }
}

export function organizationJsonLd(): JsonLdObject {
  const baseUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Pragmatic Papers',
    url: baseUrl,
    logo: `${baseUrl}/the-pragmatic-papers-opengraph-image.png`,
    description:
      'Pragmatic, community-driven articles focusing on news, politics, economics, and more.',
  }
}

export function webSiteJsonLd(): JsonLdObject {
  const baseUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Pragmatic Papers',
    url: baseUrl,
  }
}

export function JsonLd({ data }: { data: JsonLdObject }): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
