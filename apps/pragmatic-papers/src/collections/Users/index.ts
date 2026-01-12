import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
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
import { writerFieldLevel } from '@/access/writer'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: writerFieldLevel,
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
      name: 'name',
      type: 'text',
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
    {
      name: 'role',
      type: 'select',
      saveToJWT: true,
      defaultValue: 'member',
      access: {
        update: adminFieldLevel,
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
          label: 'Member',
          value: 'member',
        },
      ],
    },
  ],
  timestamps: true,
}
