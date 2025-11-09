import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import type { YouTubeEmbedBlock as YouTubeEmbedBlockProps } from 'src/payload-types'

type Props = {
  url?: string
} & YouTubeEmbedBlockProps

export const YouTubeEmbedBlock: React.FC<Props> = (props) => {
  if (!props.url) {
    return null
  }

  return (
    <YouTubeEmbed url={props.url} />
  )
}
