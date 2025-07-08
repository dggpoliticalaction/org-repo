'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Article } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Article, 'slug' | 'meta' | 'title'>

export const ArticleCard: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo: 'articles'
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, title: titleFromProps } = props

  const { slug, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <div className="rounded-lg border border-border overflow-hidden h-full">
      <article
        className={cn('relative flex flex-col h-full hover:cursor-pointer', className)}
        ref={card.ref}
      >
        <div className="relative w-full max-h-[300px] aspect-[4/3] overflow-hidden">
          {metaImage && typeof metaImage !== 'string' && (
            <Media
              resource={metaImage}
              className="h-full w-full"
              imgClassName="object-cover h-full w-full"
              size="square"
            />
          )}
        </div>
        <div className="flex flex-col flex-grow p-4 bg-card">
          {titleToUse && (
            <div className="prose">
              <h3 className="line-clamp-4">
                <Link className="not-prose hover:underline" href={href} ref={link.ref}>
                  {titleToUse}
                </Link>
              </h3>
            </div>
          )}
          {description && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground line-clamp-5">{sanitizedDescription}</p>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
