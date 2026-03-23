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

  return (
    <Dialog>
      <DialogTrigger className={cn("w-full", containerClassName)}>
        <MediaBlock media={media} enableGutter={false} className={className} {...props} />
      </DialogTrigger>
      <DialogContent className="w-auto max-w-none sm:max-w-none flex items-center justify-center p-0 border-none rounded-none bg-transparent shadow-none ring-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{media.filename}</DialogTitle>
        </DialogHeader>
        <MediaBlock
          media={media}
          sizes="100vw"
          variant="xlarge"
          enableGutter={false}
          className="max-h-full max-w-full"
          imgClassName="h-auto w-auto max-h-[calc(100dvh-3.5rem)] max-w-[calc(100dvw-3.5rem)] object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}
