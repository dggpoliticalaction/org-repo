import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { SquiggleRuleBlock } from '@/blocks/SquiggleRule/Component'
import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  RichText as ConvertRichText,
  type JSXConvertersFunction,
  LinkJSXConverter,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, type CodeBlockProps } from '@/blocks/Code/Component'

import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { MathBlock, type MathBlockProps } from '@/blocks/Math/Component'
import {
  BlueSkyOEmbedBlock,
  RedditEmbedBlock,
  SocialEmbedBlock,
  TikTokEmbedBlock,
  TwitterOEmbedBlock,
  YouTubeEmbedBlock,
} from '@/blocks/SocialEmbed'
import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
  SocialEmbedBlock as SocialEmbedBlockProps,
  SquiggleRuleBlock as SquiggleRuleBlockProps,
} from '@/payload-types'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
    | CTABlockProps
    | MediaBlockProps
    | BannerBlockProps
    | CodeBlockProps
    | MathBlockProps
    | SquiggleRuleBlockProps
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
        className="col-span-3 col-start-1"
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
    twitterEmbed: ({ node }: { node: SerializedBlockNode<SocialEmbedBlockProps> }) => (
      <TwitterOEmbedBlock {...node.fields} />
    ),
    youtubeEmbed: ({ node }: { node: SerializedBlockNode<SocialEmbedBlockProps> }) => (
      <YouTubeEmbedBlock {...node.fields} />
    ),
    redditEmbed: ({ node }: { node: SerializedBlockNode<SocialEmbedBlockProps> }) => (
      <RedditEmbedBlock {...node.fields} />
    ),
    blueSkyEmbed: ({ node }: { node: SerializedBlockNode<SocialEmbedBlockProps> }) => (
      <BlueSkyOEmbedBlock {...node.fields} />
    ),
    tiktokEmbed: ({ node }: { node: SerializedBlockNode<SocialEmbedBlockProps> }) => (
      <TikTokEmbedBlock {...node.fields} />
    ),
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
