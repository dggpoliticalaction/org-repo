import type { Block, Field } from 'payload'

const donationMethods: Field[] = [
  {
    name: 'label',
    type: 'text',
    required: true,
    admin: {
      width: '50%',
    },
  },
  {
    name: 'description',
    type: 'textarea',
    admin: {
      width: '50%',
    },
  },
  {
    name: 'url',
    type: 'text',
    label: 'URL or Instructions',
    required: true,
  },
]

export const Donate: Block = {
  slug: 'donate',
  interfaceName: 'DonateBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Support Our Mission',
      label: 'Section Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'donationMethods',
      type: 'array',
      label: 'Donation Methods',
      minRows: 1,
      fields: donationMethods,
    },
  ],
}