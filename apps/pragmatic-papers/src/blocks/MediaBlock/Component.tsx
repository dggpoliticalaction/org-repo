import type { MediaBlock as MediaBlockProps } from "@/payload-types"
import React from "react"

import { Media } from "@/components/Media"
import { cn } from "@/utilities/utils"
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext"

export type StyledMediaBlockProps = Omit<MediaBlockProps, "blockType"> & {
  breakout?: boolean
  className?: string
  imgClassName?: string
  captionClassName?: string
  enableGutter?: boolean
  sizes?: string | undefined
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<StyledMediaBlockProps> = ({ sizes, ...props }) => {
  const {
    breakout,
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    disableInnerContainer,
  } = props
  if (typeof media === "number") return null

  sizes = sizes || breakout ? "(max-width: 768px) 100vw, 800px" : "(max-width: 768px) 100vw, 728px"

  let caption
  if (media && typeof media === "object") caption = media.caption

  const Slot: React.ElementType = caption ? "figure" : "picture"
  return (
    <Slot
      className={cn(
        {
          container: enableGutter,
          "lg:-mx-8 xl:-mx-16": breakout,
        },
        className,
      )}
    >
      <Media className={imgClassName} media={media} sizes={sizes} />
      {caption && (
        <figcaption
          className={cn(
            "text-sm",
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          {convertLexicalToPlaintext({ data: caption })}
        </figcaption>
      )}
    </Slot>
  )
}
