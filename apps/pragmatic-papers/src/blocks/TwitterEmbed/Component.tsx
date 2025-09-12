import { TwitterEmbed } from '@/components/TwitterEmbed'
import type { TwitterEmbedBlock as TwitterEmbedBlockProps } from 'src/payload-types'

type Props = {
  url?: string
} & TwitterEmbedBlockProps

export const TwitterEmbedBlock: React.FC<Props> = (props) => {
  return (
    <TwitterEmbed
      url={props.url}
      hideMedia={props.hideMedia || false}
      hideThread={props.hideThread || false}
      align="center" />
  )
}
