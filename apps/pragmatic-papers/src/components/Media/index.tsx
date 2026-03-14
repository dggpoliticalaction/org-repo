import React from "react"

import type { Props } from "./types"

import { ImageMedia } from "./ImageMedia"
import { VideoMedia } from "./VideoMedia"

export const Media: React.FC<Props> = (props) => {
  const { resource } = props

  const isVideo = typeof resource === "object" && resource?.mimeType?.includes("video")

  return <>{isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />}</>
}
