import { cn } from '@/utilities/ui'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ResourceCard, ResourceCardData } from '@/components/ResourceCard'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Props = {
  resources: ResourceCardData[]
}

export const ResourceArchive: React.FC<Props> = (props) => {
  const { resources } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {resources?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <ResourceCard className="h-full" doc={result} showCategories />
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
