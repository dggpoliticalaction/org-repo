'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Volume } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'

import { formatWithOptions } from 'date-fns/fp'
import { enUS } from 'date-fns/locale'

// import { Media } from '@/components/Media'

export type EntryVolumeData = Pick<
  Volume,
  'slug' | 'description' | 'title' | 'volumeNumber' | 'publishedAt'
>

function toRoman(x: number) {
  // array of values and symbols
  const base = [1, 4, 5, 9, 10, 40, 50, 90, 100, 400, 500, 900, 1000]
  const sym = ['I', 'IV', 'V', 'IX', 'X', 'XL', 'L', 'XC', 'C', 'CD', 'D', 'CM', 'M']

  // to store result
  let res = ''

  // Loop from the right side to find
  // the largest smaller base value
  let i = base.length - 1
  while (x > 0) {
    let div = Math.floor(x / base[i])
    while (div) {
      res += sym[i]
      div--
    }

    // Repeat the process for remainder
    x %= base[i]
    i--
  }

  return res
}

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
          <span className="pe-2">Volume {toRoman(volumeNumber)}</span>
          <span className="text-brandLight">{dateToString(Date.parse(publishedAt))}</span>
        </div>
        <div className="text-justify">
          {titleToUse && (
            <h3 className="my-6">
              <Link
                className="text-3xl font-bold group-hover:text-brandLight transition-colors"
                href={href}
                ref={link.ref}
              >
                {titleToUse}
              </Link>
            </h3>
          )}
          {description && (
            <div className="my-3 text-gray-400">{description && <p>{sanitizedDescription}</p>}</div>
          )}
        </div>
      </div>
    </article>
  )
}
