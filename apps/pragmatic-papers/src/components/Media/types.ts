import type { StaticImageData } from "next/image"
import type { ElementType, Ref } from "react"

import type { Media as MediaType } from "@/payload-types"
import { type ImageMediaSizes } from "./ImageMedia"

export interface Props {
  alt?: string
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: "lazy" | "eager" // for NextImage only
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  media?: MediaType // for Payload media
  sizes?: ImageMediaSizes // for NextImage only
  src?: string | StaticImageData // for static media
  videoClassName?: string
}
