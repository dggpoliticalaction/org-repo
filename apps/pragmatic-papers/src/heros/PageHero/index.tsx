import React from 'react'

import type { Page } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import RichText from '@/components/RichText'

type PageHeroType =
  | {
      children?: React.ReactNode
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const PageHero: React.FC<PageHeroType> = ({ children, richText }) => {
  const richTextContent = richText as DefaultTypedEditorState | null

  return (
    <div className="flex justify-center">
      <div className="text-center">
        {children || (richTextContent && <RichText data={richTextContent} enableGutter={false} />)}
      </div>
    </div>
  )
}
