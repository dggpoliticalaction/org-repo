import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import Image from 'next/image'

import type { Article as ArticleType, Media, User, Volume } from '@/payload-types'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { AuthorArticleCard } from '@/components/Articles/AuthorArticleCard'
import { authorSlugFromUser } from '@/utilities/authorSlug'

interface UserSocialLinkEntry {
  id?: string | null
  link?: {
    id?: string | null
    type?: 'reference' | 'custom' | null
    url?: string | null
    label?: string | null
  } | null
}

function normalizeExternalUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (typeof URL !== 'undefined' && URL.canParse?.(trimmed)) {
    return trimmed
  }
  const prefixed = `https://${trimmed.replace(/^\/+/, '')}`
  if (typeof URL !== 'undefined' && URL.canParse?.(prefixed)) {
    return prefixed
  }

  // As a final fallback in non-supporting environments, return the raw value
  return trimmed
}

export async function generateStaticParams(): Promise<{ slug: string | null | undefined }[]> {
  const payload = await getPayload({ config: configPromise })
  const users = await payload.find({
    collection: 'users',
    draft: false,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      role: {
        in: ['writer', 'editor', 'chief-editor'],
      },
    },
  })

  const docs = (users.docs as User[]) || []

  const params = docs
    .filter((user) => {
      // Admin accounts are never exposed as authors; writers always get a page,
      // and editors/chief-editors require an explicit authorSlug.
      if (user.role === 'writer') return true
      return Boolean(user.authorSlug)
    })
    .map((user) => {
      const slug = user.authorSlug || authorSlugFromUser(user)
      return { slug }
    })

  return params
}

interface Args {
  params: Promise<{
    slug?: string
  }>
}

const queryUserBySlug = cache(async ({ slug }: { slug: string }): Promise<User | null> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = (await payload.find({
    collection: 'users',
    draft,
    limit: 1,
    pagination: false,
    where: {
      and: [
        {
          role: {
            in: ['writer', 'editor', 'chief-editor'],
          },
        },
        {
          authorSlug: {
            equals: slug,
          },
        },
      ],
    },
    depth: 1,
  })) as { docs: User[] }

  // Fallback in case older users are missing authorSlug
  const match =
    result.docs[0] || result.docs.find((user) => authorSlugFromUser(user) === slug) || null

  return match
})

const queryArticlesByAuthor = cache(
  async ({ userId }: { userId: string | number }): Promise<ArticleType[]> => {
    const { isEnabled: draft } = await draftMode()

    const payload = await getPayload({ config: configPromise })

    const result = (await payload.find({
      collection: 'articles',
      draft,
      limit: 1000,
      pagination: false,
      where: {
        authors: {
          equals: userId,
        },
      },
      depth: 2,
    })) as { docs: ArticleType[] }

    return result.docs || []
  },
)

const queryVolumesForArticles = cache(
  async ({ articleIds }: { articleIds: (string | number)[] }): Promise<Volume[]> => {
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
    })) as { docs: Volume[] }

    return result.docs || []
  },
)

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const user = await queryUserBySlug({ slug })

  const name = user?.name || 'Author'
  const title = `${name} — Pragmatic Papers`

  const description = (typeof user?.biography === 'string' && user.biography) || undefined

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
  const user = await queryUserBySlug({ slug })

  if (!user) return <PayloadRedirects url={url} />

  const articles = await queryArticlesByAuthor({ userId: user.id })
  const articleIds = articles.map((article) => article.id).filter(Boolean)
  const volumes = await queryVolumesForArticles({ articleIds })

  const volumeByArticleId = new Map<number, Volume>()

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

  const hasBiography = !!user.biography

  const profile = user.profileImage
  const profileDoc = profile && typeof profile === 'object' ? (profile as Media) : undefined
  const profileSrc = profileDoc?.sizes?.square?.url || profileDoc?.url || undefined

  return (
    <article className="m-auto max-w-3xl px-4 pb-16 pt-8">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <header className="mb-10 flex flex-col items-center text-center">
        {profileSrc && (
          <div className="mb-6 h-32 w-32 overflow-hidden rounded-full border border-border">
            <Image
              src={profileSrc}
              alt={profileDoc?.alt || user.name || 'Author avatar'}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">{user.name || 'Author'}</h1>
        {user.affiliation && <p className="text-sm text-muted-foreground">{user.affiliation}</p>}

        {user.socialLinks && user.socialLinks.length > 0 && (
          <nav
            aria-label="Author social links"
            className="mt-4 flex flex-wrap justify-center gap-3"
          >
            {user.socialLinks.map((item) => {
              const entry = item as unknown as UserSocialLinkEntry
              const linkGroup = entry.link ?? undefined

              if (!linkGroup) return null

              const normalized =
                linkGroup.type === 'custom' && linkGroup.url
                  ? normalizeExternalUrl(linkGroup.url)
                  : null

              if (!normalized) return null

              const label = linkGroup.label || linkGroup.url || normalized

              return (
                <a
                  key={linkGroup.id ?? linkGroup.url ?? normalized}
                  href={normalized}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-brand underline-offset-2 hover:underline"
                  aria-label={label ? `${label} (opens in a new tab)` : 'External author link'}
                >
                  {label}
                </a>
              )
            })}
          </nav>
        )}
      </header>

      {hasBiography && (
        <section className="mb-10" aria-label="Author biography">
          <h2 className="mb-3 text-xl font-semibold">Bio</h2>
          <RichText enableGutter={false} data={user.biography as ArticleType['content']} />
        </section>
      )}

      <section aria-label="Articles by this author">
        <h2 className="mb-4 text-2xl font-semibold">Articles</h2>
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No articles found for this author yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => {
              const volumeForArticle = volumeByArticleId.get(article.id)

              return (
                <AuthorArticleCard
                  key={article.id}
                  article={article}
                  volume={
                    volumeForArticle
                      ? { slug: volumeForArticle.slug, title: volumeForArticle.title }
                      : null
                  }
                />
              )
            })}
          </div>
        )}
      </section>
    </article>
  )
}
