import type React from "react"

import type {
  CollectionGridBlock as CollectionGridBlockType,
  CollectionGridLayout,
} from "@/payload-types"
import { BernoulliLeftLayout } from "./layouts/BernoulliLeft"
import { BernoulliRightLayout } from "./layouts/BernoulliRight"
import { Euler2Layout } from "./layouts/Euler2"
import { Euler3Layout } from "./layouts/Euler3"
import { Euler5Layout } from "./layouts/Euler5"
import { Fibonacci6Layout } from "./layouts/Fibonacci6"
import { Fibonacci7Layout } from "./layouts/Fibonacci7"
import { Newton4Layout } from "./layouts/Newton4"
import { Vespucci7Layout } from "./layouts/Vespucci7"
import type { LayoutProps } from "./types"

const layouts = {
  "bernoulli-left": BernoulliLeftLayout,
  "bernoulli-right": BernoulliRightLayout,
  "euler-2": Euler2Layout,
  "euler-3": Euler3Layout,
  "newton-4": Newton4Layout,
  "euler-5": Euler5Layout,
  "fibonacci-6": Fibonacci6Layout,
  "vespucci-7": Vespucci7Layout,
  "fibonacci-7": Fibonacci7Layout,
} as const satisfies Record<CollectionGridLayout, React.FC<LayoutProps>>

export const CollectionGridBlock: React.FC<CollectionGridBlockType> = async (props) => {
  const { layout, id, slots } = props
  const LayoutComponent = layouts[layout]
  return (
    <LayoutComponent
      id={id ?? undefined}
      className="container mb-10 items-stretch md:mb-20 lg:mb-40"
      slots={slots}
    />
  )
}
