import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
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
      <SheetContent className="w-screen sm:max-w-full" hideClose>
        <SheetHeader>
          <SheetTitle className="sr-only">{label}</SheetTitle>
          {header}
        </SheetHeader>
        {children}
        <SheetClose className="absolute right-4 top-4 flex items-center gap-1 rounded-sm text-sm font-bold opacity-70 ring-offset-background transition-opacity hover:underline hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <span>Close</span>
          <X className="h-5 w-5" />
        </SheetClose>
      </SheetContent>
    </Sheet>
  )
}
