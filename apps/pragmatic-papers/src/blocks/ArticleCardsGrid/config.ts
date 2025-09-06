import type { Block } from 'payload'

export const ArticleCardsGrid: Block = {
  slug: 'articleCardsGrid',
  interfaceName: 'ArticleCardsGrid',
  fields: [
    {
      name: 'articles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      admin: {
        description:
          "Select articles to display in the grid. If left empty, will use the volume's articles.",
        allowCreate: false,
        isSortable: true,
      },
      required: false,
    },
  ],
  admin: {
    disableBlockName: true,
  },
  labels: {
    singular: 'Article Cards Grid',
    plural: 'Article Cards Grids',
  },
}
