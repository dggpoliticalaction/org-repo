import React from "react"

import type { Props } from "./types"

import { ImageMedia } from "./ImageMedia"
import { VideoMedia } from "./VideoMedia"

export const Media: React.FC<Props> = ({ media, imgClassName, ...props }) => {
  if (!media || typeof media === "number") return null

  if (media.mimeType?.includes("video")) {
    return <VideoMedia media={media} {...props} />
  }

  return (
    <ImageMedia
      media={media}
      // TODO: alt should be required
      alt={props.alt || ""}
      // TODO: imgClassName should be renamed to className
      className={imgClassName}
      {...props}
    />
  )
}
