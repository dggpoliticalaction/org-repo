import React from 'react'

interface FootnoteLabelProps {
  siblingData: {
    note?: string
  }
}

export const FootnoteLabel: React.FC<FootnoteLabelProps> = ({ siblingData: { note } }) => {
  if (!note) return null
  const snippet = note && note.length > 15 ? `${note.slice(0, 15)}...` : note
  return <span>{snippet}</span>
}
