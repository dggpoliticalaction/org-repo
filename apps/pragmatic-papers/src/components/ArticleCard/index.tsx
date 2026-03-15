import { cn } from "@/utilities/ui"
import Link from "next/link"
import React from "react"

import type { Article } from "@/payload-types"

import { Media } from "@/components/Media"

export type CardPostData = Pick<Article, "slug" | "meta" | "title">

export const ArticleCard: React.FC<{
  alignItems?: "center"
  className?: string
  doc?: CardPostData
  relationTo: "articles"
  title?: string
}> = (props) => {
  const { className, doc, relationTo, title: titleFromProps } = props

  const { slug, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, " ") // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <div className="relative h-full overflow-hidden rounded-lg">
      <article className={cn("flex h-full flex-row sm:flex-col", className)}>
        <div className="flex min-w-24 flex-shrink-0 basis-1/4 flex-col justify-center overflow-hidden rounded-lg sm:max-h-[300px] sm:min-w-0 sm:basis-auto">
          {metaImage && typeof metaImage !== "string" && (
            <div className="aspect-[4/3]">
              <Media resource={metaImage} imgClassName="h-full w-full object-cover" size="(max-width: 640px) 25vw, 50vw" />
            </div>
          )}
        </div>
        <div className="flex flex-grow basis-3/4 flex-col p-4 sm:basis-auto">
          {titleToUse && (
            <div className="line-clamp-4 pb-1 font-sans text-xl font-extrabold">
              <Link
                className="transition-colors after:absolute after:inset-0 hover:text-brand"
                href={href}
              >
                {titleToUse}
              </Link>
            </div>
          )}
          {description && (
            <p className="line-clamp-2 pt-1 text-sm text-muted-foreground sm:line-clamp-5">
              {sanitizedDescription}
            </p>
          )}
        </div>
      </article>
    </div>
  )
}
