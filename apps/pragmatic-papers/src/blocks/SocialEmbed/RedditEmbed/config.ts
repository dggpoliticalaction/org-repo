import type { Block } from 'payload'

/**
 * Legacy config for Reddit embeds.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const LegacyRedditEmbed: Block = {
  slug: 'redditEmbed',
  interfaceName: 'RedditEmbedBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
}
