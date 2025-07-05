'use client'
import React from 'react'

import { useState, useEffect } from 'react'

import { MathJax } from 'better-react-mathjax'

export interface MathBlockProps {
  math: string
  blockType: 'inlineMathBlock' | 'displayMathBlock'
}

export const MathBlock: React.FC<MathBlockProps> = (props) => {
  const { math, blockType } = props
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!math) return null

  const isInline = blockType === 'inlineMathBlock'

  return (
    <>
      {isClient ? (
        isInline ? (
          <MathJax inline>\({math}\)</MathJax>
        ) : (
          <div className="my-4 flex justify-center">
            <MathJax>\[{math}\]</MathJax>
          </div>
        )
      ) : null}
    </>
  )
}
