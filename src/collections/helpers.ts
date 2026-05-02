import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from "@payloadcms/plugin-seo/fields"
import type {
  CollectionBeforeChangeHook,
  CollectionConfig,
  FieldHook,
  Tab,
  TypeWithID,
} from "payload"

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

export function seoTab(): Tab {
  return {
    name: "meta",
    label: "SEO",
    fields: [
      OverviewField({
        titlePath: "meta.title",
        descriptionPath: "meta.description",
        imagePath: "meta.image",
      }),
      MetaTitleField({
        hasGenerateFn: true,
      }),
      MetaImageField({
        relationTo: "media",
      }),
      MetaDescriptionField({}),
      PreviewField({
        hasGenerateFn: true,
        titlePath: "meta.title",
        descriptionPath: "meta.description",
      }),
    ],
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
