import type { CollectionConfig } from 'payload'

import { adminOrSelf } from '@/access/adminOrSelf'
import { admin, adminFieldLevel } from '@/access/admins'
import { writerFieldLevel } from '@/access/writer'
import { betterAuthStrategy } from '@/utilities/auth'
import {
  FixedToolbarFeature,
  HeadingFeature,
  IndentFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import { authenticated } from '../../access/authenticated'

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
  auth: {
    strategies: [
      {
        name: 'better-auth',
        authenticate: betterAuthStrategy,
      },
    ],
  },
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
      defaultValue: 'user',
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
          label: 'User',
          value: 'user',
        },
      ],
    },
    {
      name: 'oauth',
      type: 'array',
      fields: [
        { name: 'provider', type: 'text', required: true },
        { name: 'providerAccountId', type: 'text', index: true, required: true },
        { name: 'picture', type: 'text' },
      ],
      required: false,
    },
  ],
  timestamps: true,
}
