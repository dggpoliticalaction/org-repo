import config from "@payload-config"
import { draftMode, headers as getHeaders } from "next/headers"
import { getPayload } from "payload"
import React from "react"

import { AdminBarClient } from "./client"

export async function AdminBar(): Promise<React.ReactElement | null> {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers, canSetHeaders: false })
  console.log(user)
  if (!user) return null
  const { isEnabled } = await draftMode()
  return <AdminBarClient preview={isEnabled} />
}
