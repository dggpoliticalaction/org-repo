import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

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
import type { User } from '@/payload-types'
import { authorSlugFromNameAndId } from '@/utilities/authorSlug'
import { link } from '@/fields/link'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: admin,
    delete: admin,
    // Read access is split:
    // - Authenticated users: full access (subject to field-level rules)
    // - Public: only author-type accounts (writers, editors, chief-editors)
    //   so that /authors pages can query without overrideAccess.
    read: ({ req }) => {
      const user = req.user as User | undefined

      if (user) return true

      return {
        // Never expose admins as authors on public endpoints.
        role: {
          in: ['writer', 'editor', 'chief-editor'],
        },
      }
    },
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
      name: 'authorSlug',
      type: 'text',
      unique: true,
      required: false,
      admin: {
        position: 'sidebar',
        // Admin accounts are never treated as authors; this slug only applies to
        // writer/editor accounts that should have a public /authors/{slug} page.
        description: 'Slug used for the public author URL, e.g. /authors/jane-doe',
        // Only non-admins can have an author slug
        condition: ({ id, role }) => Boolean(id) && role !== 'admin',
      },
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
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        condition: ({ id }) => Boolean(id),
      },
    },
    {
      name: 'affiliation',
      type: 'text',
      required: false,
      admin: {
        condition: ({ id }) => Boolean(id),
      },
    },
    {
      name: 'socialLinks',
      label: 'Social Links',
      type: 'array',
      required: false,
      maxRows: 6,
      admin: {
        description: 'Optional social or personal links for this author.',
        condition: ({ id }) => Boolean(id),
      },
      fields: [
        link({
          appearances: false,
        }),
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
    // Security-sensitive auth fields should never be exposed via public reads.
    {
      name: 'hash',
      type: 'text',
      access: {
        read: () => false,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'salt',
      type: 'text',
      access: {
        read: () => false,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'resetPasswordToken',
      type: 'text',
      access: {
        read: () => false,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'resetPasswordExpiration',
      type: 'date',
      access: {
        read: () => false,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'loginAttempts',
      type: 'number',
      access: {
        read: () => false,
      },
      admin: {
        disabled: true,
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      (args: Parameters<CollectionBeforeChangeHook<User>>[0]): Partial<User> | void => {
        const { data } = args

        if (!data) return data

        const userData = data as Partial<User>

        // Admin accounts should never have an author slug exposed
        if (userData.role === 'admin') {
          userData.authorSlug = null
          return userData
        }

        // Only auto-generate an author slug for writers; for other roles
        // (chief-editor, editor, user) the slug should be explicitly set.
        if (userData.role === 'writer') {
          if (!userData.authorSlug || typeof userData.authorSlug !== 'string') {
            const slug = authorSlugFromNameAndId(
              (userData.name as string | null | undefined) ?? null,
              (userData.id as number | null | undefined) ?? null,
            )
            userData.authorSlug = slug
          }
        }

        return userData
      },
    ],
  },
}
