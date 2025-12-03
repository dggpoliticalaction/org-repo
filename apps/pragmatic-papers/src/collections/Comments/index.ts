import type { CollectionConfig, CollectionBeforeChangeHook, FieldAccess } from 'payload'

import { editor } from '@/access/editor'
import { canCreateComment } from './access/canCreateComment'
import { readApprovedOrOwn } from './access/readApprovedOrOwn'

export const Comments: CollectionConfig = {
  slug: 'comments',
  access: {
    create: canCreateComment,
    read: readApprovedOrOwn,
    update: editor,
    delete: editor,
  },
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'article', 'authorName', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 2000,
      admin: {
        description: 'Comment content (max 2000 characters)',
      },
    },
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
      index: true,
      admin: {
        description: 'The article this comment belongs to',
      },
      access: {
        create: () => true,
        update: () => false,
      },
    },
    // For authenticated users
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        condition: (data) => !!data?.author,
        description: 'Authenticated user who wrote this comment',
      },
    },
    // For anonymous users
    {
      name: 'authorName',
      type: 'text',
      admin: {
        condition: (data) => !data?.author,
        description: 'Name for anonymous commenter',
      },
    },
    {
      name: 'authorEmail',
      type: 'email',
      admin: {
        condition: (data) => !data?.author,
        description: 'Email for anonymous commenter',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'approved',
      options: [
        { label: 'Approved', value: 'approved' },
        { label: 'Pending', value: 'pending' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Moderation status of this comment',
      },
      access: {
        update: (({ req }) => {
          if (req.user && (req.user.role === 'admin' || req.user.role === 'editor')) {
            return true
          }
          return false
        }) as FieldAccess,
      },
    },
  ],
  hooks: {
    beforeChange: [
      (async ({ req, operation, data }) => {
        // Auto-set author for authenticated users
        if (operation === 'create' && req.user) {
          data.author = req.user.id
          // Clear anonymous fields if authenticated
          delete data.authorName
          delete data.authorEmail
        }
        return data
      }) as CollectionBeforeChangeHook,
    ],
  },
  timestamps: true,
}
