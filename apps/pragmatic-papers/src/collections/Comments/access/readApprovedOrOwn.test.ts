import { describe, it, expect, beforeEach } from 'vitest'
import { readApprovedOrOwn } from './readApprovedOrOwn'
import type { AccessArgs } from 'payload'

describe('readApprovedOrOwn', () => {
  let mockReq: {
    user: { id: string | number; role?: string } | null | undefined
  }

  beforeEach(() => {
    mockReq = {
      user: null,
    }
  })

  describe('Happy Path', () => {
    it('should return true for admin users', () => {
      mockReq.user = { id: 1, role: 'admin' }

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      expect(result).toBe(true)
    })

    it('should return true for editor users', () => {
      mockReq.user = { id: 2, role: 'editor' }

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      expect(result).toBe(true)
    })

    it('should return query for authenticated regular users to see approved or own comments', () => {
      mockReq.user = { id: 3, role: 'user' }

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      expect(result).toEqual({
        or: [
          {
            status: {
              equals: 'approved',
            },
          },
          {
            author: {
              equals: 3,
            },
          },
        ],
      })
    })

    it('should return query for anonymous users to see only approved comments', () => {
      mockReq.user = null

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      expect(result).toEqual({
        status: {
          equals: 'approved',
        },
      })
    })
  })

  describe('Sad Path', () => {
    it('should not allow unauthenticated users to see pending comments', () => {
      mockReq.user = null

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      expect(result).toEqual({
        status: {
          equals: 'approved',
        },
      })
      expect(result).not.toHaveProperty('or')
    })

    it('should not allow regular users to see all comments', () => {
      mockReq.user = { id: 5, role: 'user' }

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      expect(result).not.toBe(true)
      expect(result).toHaveProperty('or')
    })

    it('should not give regular users access to other users pending comments', () => {
      mockReq.user = { id: 10, role: 'user' }

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      // The query should only allow comments where:
      // 1. status is approved OR
      // 2. author is the current user
      expect(result).toEqual({
        or: [
          {
            status: {
              equals: 'approved',
            },
          },
          {
            author: {
              equals: 10,
            },
          },
        ],
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined user gracefully', () => {
      mockReq.user = undefined

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      expect(result).toEqual({
        status: {
          equals: 'approved',
        },
      })
    })

    it('should handle user with string ID', () => {
      mockReq.user = { id: 'user-123', role: 'user' }

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      expect(result).toEqual({
        or: [
          {
            status: {
              equals: 'approved',
            },
          },
          {
            author: {
              equals: 'user-123',
            },
          },
        ],
      })
    })

    it('should handle user with numeric ID', () => {
      mockReq.user = { id: 999, role: 'user' }

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      expect(result).toEqual({
        or: [
          {
            status: {
              equals: 'approved',
            },
          },
          {
            author: {
              equals: 999,
            },
          },
        ],
      })
    })

    it('should handle user without role as regular user', () => {
      mockReq.user = { id: 15 }

      const result = readApprovedOrOwn({
        req: mockReq,
      } as AccessArgs)

      expect(result).toEqual({
        or: [
          {
            status: {
              equals: 'approved',
            },
          },
          {
            author: {
              equals: 15,
            },
          },
        ],
      })
    })

    it('should distinguish between admin/editor and other roles', () => {
      const mockReqWithCustomRole = {
        user: { id: 20, role: 'moderator' },
      }

      const result = readApprovedOrOwn({
        req: mockReqWithCustomRole,
      } as AccessArgs)

      // Should not return true (not full access)
      expect(result).not.toBe(true)
      // Should have or condition
      expect(result).toHaveProperty('or')
    })

    it('should handle empty request object', () => {
      const emptyReq = {} as { user: null }

      const result = readApprovedOrOwn({
        req: emptyReq,
      } as AccessArgs)

      expect(result).toEqual({
        status: {
          equals: 'approved',
        },
      })
    })
  })
})
