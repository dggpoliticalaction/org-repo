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
      <DialogTrigger className={cn("-my-8 w-full cursor-pointer", containerClassName)}>
        <MediaBlock media={media} enableGutter={false} className={className} {...props} />
      </DialogTrigger>
      <DialogContent className="[&>button]:bg-background max-h-[90dvh] overflow-hidden p-0 text-base shadow-none ring-0 sm:max-w-max [&>button]:top-2 [&>button]:right-2 [&>button]:rounded-sm [&>button]:p-0.5 [&>button_svg]:size-6">
        <DialogHeader className="sr-only">
          <DialogTitle>{media.filename}</DialogTitle>
        </DialogHeader>
        <MediaBlock
          media={media}
          sizes="100vw"
          variant="xlarge"
          enableGutter={false}
          imgClassName="border max-h-[calc(90dvh-3.5rem)] w-auto"
        />
      </DialogContent>
    </Dialog>
  )
}
