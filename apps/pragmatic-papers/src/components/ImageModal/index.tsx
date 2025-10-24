'use client'

import React, { useEffect } from 'react'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { Media as MediaType } from '@/payload-types'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  resource: MediaType
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, resource }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const fullResUrl = getMediaUrl(resource.url, resource.updatedAt)
  const alt = resource.alt || ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close modal"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className="relative max-w-full max-h-full overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullResUrl}
          alt={alt}
          className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
          style={{ imageRendering: 'auto' }}
        />
      </div>
    </div>
  )
}
