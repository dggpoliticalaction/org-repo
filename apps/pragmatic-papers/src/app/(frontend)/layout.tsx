import type { Metadata } from 'next'

import { Libre_Franklin } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import { Source_Serif_4 } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/globals/Footer/Component'
import { Header } from '@/globals/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { GoogleAnalytics } from '@next/third-parties/google'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const libreFranklin = Libre_Franklin({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
})

// eslint-disable-next-line
const jetbrainsMono = JetBrains_Mono({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
})

// eslint-disable-next-line
const sourceSerif4 = Source_Serif_4({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
})

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={libreFranklin.className} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/manifest.json" rel="manifest" />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        <link
          href="/feed.articles"
          rel="alternate"
          title="Pragmatic Papers - Articles RSS Feed"
          type="application/rss+xml"
        />
        <link
          href="/feed.volumes"
          rel="alternate"
          title="Pragmatic Papers - Volumes RSS Feed"
          type="application/rss+xml"
        />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {children}
          <Footer />
          <GoogleAnalytics gaId="G-PXK2QL92HV" />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}
