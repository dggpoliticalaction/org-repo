import RichText from '@/components/RichText'
import React from 'react'

import { Width } from '../Width'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export const Message: React.FC<{ message: SerializedEditorState }> = ({ message }) => {
  return (
    <Width className="my-12" width="100">
      {message && <RichText data={message} />}
    </Width>
  )
}
