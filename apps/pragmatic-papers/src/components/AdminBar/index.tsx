"use client"

import type { PayloadAdminBarProps, PayloadMeUser } from "@payloadcms/admin-bar"

import { cn } from "@/utilities/ui"
import { PayloadAdminBar } from "@payloadcms/admin-bar"
import { useRouter, useSelectedLayoutSegments } from "next/navigation"
import React, { useState } from "react"

import "./index.scss"

import { PaperIcon } from "@/components/Logo/icons/PaperIcon"
import { getClientSideURL } from "@/utilities/getURL"

const baseClass = "admin-bar"

const collectionLabels = {
  pages: {
    plural: "Pages",
    singular: "Page",
  },
}

const Title: React.FC = () => (
  <div className="group flex items-center gap-2">
    <PaperIcon className="group-hover:text-brand h-4 w-4" />
    <span className="group-hover:underline">Dashboard</span>
  </div>
)

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : "pages"
  ) as keyof typeof collectionLabels
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  return (
    <div
      className={cn(baseClass, "bg-black py-2 text-white", {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: "font-medium text-white",
            logo: "text-white",
            user: "text-white",
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || "Pages",
            singular: collectionLabels[collection]?.singular || "Page",
          }}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch("/next/exit-preview").then(() => {
              router.push("/")
              router.refresh()
            })
          }}
          style={{
            backgroundColor: "transparent",
            padding: 0,
            position: "relative",
            zIndex: "unset",
          }}
        />
      </div>
    </div>
  )
}
