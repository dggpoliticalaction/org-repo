'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

export function SubmitButton(): React.ReactElement {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  )
}
