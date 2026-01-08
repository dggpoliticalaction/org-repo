'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CONSENT_COOKIE_NAME = 'pp_analytics_consent'
const CONSENT_COOKIE_MAX_AGE_DAYS = 365

export type ConsentState = 'granted' | 'denied' | 'unknown'

export interface PrivacyAnalyticsContextValue {
  consent: ConsentState
  gpcEnabled: boolean
  shouldTrack: boolean
  setConsent: (granted: boolean) => void
}

const PrivacyAnalyticsContext = createContext<PrivacyAnalyticsContextValue | undefined>(undefined)

const getInitialConsentState = (initialConsent: boolean | null | undefined): ConsentState => {
  if (initialConsent === true) return 'granted'
  if (initialConsent === false) return 'denied'
  return 'unknown'
}

const readConsentFromCookie = (): ConsentState => {
  if (typeof document === 'undefined') return 'unknown'

  const match = document.cookie.match(
    new RegExp(
      '(?:^|; )' + CONSENT_COOKIE_NAME.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)',
    ),
  )

  if (!match) return 'unknown'

  const rawValue = match[1]
  if (!rawValue) return 'unknown'

  const value = decodeURIComponent(rawValue)
  if (value === 'granted' || value === 'denied') return value

  return 'unknown'
}

const writeConsentCookie = (state: ConsentState) => {
  if (typeof document === 'undefined') return
  const maxAgeSeconds = CONSENT_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60
  document.cookie = `${CONSENT_COOKIE_NAME}=${state};path=/;max-age=${maxAgeSeconds};SameSite=Lax`
}

export interface PrivacyAnalyticsProviderProps {
  children: React.ReactNode
  initialConsent?: boolean | null
}

export const PrivacyAnalyticsProvider: React.FC<PrivacyAnalyticsProviderProps> = ({
  children,
  initialConsent,
}) => {
  const [consent, setConsentState] = useState<ConsentState>(() =>
    getInitialConsentState(initialConsent ?? null),
  )

  const [gpcEnabled, setGpcEnabled] = useState(false)

  useEffect(() => {
    if (consent !== 'unknown') return

    const fromCookie = readConsentFromCookie()
    if (fromCookie !== 'unknown') {
      setConsentState(fromCookie)
    }
  }, [consent])

  useEffect(() => {
    if (typeof navigator === 'undefined') return

    const maybeGpc = (navigator as unknown as { globalPrivacyControl?: boolean })
      .globalPrivacyControl
    if (typeof maybeGpc === 'boolean') {
      setGpcEnabled(maybeGpc)
    }
  }, [])

  const setConsent = (granted: boolean) => {
    const next: ConsentState = granted ? 'granted' : 'denied'
    setConsentState(next)
    writeConsentCookie(next)
  }

  const value = useMemo<PrivacyAnalyticsContextValue>(
    () => ({
      consent,
      gpcEnabled,
      shouldTrack: consent === 'granted' && !gpcEnabled,
      setConsent,
    }),
    [consent, gpcEnabled],
  )

  return (
    <PrivacyAnalyticsContext.Provider value={value}>{children}</PrivacyAnalyticsContext.Provider>
  )
}

export const usePrivacyAnalytics = (): PrivacyAnalyticsContextValue => {
  const ctx = useContext(PrivacyAnalyticsContext)
  if (!ctx) {
    throw new Error('usePrivacyAnalytics must be used within a PrivacyAnalyticsProvider')
  }
  return ctx
}
