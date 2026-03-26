import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

function ArticleCardSkeleton(): React.ReactNode {
  return (
    <div className="ring-foreground/10 rounded-sm py-4 ring-1">
      <div className="flex flex-col items-center gap-4 px-4 md:flex-row">
        <Skeleton className="aspect-3/2 w-full shrink-0 rounded-sm md:aspect-4/3 md:h-24 md:w-32" />
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
    <article className="mx-auto max-w-3xl space-y-6 px-4">
      {/* Header */}
      <header className="flex flex-col items-center space-y-3 text-center">
        <Skeleton className="size-32 rounded-sm" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        {/* Social icons */}
        <div className="flex gap-3">
          <Skeleton className="size-4" />
          <Skeleton className="size-4" />
          <Skeleton className="size-4" />
        </div>
      </header>

      {/* Bio */}
      <section>
        <Skeleton className="mb-3 h-7 w-12" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </section>

      <Skeleton className="my-16 h-px w-full" />

      {/* Articles */}
      <section>
        <Skeleton className="mb-4 h-7 w-20" />
        <Skeleton className="mx-auto mb-4 h-4 w-48" />
        <div className="flex flex-col gap-4">
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </div>
        {/* Pagination */}
        <div className="my-12 flex justify-center gap-1">
          <Skeleton className="h-8 w-20 rounded-sm" />
          <Skeleton className="size-8 rounded-sm" />
          <Skeleton className="size-8 rounded-sm" />
          <Skeleton className="h-8 w-16 rounded-sm" />
        </div>
      </section>
    </article>
  )
}
