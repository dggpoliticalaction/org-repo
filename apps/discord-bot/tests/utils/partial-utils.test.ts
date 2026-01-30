/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest'
import { RESTJSONErrorCodes, type Message, type MessageReaction } from 'discord.js'

import { PartialUtils } from '../../src/utils/partial-utils.js'
import { createMockDiscordAPIError, createMockUser } from '../helpers/discord-mocks.js'

describe('PartialUtils', () => {
  describe('fillUser', () => {
    it('should return user as-is when not partial', async () => {
      const mockUser = createMockUser({ partial: false })

      const result = await PartialUtils.fillUser(mockUser as any)

      expect(result).toBe(mockUser)
    })

    it('should fetch and return user when partial', async () => {
      const mockUser = createMockUser({
        partial: true,
        fetch: vi.fn().mockResolvedValue(createMockUser({ partial: false })),
      })

      const result = await PartialUtils.fillUser(mockUser as any)

      expect(mockUser.fetch).toHaveBeenCalled()
      expect(result).toBeDefined()
      expect(result?.partial).toBe(false)
    })

    it('should return null for ignored errors', async () => {
      const mockUser = createMockUser({
        partial: true,
        fetch: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.UnknownUser,
              'Unknown user',
              404,
              'GET',
              '/users/123',
            ),
          ),
      })

      const result = await PartialUtils.fillUser(mockUser as any)

      expect(result).toBeNull()
    })

    it('should throw non-ignored errors', async () => {
      const mockUser = createMockUser({
        partial: true,
        fetch: vi.fn().mockRejectedValue(new Error('Network error')),
      })

      await expect(PartialUtils.fillUser(mockUser as any)).rejects.toThrow('Network error')
    })
  })

  describe('fillMessage', () => {
    it('should return message as-is when not partial', async () => {
      const mockMessage = {
        id: 'msg123',
        partial: false,
      } as unknown as Message

      const result = await PartialUtils.fillMessage(mockMessage)

      expect(result).toBe(mockMessage)
    })

    it('should fetch and return message when partial', async () => {
      const filledMessage = {
        id: 'msg123',
        partial: false,
      } as unknown as Message

      const mockMessage = {
        id: 'msg123',
        partial: true,
        fetch: vi.fn().mockResolvedValue(filledMessage),
      } as unknown as Message

      const result = await PartialUtils.fillMessage(mockMessage)

      expect(mockMessage.fetch).toHaveBeenCalled()
      expect(result).toBe(filledMessage)
    })

    it('should return null for ignored errors', async () => {
      const mockMessage = {
        id: 'msg123',
        partial: true,
        fetch: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.UnknownMessage,
              'Unknown message',
              404,
              'GET',
              '/channels/123/messages/123',
            ),
          ),
      } as unknown as Message

      const result = await PartialUtils.fillMessage(mockMessage)

      expect(result).toBeNull()
    })

    it('should throw non-ignored errors', async () => {
      const mockMessage = {
        id: 'msg123',
        partial: true,
        fetch: vi.fn().mockRejectedValue(new Error('Network error')),
      } as unknown as Message

      await expect(PartialUtils.fillMessage(mockMessage)).rejects.toThrow('Network error')
    })
  })

  describe('fillReaction', () => {
    it('should return reaction as-is when not partial', async () => {
      const mockMessage = {
        id: 'msg123',
        partial: false,
      } as unknown as Message

      const mockReaction = {
        emoji: { name: '👍' },
        message: mockMessage,
        partial: false,
      } as unknown as MessageReaction

      const result = await PartialUtils.fillReaction(mockReaction)

      expect(result).toBe(mockReaction)
    })

    it('should fetch reaction when partial', async () => {
      const filledMessage = {
        id: 'msg123',
        partial: false,
      } as unknown as Message

      const filledReaction = {
        emoji: { name: '👍' },
        message: filledMessage,
        partial: false,
      } as unknown as MessageReaction

      const mockMessage = {
        id: 'msg123',
        partial: false,
      } as unknown as Message

      const mockReaction = {
        emoji: { name: '👍' },
        message: mockMessage,
        partial: true,
        fetch: vi.fn().mockResolvedValue(filledReaction),
      } as unknown as MessageReaction

      const result = await PartialUtils.fillReaction(mockReaction)

      expect(mockReaction.fetch).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should return null when message cannot be filled', async () => {
      const mockMessage = {
        id: 'msg123',
        partial: true,
        fetch: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.UnknownMessage,
              'Unknown message',
              404,
              'GET',
              '/channels/123/messages/123',
            ),
          ),
      } as unknown as Message

      const mockReaction = {
        emoji: { name: '👍' },
        message: mockMessage,
        partial: false,
      } as unknown as MessageReaction

      const result = await PartialUtils.fillReaction(mockReaction)

      expect(result).toBeNull()
    })

    it('should return null for ignored errors when fetching reaction', async () => {
      const mockMessage = {
        id: 'msg123',
        partial: false,
      } as unknown as Message

      const mockReaction = {
        emoji: { name: '👍' },
        message: mockMessage,
        partial: true,
        fetch: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.UnknownMessage,
              'Unknown message',
              404,
              'GET',
              '/channels/123/messages/123',
            ),
          ),
      } as unknown as MessageReaction

      const result = await PartialUtils.fillReaction(mockReaction)

      expect(result).toBeNull()
    })
  })
})
