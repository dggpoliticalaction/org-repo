import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MediaBlock, type StyledMediaBlockProps } from "./Component"

interface LightboxMediaBlockProps extends StyledMediaBlockProps {
  pictureClassName?: string
}

export const LightboxMediaBlock: React.FC<LightboxMediaBlockProps> = ({
  className,
  media,
  ...props
}) => {
  if (typeof media === "number") return null
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <MediaBlock media={media} enableGutter={false} className={className} {...props} />
      </DialogTrigger>
      <DialogContent className="[&>button]:rounded-xs max-w-[100vw] border-0 p-0 text-sm shadow-none [&:has(>figure)>button]:top-6 [&>button]:right-2 [&>button]:top-2 [&>button]:bg-background [&>button_svg]:h-6 [&>button_svg]:w-6">
        <DialogHeader className="sr-only">
          <DialogTitle>{media.filename}</DialogTitle>
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
