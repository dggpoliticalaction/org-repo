import type React from "react"
import type { ArticleGridSlotData } from "../types"

import * as Vespucci7 from "./Vespucci7"
import * as Fibonacci7 from "./Fibonacci7"
import * as Miami3 from "./Miami3"
import * as Miami5 from "./Miami5"
import * as Omaha4 from "./Omaha4"
import * as Speranza6 from "./Speranza6"

export interface LayoutDefinition {
  /** Human-readable name shown in the layout selector */
  label: string
  /** One description string per slot, in order. Length determines slot count. */
  slotDescriptions: string[]
  /** The React component that renders this layout */
  component: React.FC<{ slots: ArticleGridSlotData[] }>
}

/**
 * All available ArticleGrid layouts.
 * To add a new layout, create a file that exports `label`, `slotDescriptions`,
 * and a layout component, then add it here.
 */
export const layouts = {
  "vespucci-7": {
    label: Vespucci7.label,
    slotDescriptions: Vespucci7.slotDescriptions,
    component: Vespucci7.Vespucci7Layout,
  },
  "fibonacci-7": {
    label: Fibonacci7.label,
    slotDescriptions: Fibonacci7.slotDescriptions,
    component: Fibonacci7.Fibonacci7Layout,
  },
  "miami-3": {
    label: Miami3.label,
    slotDescriptions: Miami3.slotDescriptions,
    component: Miami3.Miami3Layout,
  },
  "miami-5": {
    label: Miami5.label,
    slotDescriptions: Miami5.slotDescriptions,
    component: Miami5.Miami5Layout,
  },
  "omaha-4": {
    label: Omaha4.label,
    slotDescriptions: Omaha4.slotDescriptions,
    component: Omaha4.Omaha4Layout,
  },
  "Speranza-6": {
    label: Speranza6.label,
    slotDescriptions: Speranza6.slotDescriptions,
    component: Speranza6.Israel6Layout,
  },
} as const satisfies Record<string, LayoutDefinition>

export type ArticleGridLayoutKey = keyof typeof layouts
