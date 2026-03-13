"use client"

import { PaperIcon } from "@/components/Logo/icons/PaperIcon"
import { getClientSideURL } from "@/utilities/getURL"
import type { PayloadAdminBarProps } from "@payloadcms/admin-bar"
import { PayloadAdminBar } from "@payloadcms/admin-bar"
import { useRouter, useSelectedLayoutSegments } from "next/navigation"

const labels = new Map<string, { plural: string; singular: string }>([
  ["pages", { plural: "Pages", singular: "Page" }],
  ["volumes", { plural: "Volumes", singular: "Volume" }],
  ["articles", { plural: "Articles", singular: "Article" }],
  ["authors", { plural: "Authors", singular: "Author" }],
  ["topics", { plural: "Topics", singular: "Topic" }],
])

const labelKeys = Array.from(labels.keys())

export const AdminBarClient: React.FC<PayloadAdminBarProps> = (props) => {
  const [segment] = useSelectedLayoutSegments()
  const router = useRouter()

  const collection = (labelKeys.includes(segment || "") ? segment : "pages") as string
  const collectionLabels = labels.get(collection)

  function onPreviewExit() {
    fetch("/next/exit-preview").then(() => {
      router.push("/")
      router.refresh()
    })
  }

  return (
    <div className="dark bg-background text-foreground h-8 w-full">
      <PayloadAdminBar
        {...props}
        unstyled
        className="container flex gap-1.5 px-6 py-2 text-xs"
        classNames={{
          logo: "hover:text-brand",
          user: "underline-offset-2 hover:underline",
          controls: "ml-auto underline-offset-2 hover:underline",
          create: "underline-offset-2 hover:underline",
          edit: "underline-offset-2 hover:underline",
          preview: "underline-offset-2 hover:underline",
          logout: "underline-offset-2 hover:underline",
        }}
        cmsURL={getClientSideURL()}
        collectionSlug={collection}
        collectionLabels={collectionLabels}
        logo={<PaperIcon className="size-4" />}
        // onAuthChange={onAuthChange}
        onPreviewExit={onPreviewExit}
      />
    </div>
  )
}
