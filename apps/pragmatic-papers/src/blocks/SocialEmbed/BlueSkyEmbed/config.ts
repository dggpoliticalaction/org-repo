import type { Block } from 'payload'

/**
 * Legacy config for Bluesky embeds.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const LegacyBlueSkyEmbed: Block = {
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
