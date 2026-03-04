import { AuthorArticleCard } from '@/components/Articles/AuthorArticleCard'
import { AuthorLinks } from '@/components/Authors/AuthorLinks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import type { Article as ArticleType, Media, User, Volume } from '@/payload-types'
import config from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { getPayload } from 'payload'
import React, { cache } from 'react'

export async function generateStaticParams(): Promise<{ slug: string | null | undefined }[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'users',
    draft: false,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          role: {
            in: ['writer', 'editor', 'chief-editor'],
          },
        },
        {
          slug: {
            not_equals: null,
          },
        },
      ],
    },
  })

  return docs.map(({ slug }) => ({ slug }))
}

interface Args {
  params: Promise<{
    slug?: string
  }>
}

const queryUserBySlug = cache(async (slug: string): Promise<User | null> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
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
          slug: {
            equals: slug,
          },
        },
      ],
    },
    depth: 1,
  })

  return docs[0] || null
})

const queryArticlesByAuthor = cache(async (userId: number): Promise<ArticleType[]> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
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
  })

  return docs
})

const queryVolumesForArticles = cache(async (articleIds: number[]): Promise<Volume[]> => {
  if (!articleIds.length) return []

  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
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
  })

  return docs
})

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = '' } = await params
  const user = await queryUserBySlug(slug)

  const name = user?.name || 'Author'
  const title = `${name} — Pragmatic Papers`

  const description = user?.affiliation || undefined

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
  const user = await queryUserBySlug(slug)
  const url = `/authors/${slug}`
  if (!user) return <PayloadRedirects url={url} />

  const articles = await queryArticlesByAuthor(user.id)
  const articleIds = articles.map((article) => article.id).filter(Boolean)
  const volumes = await queryVolumesForArticles(articleIds)

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
    <article className="container mb-16 max-w-3xl">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <header className="flex flex-col items-center space-y-3 text-center">
        {profileSrc && (
          <div className="h-32 w-32 overflow-hidden rounded-full border border-border">
            <Image
              src={profileSrc}
              alt={profileDoc?.alt || user.name || 'Author avatar'}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold md:text-4xl">{user.name || 'Author'}</h1>
        {user.affiliation && <p className="text-sm text-muted-foreground">{user.affiliation}</p>}
        <AuthorLinks socials={user.socials} />
      </header>

      {hasBiography && (
        <section className="mb-10" aria-label="Author biography">
          <h2 className="mb-3 text-2xl font-semibold">Bio</h2>
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
              const volume = volumeByArticleId.get(article.id)
              return <AuthorArticleCard key={article.id} article={article} volume={volume} />
            })}
          </div>
        )}
      </section>
    </article>
  )
}
