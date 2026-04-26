import type { Narration } from "@/payload-types"
import type { CollectionBeforeChangeHook } from "payload"

export const setCreatedBy: CollectionBeforeChangeHook<Narration> = ({
  req,
  operation,
  data,
}): Partial<Narration> | void => {
  if (operation === "create" && req.user) {
    data.createdBy = req.user.id
    return data
  }
}
