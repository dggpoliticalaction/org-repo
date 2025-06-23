import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { numberSlugField } from '@/fields/numberSlug'

export const Volumes: CollectionConfig = {
  slug: 'volumes',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'volumeNumber',
      type: 'number',
      required: true,
    },
    {
      name: 'attachedArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
    },
    ...numberSlugField('volumeNumber'),
  ],
}
