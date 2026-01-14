import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound(): React.ReactNode {
  return (
    <div className="text-center">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">This page could not be found.</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )
}
