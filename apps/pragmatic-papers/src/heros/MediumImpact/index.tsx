import React from 'react'

import type { Page } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const richTextContent = richText as DefaultTypedEditorState | null
  const mediaCaption =
    media && typeof media === 'object' && media.caption
      ? (media.caption as DefaultTypedEditorState | null)
      : null

  return (
    <div className="">
      <div className="container mb-8">
        {richTextContent && (
          <RichText className="mb-6" data={richTextContent} enableGutter={false} />
        )}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => (
              <li key={i}>
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="container ">
        {media && typeof media === 'object' && (
          <div>
            <Media
              className="-mx-4 md:-mx-8 2xl:-mx-16"
              imgClassName=""
              priority
              resource={media}
            />
            {mediaCaption && (
              <div className="mt-3">
                <RichText data={mediaCaption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
