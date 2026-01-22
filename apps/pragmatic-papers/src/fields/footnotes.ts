import { link } from '@/fields/link2'
import type { Article, LinkField } from '@/payload-types'
import type { ArrayField, Field, FieldHookArgs, TextField, ValidateOptions } from 'payload'

export const footnoteFields = (): Field[] => ([
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
        validate: (_value: string | null | undefined, { siblingData }: ValidateOptions<Article, LinkField, TextField, string>) => Boolean(siblingData?.url) || Boolean(siblingData?.reference?.value) || "URL Label is required",
        hooks: {
          beforeChange: [({ siblingData: { url, reference } }: FieldHookArgs<Article, string, LinkField>) => url ?? typeof reference?.value === 'number' ? reference?.value : reference?.value?.id],
        },
      },
    },
  }),
])

export const footnotesArrayField = (): ArrayField => ({
  name: 'footnotes',
  interfaceName: 'FootnotesField',
  type: 'array',
  fields: footnoteFields(),
  access: {
    update: () => false,
  },
  admin: {
    readOnly: true,
    hidden: true,
  },
})
