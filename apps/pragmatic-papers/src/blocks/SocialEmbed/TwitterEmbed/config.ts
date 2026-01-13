import type { Block } from 'payload'

/**
 * Legacy config for Twitter embeds.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const LegacyTwitterEmbed: Block = {
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
  ],
}
