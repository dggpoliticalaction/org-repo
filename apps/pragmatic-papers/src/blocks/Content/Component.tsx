import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'

import './style.scss'

type Column = Omit<NonNullable<ContentBlockProps['columns']>[number], 'richText'> & {
  richText?: DefaultTypedEditorState | null
}

type Props = Omit<ContentBlockProps, 'columns'> & {
  columns?: Column[]
}

export const ContentBlock: React.FC<Props> = ({columns, ...rest}) => {
  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-4">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns?.length
          ? columns.map((col: Column, index: number) => {
              const { enableLink, link, richText, size } = col

              return (
                <div
                  className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                    'md:col-span-2': size !== 'full',
                  })}
                  key={index}
                >
                  {richText ? <RichText data={richText} enableGutter={false} /> : null}

                  {enableLink && <CMSLink {...link} />}
                </div>
              )
            })
          : null}
      </div>
    </div>
  )
}
