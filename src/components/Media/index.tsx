import type { Media as MediaType } from "@/payload-types"
import React from "react"

import { AudioMedia, type AudioMediaProps } from "./AudioMedia"
import { ImageMedia, type ImageMediaProps } from "./ImageMedia"
import { VideoMedia, type VideoMediaProps } from "./VideoMedia"

type MediaTypes = VideoMediaProps | ImageMediaProps | AudioMediaProps

function isVideoMedia(props: MediaTypes): props is VideoMediaProps {
  return props.media.mimeType?.startsWith("video") ?? false
}

function isAudioMedia(props: MediaTypes): props is AudioMediaProps {
  if (!props.media || typeof props.media === "number") return false
  return props.media.mimeType?.startsWith("audio") ?? false
}

export function isMedia(media: number | MediaType | undefined | null): media is MediaType {
  if (!media || typeof media === "number") return false
  return true
}

export const Media: React.FC<MediaTypes> = (props) => {
  if (!props.media || typeof props.media === "number") return null

  if (isVideoMedia(props)) {
    return <VideoMedia {...props} />
  }

  if (isAudioMedia(props)) {
    return <AudioMedia {...props} />
  }

  return <ImageMedia {...props} />
}
