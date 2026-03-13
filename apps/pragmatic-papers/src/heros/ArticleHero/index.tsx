import Link from "next/link"
import React from "react"

import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { ImageMedia } from "@/components/Media/ImageMedia"
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
        <ImageMedia
          pictureClassName="object-cover aspect-video rounded-sm overflow-hidden min-h-[222px] md:min-h-[414px]"
          resource={heroImage}
        />
      )}
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      {filteredAuthors.length > 0 && (
        <div className="text-lg">
          <p>
            by{" "}
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
        <HoverPrefetchLink
          href={`/articles/${article.slug}`}
          className="text-brand font-serif font-bold underline-offset-4 hover:underline"
        >
          <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
        </HoverPrefetchLink>
      )}
      <Separator className="my-4" />
    </div>
  )
}
