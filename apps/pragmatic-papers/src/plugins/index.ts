import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { seoPlugin } from '@payloadcms/plugin-seo'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Pragmatic Papers` : 'Pragmatic Papers'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
      admin: {
        hidden: true, // TODO: Setup redirects plugin
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
      admin: {
        hidden: true, // TODO: Setup form builder plugin
      },
    },
    formSubmissionOverrides: {
      admin: {
        hidden: true, // TODO: Setup form builder plugin
      },
    },
  }),
  vercelBlobStorage({
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    enabled: process.env.NODE_ENV === 'production',
    collections: {
      // If you have another collection that supports uploads, you can add it below
      media: true,
    },
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    token: process.env.BLOB_READ_WRITE_TOKEN,
  }),
  payloadCloudPlugin(),
]
