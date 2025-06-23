import { cn } from '@/utilities/ui'
import React from 'react'

import { Entry, EntryVolumeData } from './entry'

export type Props = {
  volumes: EntryVolumeData[]
}

export const VolumesView: React.FC<Props> = (props) => {
  const { volumes } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-1 gap-4">
          {volumes?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="" key={index}>
                  <Entry className="h-full" doc={result} relationTo="volumes" />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
