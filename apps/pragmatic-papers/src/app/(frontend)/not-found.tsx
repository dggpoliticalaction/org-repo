import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { LinkButton } from "@/components/ui/link-button"
import { CircleAlert } from "lucide-react"

export default function NotFound(): React.ReactElement {
  return (
    <Empty className="py-28">
      <EmptyHeader>
        <EmptyMedia>
          <CircleAlert className="text-brand-high-contrast size-5" />
        </EmptyMedia>
        <EmptyTitle className="font-display grid gap-1 font-semibold">
          <div className="text-brand-high-contrast text-6xl">404</div>
          <div className="text-xl">Page Not Found</div>
        </EmptyTitle>
        <EmptyDescription>The page you are looking for does not exist.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <LinkButton href="/">Go home</LinkButton>
      </EmptyContent>
    </Empty>
  )
}
