import { ArticleCard } from "@/components/ArticleCard"
import { AuthorList } from "@/components/Authors/AuthorList"
import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { LivePreviewListener } from "@/components/LivePreviewListener"
import { PayloadRedirects } from "@/components/PayloadRedirects"
import RichText from "@/components/RichText"
import { Separator } from "@/components/ui/separator"
import type { Article } from "@/payload-types"
import { formatDateTime } from "@/utilities/formatDateTime"
import { generateMeta } from "@/utilities/generateMeta"
import { toRoman } from "@/utilities/toRoman"
import configPromise from "@payload-config"
import type { Metadata } from "next"
import { draftMode } from "next/headers"
import type { Payload } from "payload"
import { getPayload } from "payload"
import React, { cache } from "react"

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
  const { publishedAt, editorsNote } = volume

  const articles = volume.articles?.filter((a): a is Article => typeof a !== "number")

  const seen = new Set<string>()
  const volumeAuthors = articles
    ?.flatMap((article) => article.populatedAuthors ?? [])
    .filter((a) => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}
      <h1 className="font-display mb-6 text-3xl font-bold md:text-5xl lg:text-6xl">
        Volume <span className="font-serif font-semibold">{toRoman(Number(volume.slug))}</span>
      </h1>
      {publishedAt && (
        <HoverPrefetchLink
          href={`/volumes/${volume.slug}`}
          className="dark:text-brand-high-contrast text-brand font-serif font-semibold underline-offset-4 hover:underline"
        >
          <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
        </HoverPrefetchLink>
      )}
      {editorsNote && <RichText className="mt-6" enableGutter={false} data={editorsNote} />}
      <Separator />
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Articles in this Volume</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {articles?.map((article) => (
            <ArticleCard key={article.id} doc={article} relationTo="articles" />
          ))}
        </div>
      </section>
      <AuthorList aria-label="Volume Authors" authors={volumeAuthors} />
    </article>
  )
}
