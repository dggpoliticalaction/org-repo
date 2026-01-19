import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { ResourceCategory, Media as MediaType } from '@/payload-types'

import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Media } from '@/components/Media'
import Link from 'next/link'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const resources = await payload.find({
    collection: 'resources',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = resources.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Args = {
  params: Promise<{
    slug?: string
  }>
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function ResourcePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/resources/' + slug
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const resource = await queryResourceBySlug({ slug })

  if (!resource) return <PayloadRedirects url={url} />

  const { title, description, resourceType, file, image, videoUrl, externalUrl, resourceCategories } = resource

  return (
    <article className="pt-24 pb-24">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {resourceType === 'document' && 'Document'}
                {resourceType === 'image' && 'Image'}
                {resourceType === 'video' && 'Video'}
                {resourceType === 'link' && 'External Link'}
              </span>
              {resourceCategories && Array.isArray(resourceCategories) && resourceCategories.length > 0 && (
                <div className="flex gap-2">
                  {resourceCategories.map((cat, index) => {
                    if (typeof cat === 'object') {
                      return (
                        <span
                          key={index}
                          className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {(cat as ResourceCategory).title}
                        </span>
                      )
                    }
                    return null
                  })}
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            {description && (
              <p className="text-lg text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Content based on resource type */}
          <div className="mb-8">
            {resourceType === 'document' && file && typeof file !== 'number' && (
              <div className="border border-border rounded-lg p-8 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📄</div>
                    <div>
                      <p className="font-medium">{(file as MediaType).filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file as MediaType).mimeType}
                      </p>
                    </div>
                  </div>
                  <a
                    href={(file as MediaType).url || ''}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Download
                  </a>
                </div>
              </div>
            )}

            {resourceType === 'image' && image && typeof image !== 'number' && (
              <div className="rounded-lg overflow-hidden">
                <Media resource={image as MediaType} />
                <div className="mt-4 flex justify-end">
                  <a
                    href={(image as MediaType).url || ''}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Download Full Size
                  </a>
                </div>
              </div>
            )}

            {resourceType === 'video' && videoUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={getYoutubeEmbedUrl(videoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : videoUrl.includes('vimeo.com') ? (
                  <iframe
                    src={getVimeoEmbedUrl(videoUrl)}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline"
                    >
                      Watch Video
                    </a>
                  </div>
                )}
              </div>
            )}

            {resourceType === 'link' && externalUrl && (
              <div className="border border-border rounded-lg p-8 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🔗</div>
                    <div>
                      <p className="font-medium">External Resource</p>
                      <p className="text-sm text-muted-foreground break-all">{externalUrl}</p>
                    </div>
                  </div>
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Visit Link
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Back link */}
          <div className="pt-8 border-t border-border">
            <Link
              href="/resources"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Resources
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function getYoutubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = match && match[2] && match[2].length === 11 ? match[2] : null
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}

function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/
  const match = url.match(regExp)
  const videoId = match ? match[1] : null
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const resource = await queryResourceBySlug({ slug })

  return generateMeta({ doc: resource })
}

const queryResourceBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'resources',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
