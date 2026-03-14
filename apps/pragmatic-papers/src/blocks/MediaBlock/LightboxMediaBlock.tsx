import { MediaCarousel } from "@/components/MediaCarousel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type Media } from "@/payload-types"
import { cn } from "@/utilities/ui"
import { MediaBlock, type StyledMediaBlockProps } from "./Component"

interface LightboxMediaBlockProps extends StyledMediaBlockProps {
  enableModal?: boolean
  gallery?: {
    // Optional gallery context for carousel modal
    images: Media[]
    startIndex: number
  }
}

export const LightboxMediaBlock: React.FC<LightboxMediaBlockProps> = ({
  gallery,
  className,
  ...props
}) => {
  return (
    <Dialog>
      <DialogTrigger className={cn("w-full", className)}>
        <MediaBlock {...props} enableGutter={false} />
      </DialogTrigger>
      <DialogContent
        className={cn(
          "[&>button]:rounded-xs h-max max-h-[85svh] min-h-0 p-0 [&>button]:bg-background [&>button_svg]:h-5 [&>button_svg]:w-5",
          gallery ? "w-[80vw] max-w-[90vw]" : "w-max min-w-[80vw] max-w-[90vw]",
        )}
      >
        <DialogHeader className="sr-only p-0">
          <DialogTitle className="sr-only">{gallery ? "Image gallery" : "Image Modal"}</DialogTitle>
        </DialogHeader>
        {gallery ? (
          <MediaCarousel
            images={gallery.images}
            initialIndex={gallery.startIndex}
            showCaptions
            enableModal={false}
          />
        ) : (
          <MediaBlock {...props} enableGutter={false} />
        )}
      </DialogContent>
    </Dialog>
  )
}
