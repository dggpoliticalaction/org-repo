import Link from "next/link"
import React from "react"

import { Media } from "@/components/Media"
import { Card, CardContent } from "@/components/ui/card"
import type { Article, Volume } from "@/payload-types"
import { cn } from "@/utilities/ui"

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
  const sanitizedDescription = description?.replace(/\s/g, " ")

  return (
    <Card className={cn("relative h-full rounded-sm", className)}>
      <CardContent className="flex flex-row gap-4 p-4 sm:flex-row">
        <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-sm border border-border bg-muted sm:h-28 sm:w-40">
          {metaImage && typeof metaImage !== "string" && (
            <div className="aspect-[4/3]">
              <Media resource={metaImage} imgClassName="h-full w-full object-cover" size="(max-width: 640px) 128px, 160px" />
            </div>
          )}
        </div>
        <div className="flex h-24 min-w-0 flex-1 flex-col justify-between space-y-1 overflow-hidden sm:h-28">
          <div className="min-h-0 space-y-1">
            {title && (
              <h3 className="line-clamp-2 font-semibold text-foreground">
                <Link
                  href={href}
                  className="transition-colors after:absolute after:inset-0 hover:text-brand"
                >
                  {title}
                </Link>
              </h3>
            )}
            {sanitizedDescription && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{sanitizedDescription}</p>
            )}
          </div>
          {volume && (
            <p className="line-clamp-1 pt-1 text-xs text-muted-foreground">
              <Link href={`/volumes/${volume.slug}`} className="underline-offset-2 hover:underline">
                {volume.title ?? volume.slug}
              </Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
