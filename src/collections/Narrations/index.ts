import type { CollectionConfig } from "payload"
import path from "path"
import { fileURLToPath } from "url"

import { anyone } from "@/access/anyone"
import { editorOrSelf } from "@/access/editorOrSelf"
import { writer } from "@/access/writer"

import { setCreatedBy } from "./hooks/setCreatedBy"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Narrations: CollectionConfig = {
  slug: "narrations",
  access: {
    create: writer,
    delete: editorOrSelf,
    read: anyone,
    update: editorOrSelf,
  },
  admin: {
    defaultColumns: ["filename", "narrator", "updatedAt"],
    useAsTitle: "filename",
  },
  fields: [
    {
      name: "narrator",
      type: "text",
      admin: {
        description: "Name of the person who recorded this narration",
      },
    },
    {
      name: "transcript",
      type: "textarea",
      admin: {
        description: "Plain text transcript for accessibility",
      },
    },
    {
      name: "duration",
      type: "number",
      admin: {
        description: "Duration in seconds (auto-populated from the audio file)",
        components: {
          Field: "@/collections/Narrations/components/DurationField#DurationField",
        },
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
    beforeChange: [setCreatedBy],
  },
  upload: {
    staticDir: path.resolve(dirname, "../../../public/media"),
    disableLocalStorage: process.env.USE_LOCAL_STORAGE !== "true",
    mimeTypes: ["audio/*"],
  },
}
