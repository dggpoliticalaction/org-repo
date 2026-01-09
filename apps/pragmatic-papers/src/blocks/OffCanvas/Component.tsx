import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface OffCanvasBlockProps {
  label: string
  icon: React.ReactNode
}

export const OffCanvasBlock: React.FC<OffCanvasBlockProps> = ({ label, icon }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" size="clear" className="items-center gap-2">
          <span className="sr-only md:not-sr-only">{label}</span>
          {icon}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-screen sm:max-w-full">
        <SheetHeader>
          <SheetTitle className="sr-only">{label}</SheetTitle>
        </SheetHeader>
        <SheetDescription>Add content here</SheetDescription>
      </SheetContent>
    </Sheet>
  )
}
