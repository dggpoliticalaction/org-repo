import { TikTokEmbed } from '@/components/TikTokEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'

export const TikTokEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  return <TikTokEmbed {...props} />
}
