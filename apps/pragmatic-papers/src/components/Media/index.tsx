import type { Media as MediaType } from "@/payload-types"
import React from "react"

import { ImageMedia, type ImageMediaProps } from "./ImageMedia"
import { VideoMedia, type VideoMediaProps } from "./VideoMedia"

function isVideoMediaProps(props: VideoMediaProps | ImageMediaProps): props is VideoMediaProps {
  if (!props.media) return false
  if (typeof props.media === "number") return false
  return props.media.mimeType?.includes("video") ?? false
}

export function isMedia(media: number | MediaType | undefined | null): media is MediaType {
  if (!media) return false
  if (typeof media === "number") return false
  return true
}

export const Media: React.FC<VideoMediaProps | ImageMediaProps> = (props) => {
  if (isVideoMediaProps(props)) {
    return <VideoMedia {...props} />
  }

  return <ImageMedia {...props} />
}
