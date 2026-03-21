import type { GlobalAfterChangeHook } from "payload"

import { revalidatePath, revalidateTag } from "next/cache"

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)
    revalidateTag("global_header")
    revalidatePath("/", "layout")
  }

  return doc
}
