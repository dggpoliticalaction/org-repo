'use client'

import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

import { cn } from '@/utilities/ui'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  zipCode: string
}

export type EmailSignupFormProps = {
  actionUrl?: string | null
  successMessage?: React.ReactNode
  submitLabel?: string
  className?: string
  testMode?: boolean | null
}

export const EmailSignupForm: React.FC<EmailSignupFormProps> = ({
  actionUrl,
  successMessage,
  submitLabel = 'Subscribe',
  className,
  testMode,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedActionUrl = actionUrl ?? ''
  const fieldGroupClassName = 'space-y-1'
  const fieldGridClassName = 'grid grid-cols-1 md:grid-cols-2 gap-4'
  const formStackClassName = 'mb-4 last:mb-0 space-y-2'
  const requiredMarkClassName = 'text-destructive ml-1'
  const errorTextClassName = 'text-sm text-destructive'
  const optionalTextClassName = 'text-muted-foreground ml-1 text-xs'
  const zipRowClassName = 'grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end'
  const inputClassName = 'h-7'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      setIsLoading(true)
      setError(null)

      if (testMode) {
        await new Promise((resolve) => {
          setTimeout(resolve, 400)
        })
        setHasSubmitted(true)
        setIsLoading(false)
        return
      }

      if (!resolvedActionUrl) {
        setError('MailerLite form action URL is not configured.')
        setIsLoading(false)
        return
      }

      try {
        const body = new URLSearchParams()
        body.set('ml-submit', '1')
        body.set('fields[email]', data.email)
        body.set('fields[name]', data.firstName)
        body.set('fields[last_name]', data.lastName)
        body.set('fields[z_i_p]', data.zipCode)

        if (data.phone) {
          body.set('fields[phone]', data.phone)
        }

        await fetch(resolvedActionUrl, {
          method: 'POST',
          body,
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
        })

        setHasSubmitted(true)
      } catch (err) {
        console.error('Subscription error:', err)
        setError('An unexpected error occurred. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [resolvedActionUrl, testMode],
  )

  return (
    <div className={cn('', className)}>
      {!isLoading && hasSubmitted && successMessage}
      {!isLoading && hasSubmitted && !successMessage && (
        <div className="text-center py-4">
          <p className="text-lg font-medium">Thank you for subscribing!</p>
          <p className="text-muted-foreground mt-2">You've been added to our mailing list.</p>
        </div>
      )}
      {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
          {error}
        </div>
      )}
      {!hasSubmitted && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={formStackClassName}>
            <div className={fieldGridClassName}>
              <div className={fieldGroupClassName}>
                <Label htmlFor="firstName">
                  First Name
                  <span className={requiredMarkClassName}>*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  className={inputClassName}
                  {...register('firstName', { required: 'First name is required' })}
                />
                {errors.firstName && (
                  <p className={errorTextClassName}>{errors.firstName.message}</p>
                )}
              </div>

              <div className={fieldGroupClassName}>
                <Label htmlFor="lastName">
                  Last Name
                  <span className={requiredMarkClassName}>*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  className={inputClassName}
                  {...register('lastName', { required: 'Last name is required' })}
                />
                {errors.lastName && <p className={errorTextClassName}>{errors.lastName.message}</p>}
              </div>
            </div>

            <div className={fieldGroupClassName}>
              <Label htmlFor="email">
                Email
                <span className={requiredMarkClassName}>*</span>
                <span className="sr-only">(required)</span>
              </Label>
              <Input
                id="email"
                type="email"
                className={inputClassName}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S[^\s@]*@\S+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
              {errors.email && <p className={errorTextClassName}>{errors.email.message}</p>}
            </div>

            <div className={fieldGroupClassName}>
              <Label htmlFor="phone">
                Phone
                <span className={optionalTextClassName}>(optional)</span>
              </Label>
              <Input id="phone" type="tel" className={inputClassName} {...register('phone')} />
            </div>

            <div className={zipRowClassName}>
              <div className={fieldGroupClassName}>
                <Label htmlFor="zipCode">
                  Zip Code
                  <span className={requiredMarkClassName}>*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Input
                  id="zipCode"
                  type="text"
                  className={inputClassName}
                  {...register('zipCode', {
                    required: 'Zip code is required',
                    pattern: {
                      value: /^\d{5}(-\d{4})?$/,
                      message: 'Please enter a valid zip code',
                    },
                  })}
                />
                {errors.zipCode && <p className={errorTextClassName}>{errors.zipCode.message}</p>}
              </div>
              <Button type="submit" variant="default" disabled={isLoading}>
                {isLoading ? 'Subscribing...' : submitLabel}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
