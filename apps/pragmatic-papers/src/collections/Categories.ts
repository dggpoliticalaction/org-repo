import type { CollectionConfig } from "payload"

import { slugField } from "payload"
import { anyone } from "../access/anyone"
import { authenticated } from "../access/authenticated"

export const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: "title",
    hidden: true, // TODO: Remove collection from repo
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    slugField(),
  ],
}
