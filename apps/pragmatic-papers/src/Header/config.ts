import type { GlobalConfig } from 'payload'

import { adminFieldLevel } from '@/access/admins'
import { menu } from '../blocks/Menu/config'
import { revalidateHeader } from './hooks/revalidateHeader'
import { colorPicker } from '@/fields/colorPicker'
import { link } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: adminFieldLevel,
  },
  fields: [
    menu({
      name: 'primaryMenu',
      label: 'Primary Menu',
      labels: { singular: 'Menu Item', plural: 'Menu Items' },
    }),
    menu({
      name: 'secondaryMenu',
      label: 'Secondary Menu',
      labels: { singular: 'Menu Item', plural: 'Menu Items' },
    }),
    {
      name: 'actionButton',
      label: 'Action Button',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          label: 'Enable Button',
          type: 'checkbox',
          defaultValue: false,
          required: true,
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_data, siblingData) => Boolean(siblingData?.enabled),
            },
          },
        }),
        {
          type: 'row',
          admin: {
            condition: (_data, siblingData) => Boolean(siblingData?.enabled),
          },
          fields: [
            colorPicker({ overrides: { name: 'backgroundColor', label: 'Background Color' } }),
            colorPicker({ overrides: { name: 'textColor', label: 'Text Color' } }),
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
