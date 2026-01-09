import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

interface OffCanvasBlockProps {
  label: string
  icon: React.ReactNode
}

export const OffCanvasBlock: React.FC<OffCanvasBlockProps> = ({ label, icon }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" size="sm" className="gap-2">
          <span className="sr-only md:not-sr-only">{label}</span>
          {icon}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-screen sm:max-w-full">
        <SheetHeader>
          <SheetTitle className="sr-only">{label}</SheetTitle>
        </SheetHeader>
        Add content here
      </SheetContent>
    </Sheet>
  )
}
