import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { editor } from '@/access/editor'
import { anyone } from '@/access/anyone'

export const Tags: CollectionConfig = {
  slug: 'tags',
  access: {
    create: editor,
    delete: editor,
    read: anyone,
    update: editor,
  },
  admin: {
    defaultColumns: ['name', 'slug', 'updatedAt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description for this tag',
      },
    },
    slugField({ useAsSlug: 'name' }),
  ],
}