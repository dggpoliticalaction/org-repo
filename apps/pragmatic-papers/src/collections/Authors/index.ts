import type { Access, CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  IndentFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { admin } from '@/access/admins'
import { isAdmin } from '@/access/checkRole'
import type { Author as AuthorType, User } from '@/payload-types'

const createOwnAuthorOrAdmin: Access = ({ req, data }) => {
  if (!req.user) return false

  const currentUser = req.user as User

  if (isAdmin(currentUser)) return true

  const userField = (data as { user?: unknown } | undefined)?.user

  // When the admin UI first checks access, `data` can be undefined or `user` may be unset.
  // In that case, allow the create action and enforce ownership in a beforeChange hook.
  if (!userField) return true

  const userId =
    typeof userField === 'object' && userField !== null
      ? // @ts-expect-error - relationship objects are not fully typed here
        userField.id
      : userField

  return userId === currentUser.id
}

const updateOwnAuthorOrAdmin: Access = ({ req }) => {
  if (!req.user) return false

  if (isAdmin(req.user as User)) return true

  return {
    user: {
      equals: req.user.id,
    },
  }
}

export const Authors: CollectionConfig = {
  slug: 'authors',
  access: {
    create: createOwnAuthorOrAdmin,
    delete: admin,
    read: () => true,
    update: updateOwnAuthorOrAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'affiliation'],
  },
  hooks: {
    beforeChange: [
      (
        args: Parameters<CollectionBeforeChangeHook<AuthorType>>[0],
      ): Partial<AuthorType> | void => {
        const { data, req, operation } = args
        if (!req.user) return data

        const currentUser = req.user as User

        // For non-admins creating an author, always force the `user` field to themselves
        if (operation === 'create' && !isAdmin(currentUser)) {
          return {
            ...data,
            user: currentUser.id,
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Used for the public URL, e.g. /authors/jane-doe',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Link to the underlying user account. Used to look up authored articles.',
        position: 'sidebar',
      },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'affiliation',
      type: 'text',
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
    {
      name: 'socialLinks',
      type: 'array',
      required: false,
      admin: {
        description: 'Optional social or personal links for this author.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: false,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
}
