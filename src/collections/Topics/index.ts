import { anyone, editor, writer } from "@/access"
import { seoTab } from "@/fields/seoTab"
import type { CollectionConfig } from "payload"
import { slugField } from "payload"

export const Topics: CollectionConfig = {
  slug: "topics",
  access: {
    create: writer,
    delete: editor,
    read: anyone,
    update: editor,
  },
  admin: {
    defaultColumns: ["name", "slug", "updatedAt"],
    useAsTitle: "name",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "name",
              type: "text",
              required: true,
              unique: true,
            },
            {
              name: "description",
              type: "textarea",
              admin: {
                description: "Optional description for this topic",
              },
            },
          ],
        },
        seoTab(),
      ],
    },
    slugField({ useAsSlug: "name" }),
  ],
}
