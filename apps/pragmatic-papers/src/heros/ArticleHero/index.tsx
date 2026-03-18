import React from "react"

import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { Media } from "@/components/Media"
import { Separator } from "@/components/ui/separator"
import type { Article } from "@/payload-types"
import { formatDateTime } from "@/utilities/formatDateTime"
import { getSeparator } from "@/utilities/getSeparator"

interface ArticleHeroProps {
  article: Article
}

export const ArticleHero: React.FC<ArticleHeroProps> = ({ article }) => {
  const { publishedAt, title, heroImage, populatedAuthors } = article

  return (
    <div className="relative flex flex-col gap-2">
      {heroImage && (
        <div className="-mx-5 min-h-56 md:-mx-8 lg:-mx-16 xl:-mx-32">
          <Media
            priority
            sizes="(max-width: 768px) 100vw, 1024px"
            media={heroImage}
            variant="large"
            className="border shadow"
          />
        </div>
      )}
      <h1 className="mt-8 text-3xl font-bold sm:text-4xl">{title}</h1>
      <div className="dark:text-brand-high-contrast text-brand flex gap-2 font-serif font-bold underline-offset-4">
        {populatedAuthors &&
          populatedAuthors.map(({ id, slug, name }, index) => (
            <React.Fragment key={id}>
              {getSeparator(index, populatedAuthors.length)}
              <HoverPrefetchLink href={`/authors/${slug}`} className="hover:underline">
                {name}
              </HoverPrefetchLink>
            </React.Fragment>
          ))}
        {"•"}
        {publishedAt && (
          <HoverPrefetchLink href={`/articles/${article.slug}`} className="hover:underline">
            <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
          </HoverPrefetchLink>
        )}
      </div>
      <Separator className="my-4" />
    </div>
  )
}
