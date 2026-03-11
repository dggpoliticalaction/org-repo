import type { Access } from 'payload'

// Anyone who is authenticated can access this collection
export const authenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}
