import type { Block } from 'payload'
import { detectSocialPlatform } from '@/utilities/detectSocialPlatform'

export const SocialEmbed: Block = {
  slug: 'socialEmbed',
  interfaceName: 'SocialEmbedBlock',
  labels: {
    singular: 'Social Media Embed',
    plural: 'Social Media Embeds',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'URL',
      admin: {
        description:
          'Enter a URL from Twitter/X, YouTube, Reddit, BlueSky, or TikTok. The platform will be automatically detected.',
      },
    },
    {
      name: 'hideMedia',
      type: 'checkbox',
      label: 'Hide Media',
      admin: {
        description: 'Only applies to Twitter/X embeds',
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
        description: 'Only applies to Twitter/X embeds',
        condition: (_: Record<string, unknown>, siblingData: Record<string, unknown>): boolean => {
          if (!siblingData?.url) return false
          return detectSocialPlatform(siblingData.url as string) === 'twitter'
        },
      },
    },
  ],
}
