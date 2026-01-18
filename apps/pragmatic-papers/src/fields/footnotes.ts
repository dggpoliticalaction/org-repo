import { link } from '@/fields/link2'
import type { Field } from 'payload'

export const footnoteFields: Field[] = [
  {
    name: 'note',
    type: 'textarea',
    required: true,
    admin: {
      description: 'Footnote text.',
      placeholder: 'Enter footnote text here...',
      rows: 3,
    },
  },
  {
    name: 'index',
    type: 'number',
    admin: {
      hidden: true,
      description: 'Auto-generated on save.',
      readOnly: true,
    },
  },
  {
    name: 'attributionEnabled',
    label: 'Enable Attribution',
    type: 'checkbox',
    defaultValue: false,
    required: true,
    admin: {
      description: 'Optionally add a source link to the footnote.',
    },
  },
  link({
    label: 'Attribution Link',
    admin: {
      condition: (_data, siblingData) => Boolean(siblingData?.attributionEnabled),
    },
    required: true,
    component: {
      type: {
        defaultValue: 'custom',
      },
      newTab: {
        defaultValue: true,
      },
      label: {
        admin: {
          hidden: true,
        },
        required: false,
      },
    },
  }),
]

export const footnotes = (): Field => ({
  name: 'footnotes',
  interfaceName: 'Footnotes',
  type: 'array',
  access: {
    update: () => false,
  },
  admin: {
    readOnly: true,
    hidden: true,
  },
  fields: footnoteFields,
})
