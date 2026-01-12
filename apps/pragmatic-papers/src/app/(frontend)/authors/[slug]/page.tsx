import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Article as ArticleType, Author as AuthorType, Media as MediaType } from '@/payload-types'

import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { ArticleCard, type CardPostData } from '@/components/ArticleCard'

interface AuthorDoc {
  id: string | number
  name?: AuthorType['name'] | null
  slug?: AuthorType['slug'] | null
  affiliation?: AuthorType['affiliation']
  biography?: AuthorType['biography']
  profileImage?: AuthorType['profileImage']
  socialLinks?: AuthorType['socialLinks']
  user?: AuthorType['user'] | { id: string | number }
}

interface ArticleDoc {
  id: number
  title?: string | null
  slug?: string | null
  meta?: {
    description?: string | null
    image?: unknown
  } | null
}

interface VolumeDoc {
  id: number
  slug?: string | null
  title?: string | null
  articles?: (number | { id: number })[] | null
}

function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim()
  // If it already has a scheme like http:, https:, mailto:, etc., leave it
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed
  // Otherwise, treat as web URL and prefix https://
  return `https://${trimmed.replace(/^\/+/, '')}`
}

export async function generateStaticParams(): Promise<{ slug: string | null | undefined }[]> {
  const payload = await getPayload({ config: configPromise })
  const authors = await payload.find({
    collection: 'authors',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = authors.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

interface Args {
  params: Promise<{
    slug?: string
  }>
}

const queryAuthorBySlug = cache(
  async ({ slug }: { slug: string }): Promise<AuthorDoc | null> => {
    const { isEnabled: draft } = await draftMode()

    const payload = await getPayload({ config: configPromise })

    const result = (await payload.find({
      collection: 'authors',
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 1,
    })) as { docs: AuthorDoc[] }

    return result.docs?.[0] || null
  },
)

const queryArticlesByAuthor = cache(
  async ({ userId }: { userId: string | number }): Promise<ArticleDoc[]> => {
    const { isEnabled: draft } = await draftMode()

    const payload = await getPayload({ config: configPromise })

    const result = (await payload.find({
      collection: 'articles',
      draft,
      limit: 1000,
      overrideAccess: draft,
      pagination: false,
      where: {
        authors: {
          equals: userId,
        },
      },
      depth: 2,
    })) as { docs: ArticleDoc[] }

    return result.docs || []
  },
)

const queryVolumesForArticles = cache(
  async ({ articleIds }: { articleIds: (string | number)[] }): Promise<VolumeDoc[]> => {
    if (!articleIds.length) return []

    const { isEnabled: draft } = await draftMode()

    const payload = await getPayload({ config: configPromise })

    const result = (await payload.find({
      collection: 'volumes',
      draft,
      limit: 1000,
      overrideAccess: draft,
      pagination: false,
      where: {
        articles: {
          in: articleIds,
        },
      },
      depth: 0,
    })) as { docs: VolumeDoc[] }

    return result.docs || []
  },
)

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const author = await queryAuthorBySlug({ slug })

  const name = author?.name || 'Author'
  const title = `${name} — Pragmatic Papers`

  const description =
    (typeof author?.biography === 'string' && author.biography) ||
    (author?.affiliation ? `${name} — ${author.affiliation}` : undefined)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/authors/${slug}`,
    },
  }
}

export default async function AuthorPage({
  params: paramsPromise,
}: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/authors/' + slug
  const author = await queryAuthorBySlug({ slug })

  if (!author) return <PayloadRedirects url={url} />

  const userField = author.user
  const userId =
    typeof userField === 'object' && userField !== null
      ? userField.id
      : (userField as string | number | undefined)

  const articles = userId ? await queryArticlesByAuthor({ userId }) : []
  const articleIds = articles.map((article) => article.id).filter(Boolean)
  const volumes = await queryVolumesForArticles({ articleIds })

  const volumeByArticleId = new Map<number, VolumeDoc>()

  for (const volume of volumes) {
    const volumeArticles = volume.articles || []
    for (const articleRef of volumeArticles) {
      const articleId =
        typeof articleRef === 'object' && articleRef !== null
          ? articleRef.id
          : (articleRef as number | undefined)
      if (articleId != null && !volumeByArticleId.has(articleId)) {
        volumeByArticleId.set(articleId, volume)
      }
    }
  }

  const hasProfileImage = !!author.profileImage && typeof author.profileImage === 'object'
  const hasBiography = !!author.biography

  return (
    <article className="m-auto max-w-3xl px-4 pb-16 pt-8">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <header className="mb-10 flex flex-col items-center text-center">
        {hasProfileImage && (
          <div className="mb-6 h-32 w-32 overflow-hidden rounded-full border border-border">
            <Media
              resource={author.profileImage as MediaType}
              className="h-full w-full"
              imgClassName="h-full w-full object-cover"
              size="square"
            />
          </div>
        )}
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">{author.name}</h1>
        {author.affiliation && (
          <p className="text-sm text-muted-foreground">{author.affiliation}</p>
        )}

        {author.socialLinks && author.socialLinks.length > 0 && (
          <nav
            aria-label="Author social links"
            className="mt-4 flex flex-wrap justify-center gap-3"
          >
            {author.socialLinks.map((link) => (
              <a
                key={link.id ?? link.url}
                href={normalizeExternalUrl(link.url)}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-brand underline-offset-2 hover:underline"
              >
                {link.label || link.url}
              </a>
            ))}
          </nav>
        )}
      </header>

      {hasBiography && (
        <section className="mb-10" aria-label="Author biography">
          <RichText
            enableGutter={false}
            data={author.biography as ArticleType['content']}
          />
        </section>
      )}

      <section aria-label="Articles by this author">
        <h2 className="mb-4 text-2xl font-semibold">Articles</h2>
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No articles found for this author yet.</p>
        ) : (
          <div className="-mx-4 overflow-x-auto pb-2">
            <div className="flex gap-4 px-4">
              {articles.map((article) => {
                const volumeForArticle = volumeByArticleId.get(article.id)
                const volumeHref = volumeForArticle?.slug
                  ? `/volumes/${volumeForArticle.slug}`
                  : undefined

                return (
                  <div
                    key={article.id}
                    className="min-w-[260px] max-w-xs flex-1 rounded-lg border bg-card"
                  >
                    <ArticleCard
                      doc={article as CardPostData}
                      relationTo="articles"
                      className="h-full"
                    />
                    {volumeForArticle && volumeHref && (
                      <p className="px-4 pb-3 text-xs text-muted-foreground">
                        Volume{' '}
                        <a href={volumeHref} className="underline-offset-2 hover:underline">
                          {volumeForArticle.title ?? volumeForArticle.slug}
                        </a>
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </article>
  )
}
