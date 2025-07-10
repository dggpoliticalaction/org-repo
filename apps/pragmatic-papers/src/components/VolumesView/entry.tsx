'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Volume } from '@/payload-types'

import { formatWithOptions } from 'date-fns/fp'
import { enUS } from 'date-fns/locale'

import { SquiggleStatic } from '@/components/ui/squiggle'
import { toRoman } from '@/utilities/toRoman'

// import { Media } from '@/components/Media'

export type EntryVolumeData = Pick<
  Volume,
  'slug' | 'description' | 'title' | 'volumeNumber' | 'publishedAt'
>

export const Entry: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: EntryVolumeData
  relationTo?: 'volumes'
  title?: string
}> = (props) => {
  const { card: entry, link } = useClickableCard({})
  const { className, doc, relationTo, title: titleFromProps } = props

  const { slug, description, title, volumeNumber, publishedAt } = doc || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  const dateToString = formatWithOptions({ locale: enUS }, 'MMMM dd')

  return (
    <article className={cn('overflow-hidden hover:cursor-pointer', className)} ref={entry.ref}>
      <div className="group">
        <div className="text-left text-sm">
          <span className="pe-2">Volume {toRoman(volumeNumber ?? 1)}</span>
          <span className="text-brand">
            {publishedAt ? dateToString(Date.parse(publishedAt)) : ''}
          </span>
        </div>
        <div className="text-justify">
          {titleToUse && (
            <h3 className="my-6">
              <Link
                className="text-xl md:text-3xl font-bold group-hover:text-brandLight transition-colors"
                href={href}
                ref={link.ref}
              >
                {titleToUse}
              </Link>
            </h3>
          )}
          {description && (
            <div className="my-3 text-sm md:text-base text-muted-foreground">
              {description && <p>{sanitizedDescription}</p>}
            </div>
          )}
          <SquiggleStatic />
        </div>
      </div>
    </article>
  )
}
