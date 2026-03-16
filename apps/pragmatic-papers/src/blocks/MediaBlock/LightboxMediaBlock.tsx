import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/utilities/ui"
import { MediaBlock, type StyledMediaBlockProps } from "./Component"

interface LightboxMediaBlockProps extends StyledMediaBlockProps {
  pictureClassName?: string
}

export const LightboxMediaBlock: React.FC<LightboxMediaBlockProps> = ({
  className,
  media,
  ...props
}) => {
  return (
    <Dialog>
      <DialogTrigger className={cn("w-full", className)}>
        <MediaBlock media={media} enableGutter={false} className={className} {...props} />
      </DialogTrigger>
      <DialogContent className="!block !w-fit !max-w-none gap-0 border-0 bg-transparent p-0 shadow-none [&>button]:right-2 [&>button]:top-2 [&>button]:z-10 [&>button]:rounded-xs [&>button]:bg-background/70 [&>button]:p-1 [&>button_svg]:h-6 [&>button_svg]:w-6">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {media && typeof media === "object" && media.alt ? media.alt : "Image Lightbox"}
          </DialogTitle>
        </DialogHeader>
        {media && typeof media === "object" && media.width && media.height && (
          <MediaBlock
            media={media}
            fill
            imgClassName="object-contain"
            captionClassName="pt-2"
            sizes="(max-width: 768px) 95vw, 80vw"
            enableGutter={false}
            style={{
              width: `min(95vw, calc(80svh * (${media.width} / ${media.height})))`,
              height: `min(80svh, calc(95vw * (${media.height} / ${media.width})))`,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
