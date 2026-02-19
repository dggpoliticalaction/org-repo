'use client'

import React from 'react'
import Link from 'next/link'

import type { Article, Volume } from '@/payload-types'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import { Media } from '@/components/Media'
import { Card, CardContent } from '@/components/ui/card'

export type AuthorArticleCardData = Pick<Article, 'slug' | 'meta' | 'title'>

export interface AuthorArticleCardProps {
  article: AuthorArticleCardData
  volume?: Pick<Volume, 'slug' | 'title'> | null
  className?: string
}

export const AuthorArticleCard: React.FC<AuthorArticleCardProps> = ({
  article,
  volume,
  className,
}) => {
  const { card, link } = useClickableCard<HTMLDivElement>({})

  const { slug, meta, title } = article
  const { description, image: metaImage } = meta || {}

  const href = `/articles/${slug}`
  const sanitizedDescription = description?.replace(/\s/g, ' ')

  return (
    <Card className={cn('h-full', className)}>
      <CardContent ref={card.ref} className="flex flex-row gap-4 p-6 sm:flex-row">
        <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded border border-border bg-muted sm:h-28 sm:w-40">
          {metaImage && typeof metaImage !== 'string' && (
            <Media
              resource={metaImage}
              className="h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex h-24 min-w-0 flex-1 flex-col justify-between space-y-1 overflow-hidden sm:h-28">
          <div className="min-h-0 space-y-1">
            {title && (
              <h3 className="line-clamp-3 font-semibold text-foreground">
                <Link href={href} ref={link.ref} className="transition-colors hover:text-brand">
                  {title}
                </Link>
              </h3>
            )}
            {sanitizedDescription && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{sanitizedDescription}</p>
            )}
          </div>
          {volume && (
            <p className="pt-1 text-xs text-muted-foreground">
              <Link href={`/volumes/${volume.slug}`} className="underline-offset-2 hover:underline">
                {volume.title ?? volume.slug}
              </Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
