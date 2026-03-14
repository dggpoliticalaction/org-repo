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
  enableModal?: boolean
}

export const LightboxMediaBlock: React.FC<LightboxMediaBlockProps> = ({ className, ...props }) => {
  return (
    <Dialog>
      <DialogTrigger className={cn("w-full", className)}>
        <MediaBlock {...props} className={className} enableGutter={false} />
      </DialogTrigger>
      <DialogContent
        className={cn(
          "[&>button]:rounded-xs flex max-h-[85svh] flex-col border-0 p-0 shadow-none [&>button]:bg-background [&>button_svg]:h-5 [&>button_svg]:w-5",
          "aspect-video w-full max-w-[90vw]",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Image Modal</DialogTitle>
        </DialogHeader>
        <MediaBlock
          {...props}
          enableGutter={false}
          className="h-full max-h-full w-full"
          pictureClassName="flex h-full max-h-full w-full items-center justify-center"
          imgClassName={cn("max-h-full max-w-full object-contain border-0", props.imgClassName)}
        />
      </DialogContent>
    </Dialog>
  )
}
