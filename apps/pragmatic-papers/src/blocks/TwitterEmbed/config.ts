import type { Block } from 'payload'

export const TwitterEmbed: Block = {
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
    {
      name: 'align',
      type: 'radio',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      defaultValue: 'none'
    },
    {
      name: 'lang',
      type: 'text',
      maxLength: 2,
      defaultValue: 'en',
      required: true
    },
    {
      name: 'maxWidth',
      type: 'number',
      min: 220,
      max: 550,
      defaultValue: 550,
      required: true
    },
  ]
}