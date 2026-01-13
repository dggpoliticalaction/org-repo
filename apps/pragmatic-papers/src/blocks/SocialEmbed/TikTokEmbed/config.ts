import type { Block } from 'payload'

/**
 * Legacy config for TikTok embeds.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const LegacyTikTokEmbed: Block = {
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
