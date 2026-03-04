import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { editorFieldLevel } from '@/access/editor'
import { editorOrSelf, restrictWritersToDraftOnly } from '@/access/editorOrSelf'
import { writer } from '@/access/writer'
import { Banner } from '@/blocks/Banner/config'
import { Code } from '@/blocks/Code/config'
import { FootnoteBlock } from '@/blocks/Footnote/config'
import { DisplayMathBlock, InlineMathBlock } from '@/blocks/Math/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { SocialEmbed } from '@/blocks/SocialEmbed/config'
import { LegacyBlueskyEmbed } from '@/blocks/SocialEmbed/embeds/BlueskyEmbed/config'
import { LegacyRedditEmbed } from '@/blocks/SocialEmbed/embeds/RedditEmbed/config'
import { LegacyTikTokEmbed } from '@/blocks/SocialEmbed/embeds/TikTokEmbed/config'
import { LegacyTwitterEmbed } from '@/blocks/SocialEmbed/embeds/TwitterEmbed/config'
import { LegacyYouTubeEmbed } from '@/blocks/SocialEmbed/embeds/YouTubeEmbed/config'
import { SquiggleRule } from '@/blocks/SquiggleRule/config'
import { generateFootnotes } from '@/collections/Articles/hooks/generateFootnotes'
import { populateAuthors } from '@/collections/Articles/hooks/populateAuthors'
import { revalidateArticle, revalidateDelete } from '@/collections/Articles/hooks/revalidateArticle'
import { footnotesArrayField } from '@/fields/footnotes'
import { type Article } from '@/payload-types'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
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
import { MediaCollageBlock } from '@/blocks/MediaCollageBlock/config'
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { slugField } from 'payload'

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
                        MediaCollageBlock,
                        DisplayMathBlock,
                        SquiggleRule,
                        SocialEmbed,
                        // Legacy blocks for backward compatibility with existing content
                        LegacyBlueskyEmbed,
                        LegacyRedditEmbed,
                        LegacyTikTokEmbed,
                        LegacyTwitterEmbed,
                        LegacyYouTubeEmbed,
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
    footnotesArrayField(),
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
      generateFootnotes,
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
