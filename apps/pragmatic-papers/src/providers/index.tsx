import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { MathJaxContext } from 'better-react-mathjax'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <MathJaxContext>
      <ThemeProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </ThemeProvider>
    </MathJaxContext>
  )
}
