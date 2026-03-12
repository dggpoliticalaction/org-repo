import { LinkButton } from "@/components/ui/link-button"

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function NotFound() {
  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">This page could not be found.</p>
      </div>
      <LinkButton href="/">Go home</LinkButton>
    </div>
  )
}
