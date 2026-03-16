import { cn } from "@/utilities/ui"
import Link from "next/link"
import React from "react"

import type { Volume } from "@/payload-types"

import { formatWithOptions } from "date-fns/fp"
import { enUS } from "date-fns/locale"

import { toRoman } from "@/utilities/toRoman"

// import { Media } from '@/components/Media'

export type EntryVolumeData = Pick<
  Volume,
  "slug" | "description" | "title" | "volumeNumber" | "publishedAt"
>

export const Entry: React.FC<{
  alignItems?: "center"
  className?: string
  doc?: EntryVolumeData
  relationTo?: "volumes"
  title?: string
}> = (props) => {
  const { className, doc, relationTo, title: titleFromProps } = props

  const { slug, description, title, volumeNumber, publishedAt } = doc || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, " ") // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  const dateToString = formatWithOptions({ locale: enUS }, "MMMM dd")

  return (
    <article className={cn("relative overflow-hidden", className)}>
      <div className="group">
        <div className="text-left text-sm">
          <span className="pe-2">Volume {toRoman(volumeNumber ?? 1)}</span>
          <span className="text-brand">
            {publishedAt ? dateToString(Date.parse(publishedAt)) : ""}
          </span>
        </div>
        {titleToUse && (
          <h3 className="my-6 text-center">
            <Link
              className="text-xl font-bold transition-colors after:absolute after:inset-0 group-hover:text-brand md:text-3xl"
              href={href}
            >
              {titleToUse}
            </Link>
          </h3>
        )}
        <div className="text-justify">
          {description && (
            <div className="my-3 text-sm text-muted-foreground md:text-base">
              {description && <p>{sanitizedDescription}</p>}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
