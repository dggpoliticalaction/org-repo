'use client'

import type { FootnoteSelect as FootnoteSelectProps } from 'src/payload-types'

import { Select } from '@payloadcms/ui'
import React from 'react'

type Props = {
  className?: string
  allFootnotes?: { label: string; id: string }
} & FootnoteSelectProps

const FootnoteSelect: React.FC<Props> = (props) => {
  const { footnoteId } = props
  return <Select options={[{ label: 'this is a placeholder', options: [], value: footnoteId }]} />
}

export default FootnoteSelect
