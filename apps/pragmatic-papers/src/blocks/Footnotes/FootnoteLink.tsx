import React from 'react'
import type { FootnoteSelect as FootnoteSelectProps } from '@/payload-types'

type Props = {
  className?: string
} & FootnoteSelectProps

export const FootnoteLink: React.FC<Props> = (props) => {
  const { footnoteId } = props
  return <sup>pointing to {footnoteId}</sup>
}
