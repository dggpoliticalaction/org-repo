import React from 'react'

interface AdminFootnoteBlockProps {
  siblingData: {
    note?: string
  }
}

const AdminFootnoteBlock: React.FC<AdminFootnoteBlockProps> = ({ siblingData }) => {
  const note = siblingData.note || ''
  const snippet = note.length > 15 ? `${note.slice(0, 15)}...` : note

  return <span>{`Footnote${snippet ? `: ${snippet}` : ''}`}</span>
}

export default AdminFootnoteBlock
