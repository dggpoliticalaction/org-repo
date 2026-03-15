import type { Article } from "@/payload-types"
import React from "react"

import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { Media } from "@/components/Media"
import { cn } from "@/utilities/utils"

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
    <div className={cn("space-y-2", className)}>
      {metaImage && typeof metaImage !== "string" && (
        <div className="bg-muted mb-2 flex aspect-3/2 items-center overflow-hidden rounded-sm hover:opacity-90">
          <HoverPrefetchLink href={href}>
            <Media resource={metaImage} imgClassName="object-cover min-h-[352px]" size="square" />
          </HoverPrefetchLink>
        </div>
      )}
      {titleToUse && (
        <div className="font-display text-xl font-bold">
          <HoverPrefetchLink href={href} className="hover:text-primary/80 transition-colors">
            {titleToUse}
          </HoverPrefetchLink>
        </div>
      )}
      {description && <p className="text-primary font-serif">{sanitizedDescription}</p>}
    </div>
  )
}
