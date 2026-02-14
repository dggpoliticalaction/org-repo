import { adminFieldLevel } from '@/access/admins'
import { menu } from '@/blocks/Menu/config'
import { colorPicker } from '@/fields/colorPicker'
import { link } from '@/fields/link'
import { revalidateHeader } from '@/Header/hooks/revalidateHeader'
import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: adminFieldLevel,
  },
  fields: [
    menu({
      name: 'navItems',
      label: 'Navigation Items',
      maxRows: 12,
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
