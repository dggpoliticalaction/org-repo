import type { Block, Field } from 'payload'

export type ArticleGridLayout = 'vespucci-7' | 'fibonacci-7'
export type SlotName = 'featured' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

const ALL_SLOTS: SlotName[] = ['featured', 'a', 'b', 'c', 'd', 'e', 'f']

type SlotArticle = number | { id: number } | undefined
type Slots = Record<SlotName, { article?: SlotArticle }>

/** Unwrap a relationship value to a plain numeric ID. */
const toId = (val: SlotArticle): number | undefined =>
  typeof val === 'object' && val !== null ? val.id : val

/** Navigate from a field's `path` up to its parent ArticleGrid block. */
const getBlockSlots = (
  data: Record<string, unknown>,
  path: (string | number)[] | undefined,
): Slots | undefined => {
  const i = path?.indexOf('layout') ?? -1
  if (i === -1) return undefined
  const blocks = data.layout as Record<string, unknown>[] | undefined
  return (blocks?.[Number(path![i + 1])] as Record<string, unknown>)?.slots as Slots | undefined
}

function slotFields(slotName: SlotName, label: string): Field {
  return {
    name: slotName,
    type: 'group',
    label,
    fields: [
      {
        name: 'article',
        type: 'relationship',
        relationTo: 'articles',
        label: 'Article',
        required: true,
        filterOptions: { _status: { equals: 'published' } },
        validate: (
          value: unknown,
          { data, path }: { data: unknown; path: (string | number)[] },
        ) => {
          if (!value) return `An article is required for slot "${slotName}".`

          const slots = getBlockSlots(data as Record<string, unknown>, path)
          if (!slots) return true

          const thisId = toId(value as SlotArticle)
          const duplicate = ALL_SLOTS.find(
            (s) => s !== slotName && toId(slots[s]?.article) === thisId,
          )
          if (duplicate) {
            return `This article is already used in slot "${duplicate}". Each slot must have a unique article.`
          }
          return true
        },
      },
      {
        name: 'kicker',
        type: 'text',
        label: 'Kicker',
        admin: {
          description: 'Optional short label above the title (e.g. "Breaking", "Opinion")',
        },
      },
      {
        name: 'overrideTitle',
        type: 'text',
        label: 'Override Title',
        admin: {
          description: 'Optional override for the article title in this slot',
        },
      },
    ],
  }
}

export const ArticleGrid: Block = {
  slug: 'articleGrid',
  interfaceName: 'ArticleGridBlock',
  labels: { singular: 'Article Grid', plural: 'Article Grids' },
  fields: [
    {
      name: 'layout',
      type: 'select',
      label: 'Layout Preset',
      required: true,
      defaultValue: 'vespucci-7',
      options: [
        { label: 'Vespucci 7', value: 'vespucci-7' },
        { label: 'Fibonacci 7', value: 'fibonacci-7' },
      ],
      admin: {
        description: 'Choose a layout preset that determines how the 7 article slots are arranged.',
      },
    },
    {
      name: 'slots',
      type: 'group',
      label: 'Article Slots',
      admin: {
        description: 'Fill each slot with an article. Slot names correspond to positions in the chosen layout.',
      },
      fields: [
        slotFields('featured', 'Featured Article'),
        slotFields('a', 'Slot A'),
        slotFields('b', 'Slot B'),
        slotFields('c', 'Slot C'),
        slotFields('d', 'Slot D'),
        slotFields('e', 'Slot E'),
        slotFields('f', 'Slot F'),
      ],
    },
  ],
}
