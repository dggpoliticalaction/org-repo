import { BlueSkyEmbed } from '@/components/BlueSkyEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'
import React from 'react'

export const BlueSkyEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  return <BlueSkyEmbed {...props} />
}
