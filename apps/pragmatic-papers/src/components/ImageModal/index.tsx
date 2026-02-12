'use client'

import React from 'react'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { Media as MediaType } from '@/payload-types'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import RichText from '@/components/RichText'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  resource?: MediaType
  children?: React.ReactNode
  title?: string
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, resource, children, title }) => {
  const fullResUrl = resource ? getMediaUrl(resource.url, resource.updatedAt) : undefined
  const alt = title || resource?.alt || ''

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] p-4 border-0 bg-background"
        onPointerDownOutside={onClose}
      >
        {/*We have to set a DialogTitle to stop a acessibility error. The image alt text seems appropriate */}
        <DialogTitle className="sr-only">{alt}</DialogTitle> 
        <div className="flex flex-col items-center gap-3 h-full overflow-auto">
          {children ? (children) : resource ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fullResUrl}
                alt={alt}
                className="w-full h-auto object-contain max-h-[85vh]"
              />
              {/*Show the caption at the bottom of the modal*/}
              {resource.caption && (
                <div className="text-center text-white/90 max-w-3xl">
                  <RichText
                    data={resource.caption}
                    enableGutter={false}
                    enableProse={false}
                    className="text-sm not-prose"
                  />
                </div>
              )}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
