'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import React from 'react'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  title?: string
}

/**
 * @deprecated
 */
export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, children, title }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="flex h-full max-h-full max-w-full flex-col items-center justify-center border-0 bg-transparent p-4 [&_svg]:h-6 [&_svg]:w-6"
        onPointerDownOutside={onClose}
      >
        <DialogTitle className="sr-only">{title || 'Image Modal'}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  )
}
