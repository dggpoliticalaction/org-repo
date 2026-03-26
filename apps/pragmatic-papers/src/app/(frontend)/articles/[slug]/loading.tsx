import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

export default function Loading(): React.ReactNode {
  return (
    <article className="mx-auto max-w-2xl space-y-6 px-4">
      <div className="relative flex flex-col gap-2 md:-mx-10 lg:-mx-32 xl:-mx-44">
        {/* Cover image */}
        <Skeleton className="aspect-video w-full rounded-sm" />

        {/* Title */}
        <div className="mt-8 space-y-2">
          <Skeleton className="h-11 w-2/3" />
          <Skeleton className="h-11 w-3/4" />
        </div>

        {/* Author + date */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>

        <Skeleton className="my-4 h-px w-full" />
      </div>

      {/* Body paragraphs */}
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </article>
  )
}
