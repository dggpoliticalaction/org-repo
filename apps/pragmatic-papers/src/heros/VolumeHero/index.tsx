import React from 'react'

import type { Volume } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import { toRoman } from '@/utilities/toRoman'

export const VolumeHero: React.FC<{
  volume: Volume
}> = ({ volume }) => {
  const { publishedAt, slug } = volume

  return (
    <div className="relative flex items-end">
      <div className="container pb-8 text-center">
        <div>
          <div>
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{`Volume ${toRoman(Number(slug))}`}</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-16 justify-center">
            {publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-sm">Date Published</p>
                <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
