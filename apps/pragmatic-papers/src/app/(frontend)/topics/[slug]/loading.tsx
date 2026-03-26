import { ARTICLES_PER_PAGE } from "@/app/(frontend)/topics/[slug]/queries"
import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

function ArticleCardSkeleton(): React.ReactNode {
  return (
    <div className="ring-foreground/10 rounded-sm py-4 ring-1">
      <div className="flex flex-col items-center gap-4 px-4 md:flex-row">
        {/* Thumbnail */}
        <Skeleton className="aspect-3/2 w-full shrink-0 rounded-sm md:aspect-4/3 md:h-24 md:w-32" />
        {/* Text */}
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
    </div>
  )
}

export default function Loading(): React.ReactNode {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: ARTICLES_PER_PAGE }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  )
}
