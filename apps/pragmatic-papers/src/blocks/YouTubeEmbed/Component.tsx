import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'

export const YouTubeEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  return <YouTubeEmbed {...props} />
}
