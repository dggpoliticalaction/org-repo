import { BlueSkyEmbed } from '@/components/BlueSkyEmbed'
import type { BlueSkyEmbedBlock as BlueSkyEmbedBlockProps } from 'src/payload-types'

type Props = {
  url?: string
} & BlueSkyEmbedBlockProps

export const BlueSkyEmbedBlock: React.FC<Props> = (props) => {
  if (!props.url) {
    return null
  }

  return <BlueSkyEmbed url={props.url} />
}
