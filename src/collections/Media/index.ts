import type { CollectionConfig } from "payload"

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical"
import path from "path"
import { fileURLToPath } from "url"

import { anyone, editorOrSelf, writer } from "@/access"
import { setCreatedBy } from "@/collections/helpers"

import type { Media as MediaType } from "@/payload-types"
import { regenerateBlurHandler } from "./endpoints/regenerateBlur"
import { generateBlurDataUrl } from "./hooks/generateBlurDataUrl"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: "media",
  endpoints: [
    {
      path: "/:id/regenerate-blur",
      method: "post",
      handler: regenerateBlurHandler,
    },
  ],
  access: {
    create: writer,
    delete: editorOrSelf,
    read: anyone,
    update: editorOrSelf,
  },
  admin: {
    defaultColumns: ["filename", "alt", "caption"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      //required: true,
    },
    {
      name: "caption",
      type: "richText",
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: "blurDataURL",
      type: "text",
      label: "Blur Placeholder",
      admin: {
        components: {
          Field: "@/collections/Media/components/BlurDataURLField#BlurDataURLField",
        },
        description: "Base64 encoded blur placeholder (auto-generated)",
      },
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
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
    beforeChange: [setCreatedBy<MediaType>(), generateBlurDataUrl],
  },
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, "../../../public/media"),
    adminThumbnail: ({ doc }: { doc: Partial<MediaType> }) =>
      doc.sizes?.thumbnail?.url || "thumbnail",
    formatOptions: {
      format: "webp",
    },
    focalPoint: true,
    // Disable local storage when NOT using local storage (i.e., when using S3)
    // For staging/preview: set USE_LOCAL_STORAGE=true to enable local file system
    // For production: set USE_LOCAL_STORAGE=false to use S3 and disable local storage
    disableLocalStorage: process.env.USE_LOCAL_STORAGE !== "true",
    imageSizes: [
      {
        name: "thumbnail",
        width: 300,
        formatOptions: {
          format: "webp",
        },
        withoutEnlargement: false,
      },
      {
        name: "square",
        width: 500,
        height: 500,
        formatOptions: {
          format: "webp",
        },
        withoutEnlargement: false,
      },
      {
        name: "small",
        width: 600,
        formatOptions: {
          format: "webp",
        },
        withoutEnlargement: false,
      },
      {
        name: "medium",
        width: 900,
        formatOptions: {
          format: "webp",
        },
        withoutEnlargement: false,
      },
      {
        name: "large",
        width: 1400,
        formatOptions: {
          format: "webp",
        },
        withoutEnlargement: false,
      },
      {
        name: "xlarge",
        width: 1920,
        formatOptions: {
          format: "webp",
        },
        withoutEnlargement: false,
      },
      {
        name: "og",
        width: 1200,
        height: 630,
        crop: "center",
        formatOptions: {
          format: "jpeg",
        },
        withoutEnlargement: false,
      },
    ],
  },
}
