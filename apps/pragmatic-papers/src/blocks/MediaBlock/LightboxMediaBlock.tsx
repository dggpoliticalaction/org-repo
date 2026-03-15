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
  imgClassName,
  ...props
}) => {
  return (
    <Dialog>
      <DialogTrigger className={cn("w-full", className)}>
        <MediaBlock {...props} enableGutter={false} imgClassName={imgClassName} />
      </DialogTrigger>
      <DialogContent className="[&>button]:rounded-xs max-w-7xl border-0 p-0 shadow-none [&:has(>figure)>button]:top-6 [&>button]:right-2 [&>button]:top-2 [&>button]:bg-background [&>button_svg]:h-6 [&>button_svg]:w-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Modal</DialogTitle>
        </DialogHeader>
        <MediaBlock
          {...props}
          imgClassName="w-full object-contain max-h-[75svh] md:max-h-none md:aspect-video"
          sizes="100vw"
          enableGutter={false}
        />
      </DialogContent>
    </Dialog>
  )
}
