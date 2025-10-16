import type { Block } from 'payload'

export const Footnotes: Block = {
  slug: 'footnoteBlock',
  interfaceName: 'FootnotesBlock',
  fields: [
    {
      name: 'footnotes',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'richText',
        },
      ],
    },
  ],
}

export const FootnoteSelectBlock: Block = {
  slug: 'footnoteLink',
  interfaceName: 'FootnoteSelect',
  fields: [
    {
      name: 'footnoteId',
      type: 'select',
      options: [{ label: 'default', value: '' }],
      admin: {
        components: {
          Field: '@/blocks/Footnotes/FootnoteSelect',
        },
      },
    },
  ],
}
