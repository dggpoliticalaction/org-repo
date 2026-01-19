import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateResource, revalidateResourceDelete } from './hooks/revalidateResource'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from '@/fields/slug'

export const Resources: CollectionConfig<'resources'> = {
  slug: 'resources',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    resourceType: true,
    resourceCategories: true,
    thumbnail: true,
    description: true,
  },
  admin: {
    defaultColumns: ['title', 'resourceType', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'resources',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'resources',
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
      name: 'resourceType',
      type: 'select',
      required: true,
      defaultValue: 'document',
      options: [
        { label: 'Document', value: 'document' },
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Link', value: 'link' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional thumbnail image for the resource card',
              },
            },
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (data) => data?.resourceType === 'document',
                description: 'Upload the document file (PDF, DOC, etc.)',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (data) => data?.resourceType === 'image',
                description: 'Upload the image/meme',
              },
            },
            {
              name: 'videoUrl',
              type: 'text',
              admin: {
                condition: (data) => data?.resourceType === 'video',
                description: 'YouTube or Vimeo video URL',
              },
            },
            {
              name: 'externalUrl',
              type: 'text',
              admin: {
                condition: (data) => data?.resourceType === 'link',
                description: 'External URL to link to',
              },
            },
          ],
        },
        {
          label: 'Meta',
          fields: [
            {
              name: 'resourceCategories',
              type: 'relationship',
              hasMany: true,
              relationTo: 'resource-categories',
              admin: {
                position: 'sidebar',
              },
            },
          ],
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
              hasGenerateFn: true,
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
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidateResource],
    afterDelete: [revalidateResourceDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
