import { colorPicker } from '@/fields/colorPicker'
import { link } from '@/fields/link'
import type { GroupField } from 'payload'

export const actionButton: GroupField = {
  name: 'actionButton',
  label: 'Action Button',
  type: 'group',
  fields: [
    {
      name: 'enabled',
      label: 'Enable',
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
}
