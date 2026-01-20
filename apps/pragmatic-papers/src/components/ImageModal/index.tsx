'use client'

import React from 'react'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { Media as MediaType } from '@/payload-types'
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  resource: MediaType
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, resource }) => {
  const fullResUrl = getMediaUrl(resource.url, resource.updatedAt)
  const alt = resource.alt || ''

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-transparent">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullResUrl}
          alt={alt}
          className="w-full h-full object-contain max-h-[95vh]"
        />
      </DialogContent>
    </Dialog>
  )
}
