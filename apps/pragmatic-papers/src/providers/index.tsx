import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { MathJaxContext } from 'better-react-mathjax'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <MathJaxContext src="/mathjax/js/tex-chtml-full-speech.js">
      <ThemeProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </ThemeProvider>
    </MathJaxContext>
  )
}
