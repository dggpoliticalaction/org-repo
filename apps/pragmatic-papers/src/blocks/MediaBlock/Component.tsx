import type { StaticImageData } from "next/image"

import RichText from "@/components/RichText"
import { cn } from "@/utilities/ui"
import React from "react"

import type { MediaBlock as MediaBlockProps } from "@/payload-types"

import { Media } from "../../components/Media"

export type StyledMediaBlockProps = Omit<MediaBlockProps, "blockType"> & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<StyledMediaBlockProps> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
  } = props

  let caption
  if (media && typeof media === "object") caption = media.caption
  const Slot: React.ElementType = caption ? "figure" : "div"
  return (
    <Slot
      className={cn(
        {
          container: enableGutter,
        },
        className,
      )}
    >
      {(media || staticImage) && (
        <Media imgClassName={imgClassName} resource={media} src={staticImage} />
      )}
      {caption && (
        <figcaption
          className={cn(
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <RichText
            data={caption}
            enableGutter={false}
            className="text-center text-xs text-muted-foreground"
          />
        </figcaption>
      )}
    </Slot>
  )
}
