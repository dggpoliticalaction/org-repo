import { BlueSkyEmbed } from '@/components/BlueSkyEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'
import React from 'react'

/**
 * Legacy block for Bluesky embeds.
 * @param props - The props for the Bluesky embed block.
 * @returns The Bluesky embed component.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const BlueSkyEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  return <BlueSkyEmbed {...props} />
}
