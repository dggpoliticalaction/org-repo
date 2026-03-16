import React from "react"

import type { Article } from "@/payload-types"

import { Media } from "@/components/Media"
import { cn } from "@/utilities/ui"
import { HoverPrefetchLink } from "../Link/HoverPrefetchLink"

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
  const { description, image } = meta || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, " ") // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <HoverPrefetchLink href={href} className="block">
      <div className={cn("space-y-3", className)}>
        {image && typeof image !== "string" && (
          <Media
            media={image}
            variant="square"
            className="aspect-[4/3]"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 352px"
          />
        )}
        {titleToUse && (
          <h3 className="font-display line-clamp-4 text-lg font-bold">{titleToUse}</h3>
        )}
        {description && (
          <p className="line-clamp-2 font-serif text-primary sm:line-clamp-3">
            {sanitizedDescription}
          </p>
        )}
      </div>
    </HoverPrefetchLink>
  )
}
