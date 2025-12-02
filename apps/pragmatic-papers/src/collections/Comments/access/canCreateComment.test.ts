import { describe, it, expect, vi, beforeEach } from 'vitest'
import { canCreateComment } from './canCreateComment'
import type { AccessArgs } from 'payload'

describe('canCreateComment', () => {
  let mockPayload: {
    findByID: ReturnType<typeof vi.fn>
  }
  let mockReq: {
    payload: typeof mockPayload
    user: { id: string | number; role: string } | null
  }

  beforeEach(() => {
    mockPayload = {
      findByID: vi.fn(),
    }

    mockReq = {
      payload: mockPayload,
      user: null,
    }
  })

  describe('Happy Path', () => {
    it('should allow comment creation when article has comments enabled', async () => {
      const mockArticle = {
        id: '123',
        commentsEnabled: true,
      }

      mockPayload.findByID.mockResolvedValue(mockArticle)

      const result = await canCreateComment({
        req: mockReq,
        data: { article: '123' },
      } as AccessArgs)

      expect(result).toBe(true)
      expect(mockPayload.findByID).toHaveBeenCalledWith({
        collection: 'articles',
        id: '123',
        depth: 0,
      })
    })

    it('should allow comment creation for authenticated users when comments enabled', async () => {
      mockReq.user = { id: 'user-1', role: 'user' }
      const mockArticle = {
        id: '123',
        commentsEnabled: true,
      }

      mockPayload.findByID.mockResolvedValue(mockArticle)

      const result = await canCreateComment({
        req: mockReq,
        data: { article: '123' },
      } as AccessArgs)

      expect(result).toBe(true)
    })

    it('should handle article as object with id property', async () => {
      const mockArticle = {
        id: '456',
        commentsEnabled: true,
      }

      mockPayload.findByID.mockResolvedValue(mockArticle)

      const result = await canCreateComment({
        req: mockReq,
        data: { article: { id: '456', title: 'Test Article' } },
      } as AccessArgs)

      expect(result).toBe(true)
      expect(mockPayload.findByID).toHaveBeenCalledWith({
        collection: 'articles',
        id: '456',
        depth: 0,
      })
    })
  })

  describe('Sad Path', () => {
    it('should deny comment creation when article has comments disabled', async () => {
      const mockArticle = {
        id: '123',
        commentsEnabled: false,
      }

      mockPayload.findByID.mockResolvedValue(mockArticle)

      const result = await canCreateComment({
        req: mockReq,
        data: { article: '123' },
      } as AccessArgs)

      expect(result).toBe(false)
    })

    it('should deny comment creation when article does not exist', async () => {
      mockPayload.findByID.mockRejectedValue(new Error('Article not found'))

      const result = await canCreateComment({
        req: mockReq,
        data: { article: '999' },
      } as AccessArgs)

      expect(result).toBe(false)
    })

    it('should deny comment creation when no article is provided', async () => {
      const result = await canCreateComment({
        req: mockReq,
        data: {},
      } as AccessArgs)

      expect(result).toBe(false)
      expect(mockPayload.findByID).not.toHaveBeenCalled()
    })

    it('should deny comment creation when commentsEnabled is null', async () => {
      const mockArticle = {
        id: '123',
        commentsEnabled: null,
      }

      mockPayload.findByID.mockResolvedValue(mockArticle)

      const result = await canCreateComment({
        req: mockReq,
        data: { article: '123' },
      } as AccessArgs)

      expect(result).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle article ID as number', async () => {
      const mockArticle = {
        id: 789,
        commentsEnabled: true,
      }

      mockPayload.findByID.mockResolvedValue(mockArticle)

      const result = await canCreateComment({
        req: mockReq,
        data: { article: 789 },
      } as AccessArgs)

      expect(result).toBe(true)
      expect(mockPayload.findByID).toHaveBeenCalledWith({
        collection: 'articles',
        id: 789,
        depth: 0,
      })
    })

    it('should handle database errors gracefully', async () => {
      mockPayload.findByID.mockRejectedValue(new Error('Database connection failed'))

      const result = await canCreateComment({
        req: mockReq,
        data: { article: '123' },
      } as AccessArgs)

      expect(result).toBe(false)
    })

    it('should deny comment creation when article data is undefined', async () => {
      const result = await canCreateComment({
        req: mockReq,
        data: { article: undefined },
      } as AccessArgs)

      expect(result).toBe(false)
    })

    it('should respect commentsEnabled even for admin users', async () => {
      mockReq.user = { id: 'admin-1', role: 'admin' }
      const mockArticle = {
        id: '123',
        commentsEnabled: false,
      }

      mockPayload.findByID.mockResolvedValue(mockArticle)

      const result = await canCreateComment({
        req: mockReq,
        data: { article: '123' },
      } as AccessArgs)

      expect(result).toBe(false)
    })
  })
})
