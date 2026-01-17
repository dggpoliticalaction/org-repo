import type { Block } from 'payload'

export const FootnoteBlock: Block = {
  slug: 'footnote',
  interfaceName: 'FootnoteBlock',
  fields: [
    {
      name: 'note',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Footnote text.',
      },
    },
    {
      name: 'index',
      type: 'number',
      admin: {
        description: 'Auto-generated on save.',
        readOnly: true,
      },
    },
  ],
  graphQL: {
    singularName: 'FootnoteBlock',
  },
  labels: {
    singular: 'Footnote',
    plural: 'Footnotes',
  },
  admin: {
    components: {
      Label: '@/blocks/Footnote/FootnoteLabel#FootnoteLabel',
    },
  },
}
