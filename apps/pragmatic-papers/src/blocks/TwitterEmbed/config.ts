import type { Block } from 'payload'

export const TwitterEmbed: Block = {
  slug: 'twitterEmbed',
  interfaceName: 'TwitterEmbedBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'hideMedia',
      type: 'checkbox',
    },
    {
      name: 'hideThread',
      type: 'checkbox',
      
    },
  ]
}
