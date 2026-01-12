import { TwitterEmbed } from '@/components/TwitterEmbed'
import type { SocialEmbedBlock as SocialEmbedBlockProps } from '@/payload-types'

export const TwitterEmbedBlock: React.FC<SocialEmbedBlockProps> = (props) => {
  return (
    <TwitterEmbed
      url={props.url}
      hideMedia={props.hideMedia || false}
      hideThread={props.hideThread || false}
      align="center"
    />
  )
}
