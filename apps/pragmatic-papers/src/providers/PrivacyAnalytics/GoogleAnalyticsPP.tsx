'use client'

import React from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'

import { usePrivacyAnalytics } from './PrivacyAnalyticsContext'

export const GoogleAnalyticsPP: React.FC = () => {
  const { shouldTrack } = usePrivacyAnalytics()

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!shouldTrack || !measurementId) return null

  return <GoogleAnalytics gaId={measurementId} />
}
