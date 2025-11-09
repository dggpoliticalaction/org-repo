import type { Block } from 'payload'

export const RedditEmbed: Block = {
  slug: 'redditEmbed',
  interfaceName: 'RedditEmbedBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
    }
  ]
}