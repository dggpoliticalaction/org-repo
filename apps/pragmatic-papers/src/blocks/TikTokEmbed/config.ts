import type { Block } from 'payload'

export const TikTokEmbed: Block = {
  slug: 'tiktokEmbed',
  interfaceName: 'TikTokEmbedBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
}
