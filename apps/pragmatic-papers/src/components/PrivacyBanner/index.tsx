'use client'

import React from 'react'

import { usePrivacyAnalytics } from '@/providers/PrivacyAnalytics'

export const PrivacyBanner: React.FC = () => {
  const { consent, gpcEnabled, setConsent } = usePrivacyAnalytics()

  if (consent !== 'unknown' || gpcEnabled) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-neutral-900 px-4 py-3 text-neutral-50 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm leading-snug">
          We use basic analytics to understand site usage and improve Pragmatic Papers. You can
          choose whether to allow this data collection.
        </p>
        <div className="flex w-full justify-end gap-2 sm:w-auto">
          <button
            type="button"
            className="rounded border border-neutral-500 px-3 py-1 text-xs font-medium text-neutral-100 hover:bg-neutral-800"
            onClick={() => setConsent(false)}
          >
            Decline
          </button>
          <button
            type="button"
            className="rounded bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-900 hover:bg-neutral-200"
            onClick={() => setConsent(true)}
          >
            Allow analytics
          </button>
        </div>
      </div>
    </div>
  )
}
