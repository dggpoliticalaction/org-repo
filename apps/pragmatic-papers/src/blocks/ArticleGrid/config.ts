import type { Block, Field } from "payload"

export type ArticleGridLayout = "vespucci-7" | "fibonacci-7"
export type SlotName = "featured" | "a" | "b" | "c" | "d" | "e" | "f"

function slotFields(slotName: SlotName, label: string): Field {
  return {
    name: slotName,
    type: "group",
    label,
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
  }
}

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
      defaultValue: "vespucci-7",
      options: [
        { label: "Vespucci 7", value: "vespucci-7" },
        { label: "Fibonacci 7", value: "fibonacci-7" },
      ],
      admin: {
        description: "Choose a layout preset that determines how the 7 article slots are arranged.",
      },
    },
    {
      name: "slots",
      type: "group",
      label: "Article Slots",
      admin: {
        description:
          "Fill each slot with an article. Slot names correspond to positions in the chosen layout.",
      },
      fields: [
        slotFields("featured", "Featured Article"),
        slotFields("a", "Slot A"),
        slotFields("b", "Slot B"),
        slotFields("c", "Slot C"),
        slotFields("d", "Slot D"),
        slotFields("e", "Slot E"),
        slotFields("f", "Slot F"),
      ],
    },
  ],
}
