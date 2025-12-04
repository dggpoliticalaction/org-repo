import { SquiggleRuleBlock } from '@/blocks/SquiggleRule/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, type CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  SquiggleRuleBlock as SquiggleRuleBlockProps,
  MediaBlock as MediaBlockProps,
  TwitterEmbedBlock as TwitterEmbedBlockProps,
  YouTubeEmbedBlock as YouTubeEmbedBlockProps,
  RedditEmbedBlock as RedditEmbedBlockProps,
  BlueSkyEmbedBlock as BlueSkyEmbedBlockProps,
  TikTokEmbedBlock as TikTokEmbedBlockProps,
  SocialEmbedBlock as SocialEmbedBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'
import { MathBlock, type MathBlockProps } from '@/blocks/Math/Component'
import { TwitterEmbedBlock } from '@/blocks/TwitterEmbed/Component'
import { YouTubeEmbedBlock } from '@/blocks/YouTubeEmbed/Component'
import { RedditEmbedBlock } from '@/blocks/RedditEmbed/Component'
import { BlueSkyEmbedBlock } from '@/blocks/BlueSkyEmbed/Component'
import { TikTokEmbedBlock } from '@/blocks/TikTokEmbed/Component'
import { SocialEmbedBlock } from '@/blocks/SocialEmbed/Component'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
    | CTABlockProps
    | MediaBlockProps
    | BannerBlockProps
    | CodeBlockProps
    | MathBlockProps
    | SquiggleRuleBlockProps
    | TwitterEmbedBlockProps
    | YouTubeEmbedBlockProps
    | RedditEmbedBlockProps
    | BlueSkyEmbedBlockProps
    | TikTokEmbedBlockProps
    | SocialEmbedBlockProps
  >

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'articles' ? `/articles/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
    displayMathBlock: ({ node }: { node: SerializedBlockNode<MathBlockProps> }) => (
      <MathBlock {...node.fields} />
    ),
    squiggleRule: ({ node }) => <SquiggleRuleBlock className="col-start-2" {...node.fields} />,
    socialEmbed: ({ node }) => <SocialEmbedBlock {...node.fields} />,
    // Legacy block types for backward compatibility with existing content
    twitterEmbed: ({ node }) => <TwitterEmbedBlock {...node.fields} />,
    youtubeEmbed: ({ node }) => <YouTubeEmbedBlock {...node.fields} />,
    redditEmbed: ({ node }) => <RedditEmbedBlock {...node.fields} />,
    blueSkyEmbed: ({ node }) => <BlueSkyEmbedBlock {...node.fields} />,
    tiktokEmbed: ({ node }) => <TikTokEmbedBlock {...node.fields} />,
  },
  inlineBlocks: {
    inlineMathBlock: ({ node }: { node: SerializedBlockNode<MathBlockProps> }) => (
      <MathBlock {...node.fields} />
    ),
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
