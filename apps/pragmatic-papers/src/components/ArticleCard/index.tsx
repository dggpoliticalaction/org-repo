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
  const { card, link } = useClickableCard<HTMLDivElement>({})
  const { className, doc, relationTo, title: titleFromProps } = props

  const { slug, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <div className="rounded-lg overflow-hidden h-full">
      <article
        className={cn('flex flex-row sm:flex-col h-full hover:cursor-pointer', className)}
        ref={card.ref}
      >
        <div
          className="
          rounded-lg
          overflow-hidden
          flex
          flex-col
          justify-center
          flex-shrink-0
          basis-1/4
          min-w-24
          sm:basis-auto
          sm:min-w-0
          sm:max-h-[300px]
        "
        >
          {metaImage && typeof metaImage !== 'string' && (
            <Media
              resource={metaImage}
              className="aspect-[4/3] sm:aspect-square w-full"
              imgClassName="object-cover h-full w-full rounded-lg"
              size="square"
            />
          )}
        </div>
        <div className="flex flex-col p-4 flex-grow basis-3/4 sm:basis-auto">
          {titleToUse && (
            <div className="font-sans font-extrabold text-xl pb-1 line-clamp-4">
              <Link className="hover:text-brand transition-colors" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground pt-1 line-clamp-2 sm:line-clamp-5">
              {sanitizedDescription}
            </p>
          )}
        </div>
      </article>
    </div>
  )
}
