'use client'

import { MathJaxContext } from 'better-react-mathjax'
import React from 'react'

export const MathJaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <MathJaxContext>{children}</MathJaxContext>
}
