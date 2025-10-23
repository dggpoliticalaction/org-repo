import type { GlobalConfig } from 'payload'

export const HomepageSettings: GlobalConfig = {
  slug: 'homepage-settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'numberOfPosts',
      type: 'number',
      required: true,
      defaultValue: 12,
      min: 1,
      max: 20,
      admin: {
        description: 'Number of recent posts to display on the homepage',
      },
    },
    {
      name: 'missionStatement',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Mission statement text displayed in the hero section',
      },
    },
  ],
}