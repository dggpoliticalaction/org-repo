import { draftMode } from "next/headers"
import React from "react"

import { getAuth } from "@/utilities/getAuth"
import { AdminBarClient } from "./client"

export async function AdminBar(): Promise<React.ReactNode> {
  const { isEnabled } = await draftMode()
  const { user } = await getAuth()
  if (!user) return null
  return (
    <div className="h-8 w-full bg-black text-white">
      <AdminBarClient preview={isEnabled} />
    </div>
  )
}
