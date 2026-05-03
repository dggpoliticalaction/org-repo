import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from "@payloadcms/plugin-seo/fields"
import type { Tab } from "payload"

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
