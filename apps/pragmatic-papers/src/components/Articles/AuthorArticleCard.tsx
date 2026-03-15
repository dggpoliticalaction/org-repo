import React from "react"

import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { Media } from "@/components/Media"
import { Card, CardContent } from "@/components/ui/card"
import type { Article, Volume } from "@/payload-types"
import { cn } from "@/utilities/utils"

export interface AuthorArticleCardProps {
  article: Article
  volume?: Volume
  className?: string
}

export const AuthorArticleCard: React.FC<AuthorArticleCardProps> = ({
  article,
  volume,
  className,
}) => {
  const { slug, meta, title } = article
  const { description, image: metaImage } = meta || {}

  const href = `/articles/${slug}`

  return (
    <Card className={cn("rounded-sm", className)}>
      <CardContent className="flex flex-row gap-4">
        <div className="border-border bg-muted h-24 w-32 shrink-0 overflow-hidden rounded-sm border sm:h-28 sm:w-40">
          {metaImage && typeof metaImage !== "string" && (
            <HoverPrefetchLink href={href}>
              <Media
                resource={metaImage}
                className="h-full w-full rounded-sm"
                pictureClassName="h-full w-full hover:opacity-80"
                imgClassName="h-full w-full object-cover"
              />
            </HoverPrefetchLink>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {title && (
            <h3 className="text-primary font-display hover:text-primary/80 line-clamp-3 text-lg font-semibold">
              <HoverPrefetchLink href={href}>{title}</HoverPrefetchLink>
            </h3>
          )}
          {description && (
            <p className="text-primary line-clamp-2 font-serif text-sm">{description}</p>
          )}
          {volume && (
            <HoverPrefetchLink
              href={`/volumes/${volume.slug}`}
              className="text-muted-foreground mt-auto line-clamp-1 text-sm underline-offset-2 hover:underline"
            >
              {volume.title ?? volume.slug}
            </HoverPrefetchLink>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
