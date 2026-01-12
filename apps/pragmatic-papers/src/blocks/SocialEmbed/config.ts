import { detectSocialPlatform } from '@/utilities/detectSocialPlatform'
import type { Block } from 'payload'

export const SocialEmbed: Block = {
  slug: 'socialEmbed',
  interfaceName: 'SocialEmbedBlock',
  labels: {
    singular: 'Social Embed',
    plural: 'Social Embeds',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'URL',
      admin: {
        description: 'Paste a Twitter/X, YouTube, Reddit, BlueSky, or TikTok URL.',
        components: {
          Field: {
            path: '@/blocks/SocialEmbed/URLField#URLField',
          },
        },
      },
    },
    {
      name: 'hideMedia',
      type: 'checkbox',
      label: 'Hide Media',
      admin: {
        condition: (_: Record<string, unknown>, siblingData: Record<string, unknown>): boolean => {
          if (!siblingData?.url) return false
          return detectSocialPlatform(siblingData.url as string) === 'twitter'
        },
      },
    },
    {
      name: 'hideThread',
      type: 'checkbox',
      label: 'Hide Thread',
      admin: {
        condition: (_: Record<string, unknown>, siblingData: Record<string, unknown>): boolean => {
          if (!siblingData?.url) return false
          return detectSocialPlatform(siblingData.url as string) === 'twitter'
        },
      },
    },
  ],
}
