import { TikTokEmbed } from '@/components/TikTokEmbed'
import type { TikTokEmbedBlock as TikTokEmbedBlockProps } from 'src/payload-types'

type Props = {
  url?: string
} & TikTokEmbedBlockProps

export const TikTokEmbedBlock: React.FC<Props> = (props) => {
  return <TikTokEmbed url={props.url} />
}
