import type { Access, Where } from 'payload'

import { isAdmin, isEditor } from '@/access/checkRole'

export const readApprovedOrOwn: Access = ({ req }) => {
  // Editors and admins can see all comments
  if (req.user && (isAdmin(req.user) || isEditor(req.user))) {
    return true
  }

  if (req.user) {
    const query: Where = {
      or: [
        {
          status: {
            equals: 'approved',
          },
        },
        {
          author: {
            equals: req.user.id,
          },
        },
      ],
    }
    return query
  }

  return {
    status: {
      equals: 'approved',
    },
  }
}
