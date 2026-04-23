import type { Block } from "payload"

import { link } from "@/fields/link2"

export const Timeline: Block = {
  slug: "timeline",
  dbName: "timeline",
  interfaceName: "TimelineBlock",
  labels: { plural: "Timelines", singular: "Timeline" },
  fields: [
    { name: "title", type: "text" },
    {
      name: "events",
      type: "array",
      interfaceName: "TimelineEvents",
      required: true,
      minRows: 1,
      fields: [
        { name: "date", type: "text", required: true, maxLength: 60 },
        { name: "title", type: "text" },
        { name: "description", type: "textarea", required: true },
        { name: "avatar", type: "upload", relationTo: "media" },
        { name: "enableCitation", type: "checkbox", label: "Enable citation" },
        link({
          name: "citation",
          label: "Citation",
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enableCitation),
          },
        }),
      ],
    },
  ],
}
