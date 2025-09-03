import { TwitterEmbed } from '@/components/TwitterEmbed'
import type { TwitterEmbedBlock as TwitterEmbedBlockProps } from 'src/payload-types'

type Props = {
  url?: string
} & TwitterEmbedBlockProps

export const TwitterEmbedBlock: React.FC<Props> = (props) => {
  return (
    <div>
      <TwitterEmbed
        url={props.url}
        maxWidth={props.maxWidth}
        hideMedia={props.hideMedia || false}
        hideThread={props.hideThread || false}
        align={props.align || 'none'}
        lang={props.lang} />
    </div>
  )
}
