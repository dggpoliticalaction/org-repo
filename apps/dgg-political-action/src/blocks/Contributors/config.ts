import type { Block } from 'payload'

export const Contributors: Block = {
  slug: 'contributors',
  interfaceName: 'ContributorsBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Our Contributors',
      label: 'Section Title',
    },
    {
      name: 'contributors',
      type: 'array',
      label: 'Contributors',
      minRows: 1,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Name',
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'Bio',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Profile Image',
        },
        {
          name: 'socialLinks',
          type: 'array',
          label: 'Social Media Links',
          dbName: 'social',
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              dbName: 'plat',
              options: [
                { label: 'GitHub', value: 'github' },
                { label: 'Twitter/X', value: 'twitter' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'Website', value: 'website' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'URL',
            },
          ],
        },
      ],
    },
  ],
}
