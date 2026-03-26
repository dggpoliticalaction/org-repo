import { LivePreviewListener } from "@/components/LivePreviewListener"
import { PayloadRedirects } from "@/components/PayloadRedirects"
import { generateMeta } from "@/utilities/generateMeta"
import config from "@payload-config"
import type { Metadata } from "next"
import { draftMode } from "next/headers"
import { getPayload } from "payload"
import React from "react"

import { queryTopicBySlug } from "./queries"

interface Args {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateStaticParams(): Promise<{ slug: string | null | undefined }[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "topics",
    draft: false,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: { slug: { not_equals: null } },
  })
  return docs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug = "" } = await params
  const topic = await queryTopicBySlug(slug)
  return generateMeta({ doc: topic, canonicalPath: `/topics/${slug}` })
}

export default async function TopicLayout({ params, children }: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = "" } = await params
  const url = `/topics/${slug}`
  const topic = await queryTopicBySlug(slug)

  if (!topic) return <PayloadRedirects url={url} />

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4">
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <header className="space-y-3">
        <h1>Topic: {topic.name}</h1>
        {topic.description && (
          <p className="text-muted-foreground text-sm">{topic.description}</p>
        )}
      </header>

      <section aria-label="Articles for this topic">
        <h2 className="mb-3">Articles</h2>
        {children}
      </section>
    </article>
  )
}
