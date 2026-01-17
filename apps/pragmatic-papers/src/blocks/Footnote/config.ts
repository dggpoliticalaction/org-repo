import { footnoteFields } from '@/fields/footnotes'
import type { Block } from 'payload'

export const FootnoteBlock: Block = {
  slug: 'footnote',
  interfaceName: 'FootnoteBlock',
  fields: footnoteFields,
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
