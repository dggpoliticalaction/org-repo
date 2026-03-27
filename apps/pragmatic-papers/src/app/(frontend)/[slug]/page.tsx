import type { Metadata } from "next"

import { PayloadRedirects } from "@/components/PayloadRedirects"
import { homeStatic } from "@/endpoints/seed/home-static"
import configPromise from "@payload-config"
import { draftMode } from "next/headers"
import { getPayload, type RequiredDataFromCollectionSlug } from "payload"
import { cache, Suspense } from "react"

import { RenderBlocks } from "@/blocks/RenderBlocks"
import { JsonLd } from "@/components/JsonLd"
import { LivePreviewListener } from "@/components/LivePreviewListener"
import { RenderHero } from "@/heros/RenderHero"
import { generateMeta } from "@/utilities/generateMeta"
import { getServerSideURL } from "@/utilities/getURL"
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/utilities/structuredData"

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: "pages",
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== "home"
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "pages",
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = "home" } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
  })

  const canonicalPath = slug === "home" ? "/" : `/${slug}`
  return generateMeta({ doc: page, canonicalPath })
}

interface Args {
  params: Promise<{
    slug?: string
  }>
  searchParams: Promise<{
    p?: string
  }>
}

export default async function Page({ params, searchParams }: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = "home" } = await params
  const { p: pageString } = await searchParams
  const pageNumber = pageString ? Math.max(Number(pageString) || 1, 1) : undefined
  const url = `/${slug}${pageNumber ? `?p=${pageNumber}` : ""}`
  let page: RequiredDataFromCollectionSlug<"pages"> | null = await queryPageBySlug({
    slug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === "home") {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  const serverUrl = getServerSideURL()
  const isHome = slug === "home"
  const breadcrumbItems = isHome
    ? [{ name: "Home", url: serverUrl }]
    : [
        { name: "Home", url: serverUrl },
        { name: page.meta?.title || slug, url: `${serverUrl}/${slug}` },
      ]
  const jsonLdData = isHome
    ? [buildWebSiteJsonLd(), buildOrganizationJsonLd(), buildBreadcrumbJsonLd(breadcrumbItems)]
    : [buildBreadcrumbJsonLd(breadcrumbItems)]
  return (
    <article>
      <JsonLd data={jsonLdData} />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />

      <Suspense key={url}>
        <RenderBlocks blocks={layout} pageNumber={pageNumber} />
      </Suspense>
    </article>
  )
}
