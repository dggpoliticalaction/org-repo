import { RedditEmbed } from '@/components/RedditEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'

/**
 * Legacy block for Reddit embeds.
 * @param props - The props for the Reddit embed block.
 * @returns The Reddit embed component.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const RedditEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  return <RedditEmbed {...props} />
}
