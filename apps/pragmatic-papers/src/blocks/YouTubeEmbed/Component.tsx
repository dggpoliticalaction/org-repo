import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'

/**
 * Legacy block for YouTube embeds.
 * @param props - The props for the YouTube embed block.
 * @returns The YouTube embed component.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const YouTubeEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  return <YouTubeEmbed {...props} />
}
