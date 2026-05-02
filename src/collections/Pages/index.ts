import type { CollectionConfig } from "payload"

import { admin, authenticatedOrPublished } from "@/access"
import { CollectionGrid } from "@/blocks/CollectionGrid/config"
import { CallToAction } from "@/blocks/CallToAction/config"
import { Content } from "@/blocks/Content/config"
import { Contributors } from "@/blocks/Contributors/config"
import { FormBlock } from "@/blocks/Form/config"
import { MediaBlock } from "@/blocks/MediaBlock/config"
import { Timeline } from "@/blocks/Timeline/config"
import { VolumeView } from "@/blocks/VolumeViewBlock/config"
import {
  draftVersions,
  previewAdminConfig,
  seoTab,
  setPublishedAtDefault,
} from "@/collections/helpers"
import { hero } from "@/heros/config"
import { slugField } from "payload"
import { revalidateDelete, revalidatePage } from "./hooks/revalidatePage"

export const Pages: CollectionConfig<"pages"> = {
  slug: "pages",
  access: {
    create: admin,
    delete: admin,
    read: authenticatedOrPublished,
    update: admin,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ["title", "slug", "updatedAt"],
    ...previewAdminConfig("pages"),
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      type: "tabs",
      tabs: [
        {
          fields: [hero],
          label: "Hero",
        },
        {
          fields: [
            {
              name: "layout",
              type: "blocks",
              blocks: [
                CollectionGrid,
                CallToAction,
                Content,
                Contributors,
                MediaBlock,
                Timeline,
                VolumeView,
                FormBlock,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: "Content",
        },
        seoTab(),
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeChange: [setPublishedAtDefault],
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
  versions: draftVersions,
}
