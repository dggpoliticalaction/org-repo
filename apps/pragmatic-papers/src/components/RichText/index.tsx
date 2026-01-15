import { SquiggleRuleBlock } from '@/blocks/SquiggleRule/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedInlineBlockNode,
  SerializedLinkNode,
  DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedLexicalNode } from '@payloadcms/richtext-lexical/lexical'

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
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'
import { MathBlock, type MathBlockProps } from '@/blocks/Math/Component'
import { FootnoteBlock, type FootnoteBlockProps } from '@/blocks/Footnote/Component'
import { TwitterEmbedBlock } from '@/blocks/TwitterEmbed/Component'
import { YouTubeEmbedBlock } from '@/blocks/YouTubeEmbed/Component'
import { RedditEmbedBlock } from '@/blocks/RedditEmbed/Component'
import { BlueSkyEmbedBlock } from '@/blocks/BlueSkyEmbed/Component'
import { TikTokEmbedBlock } from '@/blocks/TikTokEmbed/Component'

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
    >
  | SerializedInlineBlockNode<MathBlockProps | FootnoteBlockProps>

interface FootnoteEntry {
  id: string
  index: number
  note: string
}

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'articles' ? `/articles/${slug}` : `/${slug}`
}

const collectFootnotes = (data: DefaultTypedEditorState | null | undefined): FootnoteEntry[] => {
  if (!data?.root?.children?.length) return []

  const notes: FootnoteEntry[] = []

  const visitNode = (node: SerializedLexicalNode) => {
    if (!node || typeof node !== 'object') return

    if (node.type === 'inlineBlock') {
      const inlineNode = node as SerializedInlineBlockNode<FootnoteBlockProps>
      const { fields } = inlineNode

      if (fields?.blockType === 'footnote' && fields.note && typeof fields.index === 'number') {
        notes.push({
          id: fields.id,
          index: fields.index,
          note: fields.note,
        })
      }
    }

    if ('children' in node && Array.isArray(node.children)) {
      node.children.forEach((child: SerializedLexicalNode) => visitNode(child))
    }
  }

  data.root.children.forEach((child: SerializedLexicalNode) => visitNode(child))

  return notes
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
    twitterEmbed: ({ node }) => <TwitterEmbedBlock {...node.fields} />,
    youtubeEmbed: ({ node }) => <YouTubeEmbedBlock {...node.fields} />,
    redditEmbed: ({ node }) => <RedditEmbedBlock {...node.fields} />,
    blueSkyEmbed: ({ node }) => <BlueSkyEmbedBlock {...node.fields} />,
    tiktokEmbed: ({ node }) => <TikTokEmbedBlock {...node.fields} />,
  },
  inlineBlocks: {
    inlineMathBlock: ({ node }: { node: SerializedInlineBlockNode<MathBlockProps> }) => (
      <MathBlock {...node.fields} />
    ),
    footnote: ({ node }: { node: SerializedInlineBlockNode<FootnoteBlockProps> }) => (
      <FootnoteBlock {...node.fields} index={node.fields.index} />
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
  const { className, enableProse = true, enableGutter = true, data, ...rest } = props
  const footnotes = collectFootnotes(data)
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
      <ConvertRichText converters={jsxConverters} data={data} disableContainer />
      {footnotes.length > 0 ? (
        <section className="footnotes mt-6 border-t border-border pt-4">
          <ol className="list-decimal pl-4">
            {footnotes.map((footnote) => {
              const footnoteNumber = footnote.index

              return (
                <li key={footnote.id} id={`footnote-${footnoteNumber}`}>
                  {footnote.note}{' '}
                  <a
                    href={`#footnote-ref-${footnoteNumber}`}
                    aria-label={`Back to footnote ${footnoteNumber}`}
                  >
                    ↩
                  </a>
                </li>
              )
            })}
          </ol>
        </section>
      ) : null}
    </div>
  )
}
