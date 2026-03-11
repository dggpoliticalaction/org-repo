import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { cn } from '@/utilities/ui'
import { GoogleAnalytics } from '@next/third-parties/google'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Open_Sans, Source_Serif_4 } from 'next/font/google'
import { draftMode } from 'next/headers'
import React from 'react'
import './globals.css'

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
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

  return (
    <html
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        sourceSerif4.className,
        openSans.className,
        'scroll-smooth',
      )}
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <Header />
          <main role="main" className="mt-4">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={googleAnalyticsId} />
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}
