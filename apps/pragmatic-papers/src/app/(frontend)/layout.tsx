import { AdminBar } from '@/components/AdminBar'
import { ThemeProvider } from '@/components/Providers/ThemeProvider'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import '@/styles/globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { cn } from '@/utilities/ui'
import { GoogleAnalytics } from '@next/third-parties/google'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { Open_Sans, Source_Serif_4 } from 'next/font/google'
import { draftMode } from 'next/headers'
import React from 'react'

const sourceSerif4 = Source_Serif_4({
  variable: '--font-serif',
  subsets: ['latin'],
})

const openSans = Open_Sans({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactNode> {
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
      <body className="flex min-h-screen flex-col items-center">
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
          <main className="container flex flex-1 items-center justify-center gap-3 px-4 md:p-6">
            {children}
          </main>
          <Footer />
          <GoogleAnalytics gaId="G-PXK2QL92HV" />
        </ThemeProvider>
      </body>
    </html>
  )
}
