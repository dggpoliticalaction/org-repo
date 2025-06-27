import { cn } from '@/utilities/ui'
import React from 'react'

import { Entry, type EntryVolumeData } from './entry'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Props = {
  volumes: EntryVolumeData[]
}

export const VolumesView: React.FC<Props> = (props) => {
  const { volumes } = props

  return (
    <div className={cn('m-auto max-w-xl w-3/4')}>
      <div>
        <div className="grid grid-cols-1 gap-4">
          {volumes?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="pt-3" key={index}>
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
