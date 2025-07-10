import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { writer } from '@/access/writer'
import { editorOrSelf } from '@/access/editorOrSelf'

import type { Media as MediaType } from '@/payload-types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: writer,
    delete: editorOrSelf,
    read: anyone,
    update: editorOrSelf,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      access: {
        update: () => false,
      },
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      (args: Parameters<CollectionBeforeChangeHook<MediaType>>[0]): Partial<MediaType> | void => {
        const { req, operation, data } = args
        if (operation === 'create') {
          if (req.user) {
            data.createdBy = req.user.id
            return data
          }
        }
      },
    ],
  },
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),

    adminThumbnail: ({ doc }: { doc: unknown }) => {
      return `${(doc as MediaType).sizes?.thumbnail?.url ?? ''}`
    },
    formatOptions: {
      format: 'webp',
    },
    focalPoint: true,
    disableLocalStorage: process.env.NODE_ENV === 'production',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        formatOptions: {
          format: 'webp',
        },
        withoutEnlargement: false,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
        formatOptions: {
          format: 'webp',
        },
        withoutEnlargement: false,
      },
      {
        name: 'small',
        width: 600,
        formatOptions: {
          format: 'webp',
        },
        withoutEnlargement: false,
      },
      {
        name: 'medium',
        width: 900,
        formatOptions: {
          format: 'webp',
        },
        withoutEnlargement: false,
      },
      {
        name: 'large',
        width: 1400,
        formatOptions: {
          format: 'webp',
        },
        withoutEnlargement: false,
      },
      {
        name: 'xlarge',
        width: 1920,
        formatOptions: {
          format: 'webp',
        },
        withoutEnlargement: false,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
        formatOptions: {
          format: 'jpeg',
        },
        withoutEnlargement: false,
      },
    ],
  },
}
