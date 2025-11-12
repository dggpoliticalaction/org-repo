import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Upload a logo image to display in the header',
      },
    },
    {
      name: 'organizationName',
      type: 'text',
      required: false,
      defaultValue: 'DGG Political Action',
      admin: {
        description: 'Organization name to display in the header',
      },
    },
    {
      name: 'stickyHeader',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Enable sticky header that stays at the top when scrolling',
      },
    },
    {
      name: 'discordLink',
      type: 'text',
      required: false,
      admin: {
        description: 'Discord invite link (leave empty to link to homepage)',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}