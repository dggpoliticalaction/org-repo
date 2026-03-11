import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { editor } from '@/access/editor'
import { anyone } from '@/access/anyone'
import { writer } from '@/access/writer'

export const Topics: CollectionConfig = {
  slug: 'topics',
  access: {
    create: writer,
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
        description: 'Optional description for this topic',
      },
    },
    slugField({ useAsSlug: 'name' }),
  ],
}