import type { CollectionConfig } from 'payload'

import {
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'

import { numberSlugField } from '@/fields/numberSlug'

import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { SquiggleRule } from '../../blocks/SquiggleRule/config'
import { VolumeIntroduction } from '@/blocks/VolumeIntroduction/config'
import { EditorsNote } from '@/blocks/EditorsNote/config'
import { ArticleCardsGrid } from '@/blocks/ArticleCardsGrid/config'
import { editor } from '@/access/editor'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { revalidateArticle, revalidateDelete } from './hooks/revalidateVolumes'
import { checkArticles } from './hooks/checkArticles'
import { pushToWebhooks } from './hooks/pushToWebhooks'
import { setDefaultSeoTitle } from './hooks/seoTitle'

export const Volumes: CollectionConfig = {
  slug: 'volumes',
  access: {
    create: editor,
    delete: editor,
    read: authenticatedOrPublished,
    update: editor,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'volumeNumber', 'publishedAt', 'description'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'volumes',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'volumes',
        req,
      }),
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
              name: 'volumeNumber',
              type: 'number',
              admin: {
                position: 'sidebar',
              },
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
            },
            {
              name: 'introduction',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    AlignFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock, SquiggleRule] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                    UnorderedListFeature(),
                    OrderedListFeature(),
                    IndentFeature(),
                    BlockquoteFeature(),
                  ]
                },
              }),
              label: 'Introduction',
            },
            {
              name: 'editorsNote',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    AlignFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock, SquiggleRule] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                    UnorderedListFeature(),
                    OrderedListFeature(),
                    IndentFeature(),
                    BlockquoteFeature(),
                  ]
                },
              }),
              label: "Editor's Note",
            },
            {
              name: 'articles',
              type: 'relationship',
              hasMany: true,
              relationTo: 'articles',
              admin: {
                description: 'Select and order articles for this volume',
                allowCreate: false,
                isSortable: true,
              },
              validate: checkArticles,
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
        {
          name: 'layout',
          label: 'Layout',
          fields: [
            {
              type: 'blocks',
              name: 'content',
              blocks: [VolumeIntroduction, EditorsNote, ArticleCardsGrid, SquiggleRule],
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
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
    ...numberSlugField('volumeNumber'),
  ],
  hooks: {
    afterChange: [revalidateArticle, pushToWebhooks],
    afterDelete: [revalidateDelete],
    beforeChange: [setDefaultSeoTitle],
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
