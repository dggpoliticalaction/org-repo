import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const EmailSignup: Block = {
  slug: 'emailSignup',
  interfaceName: 'EmailSignupBlock',
  fields: [
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Enable Intro Content',
      defaultValue: true,
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
    {
      name: 'successMessage',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Success Message',
      admin: {
        description: 'Message shown after successful subscription',
      },
    },
    {
      name: 'mailerliteFormActionUrl',
      type: 'text',
      label: 'MailerLite Form Action URL',
      admin: {
        description: 'Paste the form action URL from your MailerLite embed code',
      },
    },
    {
      name: 'testMode',
      type: 'checkbox',
      label: 'Enable Test Mode',
      defaultValue: false,
      admin: {
        description: 'Mocks a successful submit without calling MailerLite',
      },
    },
  ],
  graphQL: {
    singularName: 'EmailSignupBlock',
  },
  labels: {
    plural: 'Email Signup Blocks',
    singular: 'Email Signup',
  },
}
