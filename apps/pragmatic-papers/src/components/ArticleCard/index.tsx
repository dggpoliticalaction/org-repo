"use client"
import { cn } from "@/utilities/ui"
import useClickableCard from "@/utilities/useClickableCard"
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
  const { card, link } = useClickableCard<HTMLDivElement>({})
  const { className, doc, relationTo, title: titleFromProps } = props

  const { slug, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, " ") // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <div className="h-full overflow-hidden rounded-lg">
      <article
        className={cn("flex h-full flex-row hover:cursor-pointer sm:flex-col", className)}
        ref={card.ref}
      >
        <div className="flex min-w-24 flex-shrink-0 basis-1/4 flex-col justify-center overflow-hidden rounded-lg sm:max-h-[300px] sm:min-w-0 sm:basis-auto">
          {metaImage && typeof metaImage !== "string" && (
            <Media
              resource={metaImage}
              className="aspect-[4/3] w-full sm:aspect-square"
              imgClassName="object-cover h-full w-full rounded-lg"
              size="square"
            />
          )}
        </div>
        <div className="flex flex-grow basis-3/4 flex-col p-4 sm:basis-auto">
          {titleToUse && (
            <div className="line-clamp-4 pb-1 font-sans text-xl font-extrabold">
              <Link className="transition-colors hover:text-brand" href={href} ref={link.ref}>
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
