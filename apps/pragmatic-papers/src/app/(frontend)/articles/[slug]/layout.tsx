import { MathJaxContext } from 'better-react-mathjax'
import React from 'react'

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  return <MathJaxContext>{children}</MathJaxContext>
}
