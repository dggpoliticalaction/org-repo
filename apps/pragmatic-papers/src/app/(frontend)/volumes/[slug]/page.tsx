import { ArticleCard } from "@/components/ArticleCard"
import { AuthorList } from "@/components/Authors/AuthorList"
import { LivePreviewListener } from "@/components/LivePreviewListener"
import { PayloadRedirects } from "@/components/PayloadRedirects"
import RichText from "@/components/RichText"
import { Squiggle } from "@/components/ui/squiggle"
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
  const volumeAuthors = articles?.flatMap((article) => article.populatedAuthors ?? []).filter((a) => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })

  return (
    <article className="mx-auto max-w-3xl px-4">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}
      <div className="relative flex items-end">
        <div className="container pb-8 text-center">
          <div>
            <div>
              <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{`Volume ${toRoman(Number(volume.slug))}`}</h1>
            </div>

            <div className="flex flex-col justify-center gap-4 md:flex-row md:gap-16">
              {publishedAt && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm">Date Published</p>
                  <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {editorsNote && (
        <div className="container w-full">
          <RichText className="w-full" enableGutter={false} data={editorsNote} />
        </div>
      )}
      <Squiggle className="mx-auto h-6 w-1/2" />
      <section className="mt-10 space-y-4 border-t pt-8">
        <h2 className="font-display text-lg font-bold">Articles</h2>
        {articles ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard key={article.id} doc={article} relationTo="articles" />
            ))}
          </div>
        ) : (
          <p>No articles found.</p>
        )}
      </section>
      <AuthorList aria-label="Volume Authors" authors={volumeAuthors} />
    </article>
  )
}
