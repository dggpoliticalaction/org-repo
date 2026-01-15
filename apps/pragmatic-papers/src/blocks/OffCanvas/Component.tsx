import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { X } from 'lucide-react'

interface OffCanvasBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  icon: React.ReactNode
  header?: React.ReactNode
}

export const OffCanvasBlock: React.FC<OffCanvasBlockProps> = ({
  className,
  label,
  icon,
  children,
  header,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" size="clear" className="items-center gap-2">
          <span>{label}</span>
          {icon}
        </Button>
      </SheetTrigger>
      <SheetContent className={className} hideClose>
        <SheetHeader>
          <SheetTitle className="sr-only">{label}</SheetTitle>
          {header}
        </SheetHeader>
        {children}
        <SheetClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 flex items-center gap-1 rounded-sm text-sm font-bold opacity-70 transition-opacity hover:underline hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
          <span>Close</span>
          <X className="h-5 w-5" />
        </SheetClose>
      </SheetContent>
    </Sheet>
  )
}
