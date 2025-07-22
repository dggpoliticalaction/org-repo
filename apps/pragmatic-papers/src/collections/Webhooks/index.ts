import { admin } from '@/access/admins'
import { type CollectionConfig } from 'payload'

export const Webhooks: CollectionConfig = {
  slug: 'webhooks',
  access: {
    create: admin,
    delete: admin,
    read: admin,
    update: admin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: false,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'latestVolume',
      type: 'number',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'pushed',
      type: 'array',
      fields: [
        {
          name: 'volumeNumber',
          type: 'number',
          admin: {
            readOnly: true,
            hidden: true,
          },
        },
      ],
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
  ],
}
