import { RedditEmbed } from "@/components/RedditEmbed";
import type { RedditEmbedBlock as RedditEmbedBlockProps } from 'src/payload-types'

type Props = {
  url?: string
} & RedditEmbedBlockProps

export const RedditEmbedBlock: React.FC<Props> = (props) => {
  return (
    <RedditEmbed url={props.url} />
  )
}