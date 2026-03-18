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
  const { publishedAt, title, heroImage, authors } = article

  const filteredAuthors = (authors || []).filter((author) => typeof author === "object")

  return (
    <div className="relative flex flex-col gap-2">
      {heroImage && (
        <div className="min-h-56 md:-mx-8 lg:-mx-16 xl:-mx-32">
          <Media
            priority
            sizes="(max-width: 768px) 100vw, 1024px"
            media={heroImage}
            variant="large"
            className="border shadow"
          />
        </div>
      )}
      <h1 className="font-display mt-8 text-4xl font-bold sm:text-6xl">{title}</h1>
      {filteredAuthors.length > 0 && (
        <div className="text-lg">
          <p>
            by{" "}
            {filteredAuthors.map(({ id, slug, name }, index) => (
              <React.Fragment key={id}>
                {getSeparator(index, filteredAuthors.length)}
                <HoverPrefetchLink
                  href={`/authors/${slug}`}
                  className="underline-offset-2 hover:underline"
                >
                  {name}
                </HoverPrefetchLink>
              </React.Fragment>
            ))}
          </p>
        </div>
      )}
      {publishedAt && (
        <HoverPrefetchLink
          href={`/articles/${article.slug}`}
          className="dark:text-brand-high-contrast text-brand font-serif font-bold underline-offset-4 hover:underline"
        >
          <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
        </HoverPrefetchLink>
      )}
      <Separator className="my-4" />
    </div>
  )
}
