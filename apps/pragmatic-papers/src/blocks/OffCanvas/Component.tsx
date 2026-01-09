import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

interface Temp {
  label: string
  icon: React.ReactNode
}

export const OffCanvasBlock: React.FC<Temp> = ({ label, icon }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="sr-only md:not-sr-only">{label}</span> {icon}
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
