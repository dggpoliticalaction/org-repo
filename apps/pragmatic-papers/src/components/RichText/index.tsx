import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CodeBlock, type CodeBlockProps } from '@/blocks/Code/Component'
import { FootnoteBlock } from '@/blocks/Footnote/Component'
import { MathBlock, type MathBlockProps } from '@/blocks/Math/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { MediaCollageBlock } from '@/blocks/MediaCollageBlock/component'
import {
  BlueskyEmbedBlock,
  RedditEmbedBlock,
  SocialEmbedBlock,
  TikTokEmbedBlock,
  TwitterEmbedBlock,
  YouTubeEmbedBlock,
} from '@/blocks/SocialEmbed'
import type { ParentDocContext } from '@/blocks/SocialEmbed/types'
import { SquiggleRuleBlock } from '@/blocks/SquiggleRule/Component'
import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  FootnoteBlock as FootnoteBlockProps,
  MediaBlock as MediaBlockProps,
  MediaCollageBlock as MediaCollageBlockProps,
  SocialEmbedBlock as SocialEmbedBlockProps,
  SquiggleRuleBlock as SquiggleRuleBlockProps,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedBlockNode,
  SerializedInlineBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  RichText as ConvertRichText,
  type JSXConvertersFunction,
  LinkJSXConverter,
} from '@payloadcms/richtext-lexical/react'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | CTABlockProps
      | MediaBlockProps
      | MediaCollageBlockProps
      | BannerBlockProps
      | CodeBlockProps
      | MathBlockProps
      | SquiggleRuleBlockProps
      | SocialEmbedBlockProps
    >
  | SerializedInlineBlockNode<MathBlockProps | FootnoteBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'articles' ? `/articles/${slug}` : `/${slug}`
}

function createJsxConverters(parentDoc?: ParentDocContext): JSXConvertersFunction<NodeTypes> {
  return ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),
    blocks: {
      banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
      mediaBlock: ({ node }) => (
        <MediaBlock
          className="col-span-3 col-start-1"
          imgClassName="m-0"
          {...node.fields}
          captionClassName="mx-auto max-w-3xl"
          enableGutter={false}
          disableInnerContainer
        />
      ),
      mediaCollage: ({ node }) => (
      <MediaCollageBlock {...node.fields} />
      ),
      code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
      cta: ({ node }) => <CallToActionBlock {...node.fields} />,
      displayMathBlock: ({ node }: { node: SerializedBlockNode<MathBlockProps> }) => (
        <MathBlock {...node.fields} />
      ),
      squiggleRule: ({ node }) => <SquiggleRuleBlock className="col-start-2" {...node.fields} />,
      socialEmbed: ({ node }) => <SocialEmbedBlock {...node.fields} parentDoc={parentDoc} />,
      // Legacy block types for backward compatibility with existing content
      twitterEmbed: ({ node }: { node: SerializedBlockNode<SocialEmbedBlockProps> }) => (
        <TwitterEmbedBlock {...node.fields} />
      ),
      youtubeEmbed: ({ node }: { node: SerializedBlockNode<SocialEmbedBlockProps> }) => (
        <YouTubeEmbedBlock {...node.fields} />
      ),
      redditEmbed: ({ node }: { node: SerializedBlockNode<SocialEmbedBlockProps> }) => (
        <RedditEmbedBlock {...node.fields} />
      ),
      blueSkyEmbed: ({ node }: { node: SerializedBlockNode<SocialEmbedBlockProps> }) => (
        <BlueskyEmbedBlock {...node.fields} />
      ),
      tiktokEmbed: ({ node }: { node: SerializedBlockNode<SocialEmbedBlockProps> }) => (
        <TikTokEmbedBlock {...node.fields} />
      ),
    },
    inlineBlocks: {
      inlineMathBlock: ({ node }: { node: SerializedInlineBlockNode<MathBlockProps> }) => (
        <MathBlock {...node.fields} />
      ),
      footnote: ({ node }) => <FootnoteBlock {...node.fields} />,
    },
  })
}

interface RichTextProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  parentDoc?: ParentDocContext
}

export default function RichText({
  className,
  enableProse = true,
  enableGutter = true,
  data,
  parentDoc,
  ...rest
}: RichTextProps): React.ReactNode {
  return (
    <div
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
    >
      <ConvertRichText converters={createJsxConverters(parentDoc)} data={data} disableContainer />
    </div>
  )
}
