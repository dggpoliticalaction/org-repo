import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import {
  FixedToolbarFeature,
  HeadingFeature,
  IndentFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import { admin, adminFieldLevel } from '@/access/admins'
import { adminOrSelf } from '@/access/adminOrSelf'
import { MetaDescriptionField, MetaImageField, MetaTitleField } from '@payloadcms/plugin-seo/fields'
import { type User } from '@/payload-types'
import { slugField } from '@/fields/slug'
import { revalidateDelete, revalidateUser } from './hooks/revalidateUser'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: admin,
    delete: admin,
    read: authenticated,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'role', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'name',
              type: 'text',
            },
            {
              type: 'collapsible',
              label: 'Socials',
              fields: [
                {
                  name: 'socialTwitter',
                  type: 'text',
                  label: 'Twitter',
                  admin: {
                    placeholder: '@TheOmniLiberal',
                  },
                },
                {
                  name: 'socialReddit',
                  type: 'text',
                  label: 'Reddit',
                  admin: {
                    placeholder: 'u/greatwhiteterr',
                  },
                },
                {
                  name: 'socialInstagram',
                  type: 'text',
                  label: 'Instagram',
                  admin: {
                    placeholder: 'u/greatwhiteterr',
                  },
                },
                {
                  name: 'socialTiktok',
                  type: 'text',
                  label: 'TikTok',
                  admin: {
                    placeholder: 'https://www.tiktok.com/@username',
                  },
                },
                {
                  name: 'socialYoutube',
                  type: 'text',
                  label: 'YouTube',
                  admin: {
                    placeholder: 'https://www.youtube.com/@BernieSanders',
                  },
                },
              ],
            },
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
            {
              name: 'biography',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    OrderedListFeature(),
                    UnorderedListFeature(),
                    IndentFeature(),
                  ]
                },
              }),
              required: false,
            },
          ],
        },
        {
          name: 'meta',
          label: 'Meta',
          fields: [
            {
              name: 'publishPage',
              type: 'checkbox',
              label: 'Publish Page',
              defaultValue: false,
              admin: {
                description: 'Uncheck to hide this page from the public',
              },
            },
            MetaTitleField({
              hasGenerateFn: true,
              overrides: {
                hidden: true,
              },
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
          ],
        },
      ],
    },
    {
      name: 'role',
      type: 'select',
      saveToJWT: true,
      defaultValue: 'user',
      access: {
        update: adminFieldLevel,
      },
      admin: {
        position: 'sidebar',
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Chief Editor',
          value: 'chief-editor',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Writer',
          value: 'writer',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
    },
    ...slugField('name'),
  ],
  hooks: {
    beforeChange: [
      (args: Parameters<CollectionBeforeChangeHook<User>>[0]): Partial<User> | void => {
        const { data } = args
        if (!data.meta) {
          data.meta = {}
        }
        data.meta.title = data.name + ' | Pragmatic Papers'
        return data
      },
    ],
    afterChange: [revalidateUser],
    afterDelete: [revalidateDelete],
  },
  timestamps: true,
}
