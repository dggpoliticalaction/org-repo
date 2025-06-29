import type { Access } from 'payload'
import { isAdmin, isEditor } from './checkRole'

export const editor: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  return (
    isEditor(user) ||
    isAdmin(user) || {
      id: { equals: user.id },
    }
  )
}
