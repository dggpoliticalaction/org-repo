import type { User } from '@/payload-types'

export const isAdmin = (user: User): boolean => {
  return user.role === 'admin' || user.role === 'chief-editor'
}

export const isEditor = (user: User): boolean => {
  return user.role === 'editor' || user.role === 'chief-editor'
}
