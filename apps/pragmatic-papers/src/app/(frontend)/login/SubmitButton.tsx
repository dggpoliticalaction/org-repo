'use client'

import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'

/**
 * SubmitButton is a client component that renders a "Login" button
 * for the login form. It is intended to be used within a `<form>` that
 * uses a Next.js server action for handling login.
 *
 * The button is disabled and displays a loading state ("Logging in...")
 * when the form action is pending (submitting). Otherwise, it displays "Login".
 *
 * This component uses Next.js's `useFormStatus()` from 'react-dom' to
 * track in-flight actions, and leverages the `Button` component from
 * our UI library.
 *
 * Usage:
 * ```
 *   <form action={login}>
 *     // ... your inputs ...
 *     <SubmitButton />
 *   </form>
 * ```
 */
export function SubmitButton(): React.ReactElement {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  )
}
