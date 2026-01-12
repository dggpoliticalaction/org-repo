import { TikTokEmbed } from '@/components/TikTokEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'

/**
 * Legacy block for TikTok embeds.
 * @param props - The props for the TikTok embed block.
 * @returns The TikTok embed component.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const TikTokEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  return <TikTokEmbed {...props} />
}
