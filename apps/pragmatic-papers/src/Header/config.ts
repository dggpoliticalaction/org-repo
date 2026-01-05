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
      name: 'callToActionButton',
      label: 'Call to Action Button',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          label: 'Enable Call to Action Button',
          type: 'checkbox',
          defaultValue: false,
        },
        link({
          appearances: false,
          // disableLabel: true,
        }),
        {
          type: 'row',
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
