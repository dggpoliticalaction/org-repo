import React from 'react'
import Link from 'next/link'

import type { Article, User } from '@/payload-types'
import { Squiggle } from '@/components/ui/squiggle'
import { formatDateTime } from '@/utilities/formatDateTime'
import { ImageMedia } from '@/components/Media/ImageMedia'
import { authorSlugFromUser } from '@/utilities/authorSlug'

interface ArticleHeroProps {
  article: Article
  authors?: User[]
}

export const ArticleHero: React.FC<ArticleHeroProps> = ({ article, authors }) => {
  const { publishedAt, title, heroImage } = article

  const authorList = (authors || []).filter((author) => Boolean(author && author.name))
  const hasAuthors = authorList.length > 0

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
        {hasAuthors && (
          <div className="text-center text-lg">
            <p>
              by{' '}
              {authorList.map((author, index) => {
                const slug = author.authorSlug || authorSlugFromUser(author)
                const href = `/authors/${slug}`
                const name = author.name || 'Author'

                let separator = ''
                if (index > 0 && index < authorList.length - 1) {
                  separator = ', '
                } else if (index === authorList.length - 1 && authorList.length > 1) {
                  separator = authorList.length === 2 ? ' and ' : ', and '
                }

                return (
                  <React.Fragment key={author.id}>
                    {index > 0 && separator}
                    <Link href={href} className="underline-offset-2 hover:underline">
                      {name}
                    </Link>
                  </React.Fragment>
                )
              })}
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
