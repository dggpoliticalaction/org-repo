import type { GlobalConfig } from 'payload'

import { colorPicker } from '@/fields/colorPicker'
import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
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
