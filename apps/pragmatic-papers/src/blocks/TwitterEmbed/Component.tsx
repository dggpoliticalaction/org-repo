import { TwitterEmbed } from '@/components/TwitterEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'

/**
 * Legacy block for Twitter embeds.
 * @param props - The props for the Twitter embed block.
 * @returns The Twitter embed component.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const TwitterEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  return <TwitterEmbed {...props} />
}
