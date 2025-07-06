import React from 'react'

import type { Post } from '@/payload-types'
import { Squiggle } from '@/components/ui/squiggle'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateTime } from '@/utilities/formatDateTime'
import { ImageMedia } from '@/components/Media/ImageMedia'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { populatedAuthors, publishedAt, title, heroImage } = post

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
      <div className="container z-10 relative pb-4 flex-col dark:text-white">
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
        <Squiggle className="w-1/2 h-6 mx-auto" />
      </div>
    </div>
  )
}
