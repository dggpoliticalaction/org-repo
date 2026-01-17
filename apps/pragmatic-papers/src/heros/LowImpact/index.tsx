import React from 'react'

import type { Page } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import RichText from '@/components/RichText'

type LowImpactHeroType =
    | {
    children?: React.ReactNode
    richText?: never
  }
  | (Omit<Page['hero'], 'richText'> & {
    children?: never
    richText?: Page['hero']['richText']
  })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
  const richTextContent = richText as DefaultTypedEditorState | null

  return (
    <div className="container mt-16">
      <div className="max-w-[48rem]">
        {children || (richTextContent && <RichText data={richTextContent} enableGutter={false} />)}
      </div>
    </div>
  )
}
