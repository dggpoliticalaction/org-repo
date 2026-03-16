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
      <DialogContent className="[&>button]:rounded-xs max-w-[100vw] border-0 p-0 shadow-none [&>button]:right-2 [&>button]:top-2 [&>button]:bg-background [&>button_svg]:h-6 [&>button_svg]:w-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Modal</DialogTitle>
        </DialogHeader>
        <MediaBlock
          media={media}
          imgClassName="w-full object-contain md:aspect-video"
          sizes="100vw"
          enableGutter={false}
        />
      </DialogContent>
    </Dialog>
  )
}
