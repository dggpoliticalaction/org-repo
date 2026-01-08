'use client'

import React from 'react'

import { usePrivacyAnalytics } from './PrivacyAnalyticsContext'
import Script from 'next/dist/client/script'

export const GoogleTagManager: React.FC = () => {
  const { shouldTrack } = usePrivacyAnalytics()

  const gtmId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID

  if (!shouldTrack || !gtmId) return null

  const scriptContent = ` (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\nnew Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n })(window,document,'script','dataLayer','${gtmId}');`

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: scriptContent,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}
