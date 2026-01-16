import type { User } from '@/payload-types'

// Role helpers shared across the app. Note that for public author pages
// and author listings we never treat admin accounts as authors.
export const isAdmin = (user: User): boolean => {
  return user.role === 'admin' || user.role === 'chief-editor'
}

export const isEditor = (user: User): boolean => {
  return user.role === 'editor' || isAdmin(user)
}

export const isWriter = (user: User): boolean => {
  return user.role === 'writer' || isEditor(user)
}
