import { RedditEmbed } from '@/components/RedditEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'

export const RedditEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  return <RedditEmbed {...props} />
}
