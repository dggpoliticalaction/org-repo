import { ArticleCard } from "@/components/ArticleCard"
import { AuthorList } from "@/components/Authors/AuthorList"
import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { LivePreviewListener } from "@/components/LivePreviewListener"
import { PayloadRedirects } from "@/components/PayloadRedirects"
import RichText from "@/components/RichText"
import { Separator } from "@/components/ui/separator"
import type { Article, User } from "@/payload-types"
import { formatDateTime } from "@/utilities/formatDateTime"
import { generateMeta } from "@/utilities/generateMeta"
import { toRoman } from "@/utilities/toRoman"
import configPromise from "@payload-config"
import type { Metadata } from "next"
import { draftMode } from "next/headers"
import type { Payload } from "payload"
import { getPayload } from "payload"
import React, { cache } from "react"

type VolumeArticleRef = number | Article

export async function generateStaticParams(): Promise<{ slug: string | null | undefined }[]> {
  const payload = await getPayload({ config: configPromise })
  const volumes = await payload.find({
    collection: "volumes",
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = volumes.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

interface Args {
  params: Promise<{
    slug?: string
  }>
}

const queryVolumeBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload: Payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "volumes",
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 2,
  })

  return result.docs?.[0] || null
})

const queryAuthorsByIds = cache(async ({ ids }: { ids: (string | number)[] }): Promise<User[]> => {
  const numericIds = ids
    .map((id) => (typeof id === "string" ? Number(id) : id))
    .filter((id): id is number => typeof id === "number" && !Number.isNaN(id))

  if (!numericIds.length) return []

  const payload = await getPayload({ config: configPromise })

  const result = (await payload.find({
    collection: "users",
    limit: numericIds.length,
    pagination: false,
    where: {
      id: {
        in: numericIds,
      },
    },
    depth: 1,
  })) as { docs: User[] }

  return result.docs || []
})

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = "" } = await paramsPromise
  const volume = await queryVolumeBySlug({ slug })

  return generateMeta({ doc: volume })
}

export default async function VolumePage({
  params: paramsPromise,
}: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = "" } = await paramsPromise
  const url = "/volumes/" + slug
  const volume = await queryVolumeBySlug({ slug })

  if (!volume) return <PayloadRedirects url={url} />
  const { publishedAt, editorsNote, articles } = volume
  if (
    articles?.filter((article: VolumeArticleRef) => typeof article === "number")?.length ??
    0 > 0
  ) {
    console.error("Fetching volume with unfetched articles", slug)
  }
  const actualArticles = articles?.filter(
    (article: VolumeArticleRef): article is Article => typeof article !== "number",
  )
  const volumeAuthorIdSet = new Set<string | number>()
  actualArticles?.forEach((article) => {
    const populated = article.populatedAuthors || []
    populated.forEach((author) => {
      if (!author?.id) return
      volumeAuthorIdSet.add(author.id)
    })
  })

  const volumeAuthors = await queryAuthorsByIds({ ids: Array.from(volumeAuthorIdSet) })

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}
      <h1 className="font-display mb-6 text-center text-3xl font-bold md:text-5xl lg:text-6xl">
        Volume <span className="font-serif font-semibold">{toRoman(Number(volume.slug))}</span>
      </h1>
      {publishedAt && (
        <HoverPrefetchLink
          href={`/volumes/${volume.slug}`}
          className="text-brand dark:text-brand-high-contrast font-serif font-semibold underline-offset-4 hover:underline"
        >
          <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
        </HoverPrefetchLink>
      )}
      {editorsNote && <RichText enableGutter={false} data={editorsNote} />}
      <Separator />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {actualArticles?.map((article) => (
          <ArticleCard key={article.id} doc={article} relationTo="articles" />
        ))}
      </div>
      <AuthorList aria-label="Volume Authors" authors={volumeAuthors} />
    </article>
  )
}
