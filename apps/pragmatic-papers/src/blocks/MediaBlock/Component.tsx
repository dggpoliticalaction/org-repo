import RichText from "@/components/RichText"
import { cn } from "@/utilities/ui"
import React from "react"

import type { MediaBlock as MediaBlockProps } from "@/payload-types"

import { type ImageMediaSizes } from "@/components/Media/ImageMedia"
import { Media } from "../../components/Media"

export type StyledMediaBlockProps = Omit<MediaBlockProps, "blockType"> & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  sizes?: ImageMediaSizes
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<StyledMediaBlockProps> = (props) => {
  const {
    breakout,
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    sizes,
    media,
    disableInnerContainer,
  } = props
  if (typeof media === "number") return null

  const imgSize = sizes ?? (breakout ? "100vw" : "(max-width: 1376px) 100vw, 1376px")

  let caption
  if (media && typeof media === "object") caption = media.caption

  const Slot: React.ElementType = caption ? "figure" : "picture"
  return (
    <Slot
      className={cn(
        {
          container: enableGutter,
          "-mx-5 md:-mx-8 xl:-mx-16": breakout,
        },
        className,
      )}
    >
      <Media imgClassName={imgClassName} media={media} sizes={imgSize} />
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
