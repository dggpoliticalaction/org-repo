import Link from 'next/link'
import { getPayload } from 'payload'
import React, { type ReactNode } from 'react'
import configPromise from '@payload-config'
import { ArticleCard } from '../ArticleCard'
import { draftMode } from 'next/headers'

async function RecentArticles(props: { authorId: number }): Promise<ReactNode> {
  const payload = await getPayload({ config: configPromise })
  const { isEnabled: draft } = await draftMode()

  const articles = await payload.find({
    collection: 'articles',
    limit: 10,
    draft,
    overrideAccess: draft,
    pagination: false,
    // sort: { createdAt: -1 },
    where: {
      created_by_id: {
        equals: props.authorId,
      },
    },
  })

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {articles.docs.map((article) => (
          <ArticleCard key={article.id} doc={article} relationTo="articles" />
        ))}
      </div>
    </div>
  )
}

interface AuthorArgs {
  id: number
  name?: string | null | undefined
  role?: ('admin' | 'chief-editor' | 'editor' | 'writer' | 'user') | null | undefined
  email: string
  socialTwitter?: string | null | undefined
  socialReddit?: string | null | undefined
  socialInstagram?: string | null | undefined
  socialTiktok?: string | null | undefined
  socialYoutube?: string | null | undefined
}

export default async function Author(props: AuthorArgs): Promise<ReactNode> {
  const socials = [
    props.socialTwitter && <a href={props.socialTwitter}>Twitter</a>,
    props.socialReddit && <a href={props.socialReddit}>Reddit</a>,
    props.socialInstagram && <a href={props.socialInstagram}>Instagram</a>,
    props.socialTiktok && <a href={props.socialTiktok}>TikTok</a>,
    props.socialYoutube && <a href={props.socialYoutube}>YouTube</a>,
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="p-4 gap-2 border border-border">
        {/* Avatar */}
        <h1>{props.name}</h1>
      </div>
      <div>
        <p>{props.role}</p>
        <a href={`mailto:${props.email}`}>{props.email}</a>
      </div>
      <div>
        {socials.map((social, index) => (
          <Link href="https://example.com" key={index}>
            {social}
          </Link>
        ))}
      </div>
      <RecentArticles authorId={props.id} />
    </div>
  )
}
