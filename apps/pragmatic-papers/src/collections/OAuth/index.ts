import { CollectionConfig } from 'payload'

export const Connections: CollectionConfig = {
  slug: 'connections',
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'provider',
      type: 'text',
      required: true,
    },
    {
      name: 'providerAccountId',
      type: 'text',
      required: true,
    },
    { name: 'email', type: 'email' },
    {
      name: 'picture',
      type: 'text',
    },
  ],
}
