import type { Block } from 'payload'

/**
 * Legacy config for Bluesky embeds.
 * @deprecated Use the SocialEmbed block instead.
 * @see SocialEmbedBlock
 */
export const LegacyBlueSkyEmbed: Block = {
  slug: 'blueSkyEmbed',
  // interfaceName: 'BlueSkyEmbedBlock',
  labels: {
    singular: 'BlueSky Embed (Legacy)',
    plural: 'BlueSky Embeds (Legacy)',
  },
  admin: {
    group: 'Legacy',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
}
