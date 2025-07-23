import { admin } from '@/access/admins'
import { type Webhook } from '@/payload-types'
import { type FieldHookArgs, type CollectionConfig } from 'payload'

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
      type: 'number',
      name: 'mostRecentPushed',
      label: 'Most Recent',
      hooks: {
        afterRead: [
          (ctx: FieldHookArgs<Webhook, unknown, { pushed: { volumeNumber: number }[] }>): number =>
            Math.max(...(ctx.siblingData.pushed?.map((v) => v.volumeNumber) ?? [0])),
        ],
      },
    },
    {
      name: 'pushed',
      type: 'array',
      labels: {
        plural: 'volumes',
        singular: 'volume',
      },
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
