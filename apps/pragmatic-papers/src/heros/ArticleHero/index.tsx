import Link from 'next/link'
import React from 'react'

import { ImageMedia } from '@/components/Media/ImageMedia'
import { Squiggle } from '@/components/ui/squiggle'
import type { Article } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import { getSeparator } from '@/utilities/getSeparator'

interface ArticleHeroProps {
  article: Article
}

export const ArticleHero: React.FC<ArticleHeroProps> = ({ article }) => {
  const { publishedAt, title, heroImage, authors } = article

  const filteredAuthors = (authors || []).filter((author) => typeof author === 'object')

  return (
    <div className="relative flex-col">
      {heroImage && (
        <ImageMedia
          pictureClassName="object-cover w-full h-full"
          imgClassName="pb-4"
          resource={heroImage}
        />
      )}
      <div className="relative z-10 flex-col pb-4 dark:text-white">
        <h1 className="mb-6 text-center text-4xl font-bold">{title}</h1>
        {filteredAuthors.length > 0 && (
          <div className="text-center text-lg">
            <p>
              by{' '}
              {filteredAuthors.map(({ id, slug, name }, index) => (
                <React.Fragment key={id}>
                  {getSeparator(index, filteredAuthors.length)}
                  <Link href={`/authors/${slug}`} className="underline-offset-2 hover:underline">
                    {name}
                  </Link>
                </React.Fragment>
              ))}
            </p>
          </div>
        )}
        {publishedAt && (
          <div className="text-center text-sm italic">
            <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
          </div>
        )}
        <Squiggle className="mx-auto h-6 max-w-xs" />
      </div>
    </div>
  )
}
