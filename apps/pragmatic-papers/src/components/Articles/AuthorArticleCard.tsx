"use client"

import Link from "next/link"
import React from "react"

import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { Media } from "@/components/Media"
import { Card, CardContent } from "@/components/ui/card"
import type { Article, Volume } from "@/payload-types"
import useClickableCard from "@/utilities/useClickableCard"
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
  const { card, link } = useClickableCard<HTMLDivElement>({})

  const { slug, meta, title } = article
  const { description, image: metaImage } = meta || {}

  const href = `/articles/${slug}`
  const sanitizedDescription = description?.replace(/\s/g, " ")

  return (
    <Card className={cn("h-full rounded-xs", className)}>
      <CardContent ref={card.ref} className="flex flex-row gap-4 p-4 sm:flex-row">
        <div className="border-border bg-muted h-24 w-32 shrink-0 overflow-hidden rounded-sm border sm:h-28 sm:w-40">
          {metaImage && typeof metaImage !== "string" && (
            <Link href={href} ref={link.ref}>
              <Media
                resource={metaImage}
                className="h-full w-full rounded-xs"
                pictureClassName="h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
            </Link>
          )}
        </div>
        <div className="flex h-24 min-w-0 flex-1 flex-col justify-between space-y-1 overflow-hidden sm:h-28">
          <div className="min-h-0 space-y-1">
            {title && (
              <h3 className="text-foreground hover:text-brand line-clamp-3 font-semibold transition-colors">
                <HoverPrefetchLink href={href} ref={link.ref}>
                  {title}
                </HoverPrefetchLink>
              </h3>
            )}
            {sanitizedDescription && (
              <p className="text-muted-foreground line-clamp-2 text-sm">{sanitizedDescription}</p>
            )}
          </div>
          {volume && (
            <p className="text-muted-foreground pt-1 text-xs">
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
