import Link from "next/link"
import React from "react"

import type { Article } from "@/payload-types"

import { Media } from "@/components/Media"
import { cn } from "@/utilities/ui"

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
    <div className={cn("space-y-3", className)}>
      {image && typeof image !== "string" && (
        <div className="aspect-video md:aspect-[4/3]">
          <Media resource={image} size="(max-width: 640px) 25vw, 50vw" />
        </div>
      )}
      <div className="flex flex-grow basis-3/4 flex-col sm:basis-auto">
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
    </div>
  )
}
