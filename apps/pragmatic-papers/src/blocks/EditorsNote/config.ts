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

export const EditorsNote: Block = {
  slug: 'editorsNote',
  interfaceName: 'editorsNote',
  fields: [
    {
      name: 'content',
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
      required: false,
    },
  ],
  admin: {
    disableBlockName: true,
  },
  labels: {
    singular: "Editor's Note",
    plural: "Editor's Notes",
  },
}
