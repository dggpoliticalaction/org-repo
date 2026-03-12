import type { Block } from "payload"
import { layouts, type ArticleGridLayoutKey } from "./layouts"

/** Map of layout key → slot count, passed to the custom SlotsField component */
const slotCounts: Record<string, number> = Object.fromEntries(
  Object.entries(layouts).map(([key, def]) => [key, def.slotDescriptions.length]),
)

/** Map of layout key → slot descriptions, passed to the custom SlotRowLabel component */
const slotDescriptions: Record<string, string[]> = Object.fromEntries(
  Object.entries(layouts).map(([key, def]) => [key, def.slotDescriptions]),
)

export const ArticleGrid: Block = {
  slug: "articleGrid",
  interfaceName: "ArticleGridBlock",
  labels: { singular: "Article Grid", plural: "Article Grids" },
  fields: [
    {
      name: "layout",
      type: "select",
      label: "Layout Preset",
      required: true,
      defaultValue: "vespucci-7" satisfies ArticleGridLayoutKey,
      options: Object.entries(layouts).map(([value, def]) => ({
        label: def.label,
        value,
      })),
      admin: {
        description: "Choose a layout preset that determines how article slots are arranged.",
      },
    },
    {
      name: "slots",
      type: "array",
      label: "Article Slots",
      required: true,
      admin: {
        description:
          "Fill each slot with an article. The number of slots is determined by the chosen layout.",
        components: {
          Field: {
            path: "@/blocks/ArticleGrid/components/SlotsField#SlotsField",
            clientProps: {
              slotCounts,
            },
          },
          RowLabel: {
            path: "@/blocks/ArticleGrid/components/SlotRowLabel#SlotRowLabel",
            clientProps: {
              slotDescriptions,
            },
          },
        },
      },
      fields: [
        {
          name: "article",
          type: "relationship",
          relationTo: "articles",
          label: "Article",
          required: true,
          filterOptions: { _status: { equals: "published" } },
        },
        {
          name: "kicker",
          type: "text",
          label: "Kicker",
          admin: {
            description: 'Optional short label above the title (e.g. "Breaking", "Opinion")',
          },
        },
        {
          name: "overrideTitle",
          type: "text",
          label: "Override Title",
          admin: {
            description: "Optional override for the article title in this slot",
          },
        },
      ],
    },
  ],
}
