import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/utilities/utils"
import { MediaBlock, type StyledMediaBlockProps } from "./Component"

export type LightboxMediaBlockProps = StyledMediaBlockProps & {
  containerClassName?: string
}

export const LightboxMediaBlock: React.FC<LightboxMediaBlockProps> = ({
  containerClassName,
  className,
  media,
  ...props
}) => {
  if (typeof media === "number") return null

  const isPortrait = (media.height ?? 0) > (media.width ?? 0)

  return (
    <Dialog>
      <DialogTrigger className={cn("w-full", containerClassName)}>
        <MediaBlock media={media} enableGutter={false} className={className} {...props} />
      </DialogTrigger>
      <DialogContent
        className={cn(
          "[&>button]:bg-background w-screen p-0 text-base shadow-none ring-0 sm:max-w-7xl [&>button]:top-2 [&>button]:right-2 [&>button]:rounded-sm [&>button]:p-0.5 [&>button_svg]:size-6",
          isPortrait ? "max-h-[90dvh] overflow-hidden" : "max-h-full",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{media.filename}</DialogTitle>
        </DialogHeader>
        <MediaBlock
          media={media}
          sizes="100vw"
          variant="xlarge"
          enableGutter={false}
          imgClassName={cn("border", isPortrait && "max-h-[calc(90dvh-3.5rem)] w-auto")}
        />
      </DialogContent>
    </Dialog>
  )
}
