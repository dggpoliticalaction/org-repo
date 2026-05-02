import React from "react"

import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { Media } from "@/components/Media"
import { Separator } from "@/components/ui/separator"
import type { Article } from "@/payload-types"
import { formatDateTime } from "@/utilities/formatDateTime"

interface ArticleHeroProps {
  article: Article
}

export const ArticleHero: React.FC<ArticleHeroProps> = ({ article }) => {
  const { publishedAt, title, heroImage, populatedAuthors } = article

  return (
    <div className="relative flex flex-col gap-2 md:-mx-10 lg:-mx-32 xl:-mx-44">
      {heroImage && (
        <Media
          priority
          sizes="(max-width: 768px) 100vw, 1024px"
          media={heroImage}
          variant="large"
          className="min-h-56 border object-cover shadow sm:min-h-85 md:min-h-[418px] lg:min-h-[570px]"
        />
      )}
      <h1 className="mt-6">{title}</h1>
      <div className="dark:text-brand-high-contrast text-brand flex gap-2 font-serif font-bold underline-offset-4">
        {populatedAuthors &&
          populatedAuthors.map(({ id, slug, name }, index) => (
            <React.Fragment key={id}>
              {index > 0 && "•"}
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
      <Separator />
    </div>
  )
}
