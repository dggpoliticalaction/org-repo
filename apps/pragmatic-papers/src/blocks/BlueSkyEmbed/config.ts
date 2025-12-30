import type { Block } from 'payload'

export const BlueSkyEmbed: Block = {
  slug: 'blueSkyEmbed',
  interfaceName: 'BlueSkyEmbedBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
}
