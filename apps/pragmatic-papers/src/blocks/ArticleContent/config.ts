import type { Block } from 'payload'

import {
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'

import { Banner } from '@/blocks/Banner/config'
import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'

import { DisplayMathBlock, InlineMathBlock } from '@/blocks/Math/config'
import { SquiggleRule } from '@/blocks/SquiggleRule/config'

export const ArticleContent: Block = {
  slug: 'articleBodyContent',
  interfaceName: 'articleBodyContent',
  fields: [
    {
      name: 'articleBodyContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            AlignFeature(),
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            BlocksFeature({
              blocks: [Banner, Code, MediaBlock, DisplayMathBlock, SquiggleRule],
              inlineBlocks: [InlineMathBlock],
            }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
            BlockquoteFeature(),
            EXPERIMENTAL_TableFeature(),
            StrikethroughFeature(),
            SubscriptFeature(),
            SuperscriptFeature(),
            IndentFeature(),
            UnorderedListFeature(),
            OrderedListFeature(),
            ChecklistFeature(),
          ]
        },
      }),
      label: false,
      required: true,
    },
  ],
  admin: {
    disableBlockName: true,
  },
  labels: {
    singular: 'Article Body Content',
    plural: 'Article Body Contents',
  },
}
