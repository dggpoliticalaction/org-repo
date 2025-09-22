import React from 'react'

import type { Article } from '@/payload-types'
import { Squiggle } from '@/components/ui/squiggle'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateTime } from '@/utilities/formatDateTime'
import { ImageMedia } from '@/components/Media/ImageMedia'

export const ArticleHero: React.FC<{
  article: Article
}> = ({ article }) => {
  const { populatedAuthors, publishedAt, title, heroImage } = article

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  return (
    <div className="relative flex-col">
      {heroImage && (
        <ImageMedia
          pictureClassName="object-cover w-full h-full"
          imgClassName="pb-4"
          resource={heroImage}
        />
      )}
      <div className="z-10 relative pb-4 flex-col dark:text-white">
        <h1 className="mb-6 text-4xl text-center font-bold">{title}</h1>
        {hasAuthors && (
          <div className="text-center text-lg">
            <p>by {formatAuthors(populatedAuthors)}</p>
          </div>
        )}
        {publishedAt && (
          <div className="text-sm text-center italic">
            <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
          </div>
        )}
        <Squiggle className="mx-auto max-w-xs" />
      </div>
    </div>
  )
}
