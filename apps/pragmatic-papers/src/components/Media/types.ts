import type { StaticImageData } from "next/image"
import type { ElementType, Ref } from "react"

import type { Media as MediaType } from "@/payload-types"
import { type ImageVariant } from "./ImageMedia"

export interface Props {
  alt?: string
  fill?: true | false // for NextImage only
  containerClassName?: string
  htmlElement?: ElementType | null
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: "lazy" | "eager" // for NextImage only
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  media?: number | MediaType // for Payload media
  sizes?: string | undefined // for NextImage only
  variant?: ImageVariant
  src?: string | StaticImageData // for static media
  videoClassName?: string
}
