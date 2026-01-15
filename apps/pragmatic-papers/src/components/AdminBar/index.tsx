'use client'

import { getClientSideURL } from '@/utilities/getURL'
import { cn } from '@/utilities/ui'
import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import { useRouter, useSelectedLayoutSegments } from 'next/navigation'
import React, { useState } from 'react'
import './index.scss'

const collectionLabels = {
  articles: {
    plural: 'Articles',
    singular: 'Article',
  },
  categories: {
    plural: 'Categories',
    singular: 'Category',
  },
  pages: {
    plural: 'Pages',
    singular: 'Page',
  },
  users: {
    plural: 'Users',
    singular: 'User',
  },
  volumes: {
    plural: 'Volumes',
    singular: 'Volume',
  },
}

export const AdminBar: React.FC<PayloadAdminBarProps> = ({ ...props }) => {
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'pages'
  ) as keyof typeof collectionLabels
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  return (
    <div
      className={cn(
        'admin-bar',
        'bg-background flex w-full justify-center py-2',
        show ? 'block' : 'hidden',
      )}
    >
      <div className="container p-4 md:p-6">
        <PayloadAdminBar
          {...props}
          className="text-foreground! py-2"
          classNames={{
            controls: 'font-medium',
            logo: '',
            user: '',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Pages',
            singular: collectionLabels[collection]?.singular || 'Page',
          }}
          logo={<span>Dashboard</span>}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
