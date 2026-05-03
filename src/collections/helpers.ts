import type { CollectionBeforeChangeHook, CollectionConfig, FieldHook, TypeWithID } from "payload"

import { generatePreviewPath } from "@/utilities/generatePreviewPath"

export const draftVersions: NonNullable<CollectionConfig["versions"]> = {
  drafts: {
    autosave: true,
    schedulePublish: true,
  },
  maxPerDoc: 50,
}

export function previewAdminConfig(
  collection: "articles" | "pages" | "volumes",
): Pick<NonNullable<CollectionConfig["admin"]>, "livePreview" | "preview"> {
  return {
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection,
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection,
        req,
      }),
  }
}

export const setCreatedBy =
  <TData extends TypeWithID & { createdBy?: unknown }>(): CollectionBeforeChangeHook<TData> =>
  ({ data, operation, req }) => {
    if (operation === "create" && req.user) {
      data.createdBy = req.user.id
      return data
    }
  }

export const setPublishedAtDefault: FieldHook = ({ siblingData, value }) => {
  if (siblingData?._status === "published" && !value) {
    return new Date().toISOString()
  }

  return value
}
