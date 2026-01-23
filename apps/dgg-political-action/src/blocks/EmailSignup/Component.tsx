'use client'

import React from 'react'
import type { EmailSignupBlock as EmailSignupBlockProps } from '@/payload-types'
import RichText from '@/components/RichText'
import { EmailSignupForm } from '@/app/(frontend)/subscribe/EmailSignupForm'

export const EmailSignupBlock: React.FC<EmailSignupBlockProps> = ({
  enableIntro,
  introContent,
  successMessage,
  mailerliteFormActionUrl,
  testMode,
}) => {
  const hasIntro = Boolean(enableIntro && introContent)

  return (
    <section className="my-16 bg-[hsl(var(--accent-bg-1))]">
      <div className="container py-10">
        <div className="grid gap-y-8 gap-x-16 lg:grid-cols-[1.2fr_0.8fr]">
          {hasIntro && <RichText className="md:pt-2" data={introContent} enableGutter={false} />}

          <EmailSignupForm
            className="w-fit"
            actionUrl={mailerliteFormActionUrl}
            testMode={testMode}
            successMessage={successMessage ? <RichText data={successMessage} /> : undefined}
          />
        </div>
      </div>
    </section>
  )
}
