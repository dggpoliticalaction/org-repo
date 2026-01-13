import type { Block } from 'payload'

/**
 * Legacy config for YouTube embeds.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const LegacyYouTubeEmbed: Block = {
  slug: 'youtubeEmbed',
  interfaceName: 'YouTubeEmbedBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
}
