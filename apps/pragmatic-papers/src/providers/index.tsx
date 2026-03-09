'use client'

import React from 'react'
import { ThemeProvider } from 'next-themes'
import { MathJaxContext } from 'better-react-mathjax'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <MathJaxContext>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </MathJaxContext>
  )
}
