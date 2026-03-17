import { AuthorArticleCard } from "@/components/Articles/AuthorArticleCard"
import { AuthorLinks } from "@/components/Authors/AuthorLinks"
import { LivePreviewListener } from "@/components/LivePreviewListener"
import { Media } from "@/components/Media"
import { PageRange } from "@/components/PageRange"
import { Pagination } from "@/components/Pagination"
import { PayloadRedirects } from "@/components/PayloadRedirects"
import RichText from "@/components/RichText"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Article as ArticleType, User, Volume } from "@/payload-types"
import { getInitials } from "@/utilities/getInitials"
import config from "@payload-config"
import type { Metadata } from "next"
import { draftMode } from "next/headers"
import { getPayload } from "payload"
import React, { cache } from "react"

export async function generateStaticParams(): Promise<{ slug: string | null | undefined }[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "users",
    draft: false,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          role: {
            in: ["writer", "editor", "chief-editor"],
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
    slug: string
  }>
  searchParams: Promise<{
    p?: string
  }>
}

const queryUserBySlug = cache(async (slug: string): Promise<User | null> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: "users",
    draft,
    limit: 1,
    pagination: false,
    where: {
      and: [
        {
          role: {
            in: ["writer", "editor", "chief-editor"],
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

const ARTICLES_PER_PAGE = 5
const queryArticlesByAuthor = cache(async (userId: number, page: number = 1) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config })

  return payload.find({
    collection: "articles",
    draft,
    limit: ARTICLES_PER_PAGE,
    page,
    where: {
      authors: {
        equals: userId,
      },
    },
    depth: 2,
  })
})

const queryVolumesForArticles = cache(async (articleIds: number[]): Promise<Volume[]> => {
  if (!articleIds.length) return []

  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: "volumes",
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
  const { slug } = await params
  const user = await queryUserBySlug(slug)

  const name = user?.name || "Author"
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

export default async function AuthorPage({ params, searchParams }: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = "" } = await params
  const { p } = await searchParams
  let page = Number(p) || 1
  if (!Number.isInteger(page) || page < 1) page = 1

  const user = await queryUserBySlug(slug)
  const url = `/authors/${slug}`
  if (!user) return <PayloadRedirects url={url} />

  const {
    docs: articles,
    totalDocs,
    totalPages,
    page: currentPage,
  } = await queryArticlesByAuthor(user.id, page)
  const articleIds = articles.map((article) => article.id).filter(Boolean)
  const volumes = await queryVolumesForArticles(articleIds)

  const volumeByArticleId = new Map<number, Volume>()

  for (const volume of volumes) {
    const volumeArticles = volume.articles || []
    for (const articleRef of volumeArticles) {
      const articleId =
        typeof articleRef === "object" && articleRef !== null
          ? articleRef.id
          : (articleRef as number | undefined)
      if (articleId != null && !volumeByArticleId.has(articleId)) {
        volumeByArticleId.set(articleId, volume)
      }
    }
  }

  const hasBiography = !!user.biography

  const profile = user.profileImage

  const initials = getInitials(user.name || "Author")
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <header className="flex flex-col items-center space-y-3 text-center">
        {profile && (
          <Avatar className="aspect-square h-full w-32 hover:opacity-80">
            <AvatarImage
              render={
                <Media
                  media={profile}
                  variant="square"
                  sizes="128px"
                  className="h-32 w-32 rounded-full border border-border"
                  priority
                />
              }
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        )}
        <h1 className="text-3xl font-bold md:text-4xl">{user.name || "Author"}</h1>
        {user.affiliation && <p className="text-sm text-muted-foreground">{user.affiliation}</p>}
        <AuthorLinks socials={user.socials} />
      </header>

      {hasBiography && (
        <section className="mb-10" aria-label="Author biography">
          <h2 className="mb-3 text-2xl font-semibold">Bio</h2>
          <RichText enableGutter={false} data={user.biography as ArticleType["content"]} />
        </section>
      )}

      <section aria-label="Articles by this author">
        <h2 className="mb-4 text-2xl font-semibold">Articles</h2>
        {totalDocs === 0 ? (
          <p className="text-sm text-muted-foreground">Look out for this author's debut!</p>
        ) : (
          <>
            <PageRange
              collection="articles"
              currentPage={currentPage}
              limit={ARTICLES_PER_PAGE}
              totalDocs={totalDocs}
            />
            <div className="mt-4 flex flex-col gap-4">
              {articles.map((article) => {
                const volume = volumeByArticleId.get(article.id)
                return <AuthorArticleCard key={article.id} article={article} volume={volume} />
              })}
            </div>
            {totalPages > 1 && currentPage && (
              <Pagination page={currentPage} totalPages={totalPages} />
            )}
          </>
        )}
      </section>
    </article>
  )
}
