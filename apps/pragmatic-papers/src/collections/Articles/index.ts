import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

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
import type {
  SerializedEditorState,
  SerializedLexicalNode,
} from '@payloadcms/richtext-lexical/lexical'

import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { Banner } from '@/blocks/Banner/config'
import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'

import { slugField } from 'payload'
import { revalidateArticle, revalidateDelete } from './hooks/revalidateArticle'
import { populateAuthors } from './hooks/populateAuthors'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { editorOrSelf, restrictWritersToDraftOnly } from '@/access/editorOrSelf'
import { writer } from '@/access/writer'
import { editorFieldLevel } from '@/access/editor'
import { type Article } from '@/payload-types'
import { DisplayMathBlock, InlineMathBlock } from '@/blocks/Math/config'
import { FootnoteBlock } from '@/blocks/Footnote/config'
import { SquiggleRule } from '@/blocks/SquiggleRule/config'
import { TwitterEmbed } from '@/blocks/TwitterEmbed/config'
import { YouTubeEmbed } from '@/blocks/YouTubeEmbed/config'
import { RedditEmbed } from '@/blocks/RedditEmbed/config'
import { BlueSkyEmbed } from '@/blocks/BlueSkyEmbed/config'
import { TikTokEmbed } from '@/blocks/TikTokEmbed/config'

interface FootnoteItem {
  index: number
  note: string
}

const applyFootnoteIndicesAndCollect = (
  editorState?: SerializedEditorState | null,
): FootnoteItem[] => {
  if (!editorState || typeof editorState !== 'object') return []

  let footnoteIndex = 0
  const footnotes: FootnoteItem[] = []

  const visitNode = (node: SerializedLexicalNode) => {
    if (!node || typeof node !== 'object') return

    if (node.type === 'inlineBlock') {
      const inlineNode = node as SerializedLexicalNode & {
        fields?: { blockType?: string; index?: number; note?: string }
      }

      if (inlineNode.fields?.blockType === 'footnote' && inlineNode.fields.note) {
        footnoteIndex += 1
        inlineNode.fields.index = footnoteIndex
        footnotes.push({
          index: footnoteIndex,
          note: inlineNode.fields.note,
        })
      }
    }

    if ('children' in node && Array.isArray(node.children)) {
      node.children.forEach((child: SerializedLexicalNode) => visitNode(child))
    }
  }

  const rootChildren = editorState.root?.children
  if (Array.isArray(rootChildren)) {
    rootChildren.forEach((child: SerializedLexicalNode) => visitNode(child))
  }

  return footnotes
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    create: writer,
    delete: editorOrSelf,
    read: authenticatedOrPublished,
    update: restrictWritersToDraftOnly,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'articles',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'articles',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
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
                      blocks: [
                        Banner,
                        Code,
                        MediaBlock,
                        DisplayMathBlock,
                        SquiggleRule,
                        TwitterEmbed,
                        YouTubeEmbed,
                        RedditEmbed,
                        BlueSkyEmbed,
                        TikTokEmbed,
                      ],
                      inlineBlocks: [InlineMathBlock, FootnoteBlock],
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
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      access: {
        update: editorFieldLevel,
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      access: {
        update: () => false,
      },
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      name: 'footnotes',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        readOnly: true,
        hidden: true,
      },
      fields: [
        {
          name: 'index',
          type: 'number',
        },
        {
          name: 'note',
          type: 'textarea',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    beforeChange: [
      (args: Parameters<CollectionBeforeChangeHook<Article>>[0]): Partial<Article> | void => {
        const { req, operation, data } = args
        if (operation === 'create') {
          if (req.user) {
            data.createdBy = req.user.id
            return data
          }
        }
      },
      (args: Parameters<CollectionBeforeChangeHook<Article>>[0]): Partial<Article> | void => {
        const { data, req } = args
        const autosaveQuery = req?.query?.autosave
        const isAutosave =
          autosaveQuery === true ||
          autosaveQuery === 'true' ||
          autosaveQuery === 1 ||
          autosaveQuery === '1'
        if (!isAutosave && data?.content) {
          const dataWithFootnotes = data as Partial<Article> & {
            footnotes?: FootnoteItem[]
          }
          dataWithFootnotes.footnotes = applyFootnoteIndicesAndCollect(
            data.content as SerializedEditorState,
          )
        }
        return data
      },
    ],
    afterChange: [revalidateArticle],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
