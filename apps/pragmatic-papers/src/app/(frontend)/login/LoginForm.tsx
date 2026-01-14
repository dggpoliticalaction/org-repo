import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { defaultLogin } from './actions'
import { SubmitButton } from './SubmitButton'

interface LoginFormProps {
  error?: string | null
}

/**
 * LoginForm component renders a login form styled with Card components.
 *
 * Props:
 * - error (string | null, optional): If provided, displays an error message above the form.
 *
 * The form collects email and password and submits them to the server using the `login` action.
 * On submission, it triggers authentication logic on the server.
 *
 * UI Features:
 * - Custom error message display for failed login attempts.
 * - Accessible labels for email and password fields.
 * - Styled submit button.
 */
export function LoginForm({ error }: LoginFormProps): React.ReactElement {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form action={defaultLogin}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive p-3 text-sm text-destructive-foreground">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}
