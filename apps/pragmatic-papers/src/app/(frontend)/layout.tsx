import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Source_Serif_4 } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { GoogleAnalytics } from '@next/third-parties/google'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

import { Open_Sans } from 'next/font/google'

const sourceSerif4 = Source_Serif_4({
  variable: '--font-serif',
  subsets: ['latin'],
})

const openSans = Open_Sans({
  subsets: ['latin'],
})

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        sourceSerif4.className,
        openSans.className,
      )}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
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
