import type { Block, Field } from 'payload'

export const LAYOUT_SLOT_CONFIG = {
  'vespucci-7': {
    featured: 'featured',
    a: 'medium',
    b: 'medium',
    c: 'compact',
    d: 'compact',
    e: 'compact',
    f: 'compact',
  },
  'fibonacci-7': {
    featured: 'featured',
    a: 'medium',
    b: 'medium',
    c: 'medium',
    d: 'medium',
    e: 'compact',
    f: 'compact',
  },
} as const

export type ArticleGridLayout = keyof typeof LAYOUT_SLOT_CONFIG
export type SlotName = 'featured' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

const ALL_LAYOUTS: ArticleGridLayout[] = ['vespucci-7', 'fibonacci-7']

function layoutsUsingSlot(slot: SlotName): ArticleGridLayout[] {
  return ALL_LAYOUTS.filter((layout) => slot in LAYOUT_SLOT_CONFIG[layout])
}

function getLayoutFromPath(
  data: Record<string, unknown>,
  path: (string | number)[] | undefined,
): ArticleGridLayout | null {
  if (!path || !data) return null
  const layoutFieldIndex = path.indexOf('layout')
  if (layoutFieldIndex === -1 || path[layoutFieldIndex + 1] === undefined) return null
  const blockIndex = Number(path[layoutFieldIndex + 1])
  if (isNaN(blockIndex)) return null
  const layoutArray = data.layout as Array<Record<string, unknown>> | undefined
  if (!Array.isArray(layoutArray) || !layoutArray[blockIndex]) return null
  return (layoutArray[blockIndex].layout as ArticleGridLayout) || null
}

function getSlotsFromPath(
  data: Record<string, unknown>,
  path: (string | number)[] | undefined,
): Record<SlotName, { article?: number | { id: number } }> | null {
  if (!path || !data) return null
  const layoutFieldIndex = path.indexOf('layout')
  if (layoutFieldIndex === -1 || path[layoutFieldIndex + 1] === undefined) return null
  const blockIndex = Number(path[layoutFieldIndex + 1])
  if (isNaN(blockIndex)) return null
  const layoutArray = data.layout as Array<Record<string, unknown>> | undefined
  if (!Array.isArray(layoutArray) || !layoutArray[blockIndex]) return null
  return (layoutArray[blockIndex].slots as Record<SlotName, { article?: number | { id: number } }>) || null
}

function slotFields(slotName: SlotName, label: string): Field {
  const validLayouts = layoutsUsingSlot(slotName)

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
        filterOptions: { _status: { equals: 'published' } },
        validate: (
          value: unknown,
          { data, path }: { data: unknown; path: (string | number)[] },
        ) => {
          const layout = getLayoutFromPath(data as Record<string, unknown>, path)
          if (layout && !validLayouts.includes(layout)) return true
          if (!value) return `An article is required for slot "${slotName}".`

          const slots = getSlotsFromPath(data as Record<string, unknown>, path)
          if (!slots) return true

          const thisId =
            typeof value === 'object' && value !== null && 'id' in (value as object)
              ? (value as { id: number }).id
              : (value as number)

          const allSlots: SlotName[] = ['featured', 'a', 'b', 'c', 'd', 'e', 'f']
          for (const other of allSlots) {
            if (other === slotName) continue
            const otherSlot = slots[other]
            if (!otherSlot?.article) continue
            const otherId =
              typeof otherSlot.article === 'object' ? otherSlot.article.id : otherSlot.article
            if (otherId === thisId) {
              return `This article is already used in slot "${other}". Each slot must have a unique article.`
            }
          }
          return true
        },
        admin: {
          condition: (data, _siblingData, { path }) => {
            const layout = getLayoutFromPath(data, path)
            if (!layout) return true
            return validLayouts.includes(layout)
          },
        },
      },
      {
        name: 'kicker',
        type: 'text',
        label: 'Kicker',
        admin: {
          description: 'Optional short label above the title (e.g. "Breaking", "Opinion")',
          condition: (data, _siblingData, { path }) => {
            const layout = getLayoutFromPath(data, path)
            if (!layout) return true
            return validLayouts.includes(layout)
          },
        },
      },
      {
        name: 'overrideTitle',
        type: 'text',
        label: 'Override Title',
        admin: {
          description: 'Optional override for the article title in this slot',
          condition: (data, _siblingData, { path }) => {
            const layout = getLayoutFromPath(data, path)
            if (!layout) return true
            return validLayouts.includes(layout)
          },
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
        { label: 'Vespucci 7 (Vermont-style)', value: 'vespucci-7' },
        { label: 'Fibonacci 7 (Virginia-style)', value: 'fibonacci-7' },
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
