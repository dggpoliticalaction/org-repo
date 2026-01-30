/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest'
import { EmbedBuilder, RESTJSONErrorCodes, type Message } from 'discord.js'

import { MessageUtils } from '../../src/utils/message-utils.js'
import {
  createMockDiscordAPIError,
  createMockGuildChannel,
  createMockUser,
} from '../helpers/discord-mocks.js'

describe('MessageUtils', () => {
  describe('send', () => {
    it('should send a string message', async () => {
      const mockChannel = createMockGuildChannel({
        send: vi.fn().mockResolvedValue({ id: 'msg123' }),
      })

      const result = await MessageUtils.send(mockChannel as any, 'Hello world')

      expect(mockChannel.send).toHaveBeenCalledWith({ content: 'Hello world' })
      expect(result).toEqual({ id: 'msg123' })
    })

    it('should send an EmbedBuilder', async () => {
      const mockChannel = createMockGuildChannel({
        send: vi.fn().mockResolvedValue({ id: 'msg123' }),
      })
      const embed = new EmbedBuilder().setTitle('Test')

      const result = await MessageUtils.send(mockChannel as any, embed)

      expect(mockChannel.send).toHaveBeenCalledWith({ embeds: [embed] })
      expect(result).toEqual({ id: 'msg123' })
    })

    it('should send BaseMessageOptions', async () => {
      const mockChannel = createMockGuildChannel({
        send: vi.fn().mockResolvedValue({ id: 'msg123' }),
      })
      const options = { content: 'Hello', embeds: [] }

      const result = await MessageUtils.send(mockChannel as any, options)

      expect(mockChannel.send).toHaveBeenCalledWith(options)
      expect(result).toEqual({ id: 'msg123' })
    })

    it('should send to a User', async () => {
      const mockUser = createMockUser({
        send: vi.fn().mockResolvedValue({ id: 'msg123' }),
      })

      const result = await MessageUtils.send(mockUser as any, 'Hello')

      expect(mockUser.send).toHaveBeenCalledWith({ content: 'Hello' })
      expect(result).toEqual({ id: 'msg123' })
    })

    it('should return null for ignored errors', async () => {
      const mockChannel = createMockGuildChannel({
        send: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.UnknownMessage,
              'Unknown message',
              404,
              'GET',
              '/channels/123/messages',
            ),
          ),
      })

      const result = await MessageUtils.send(mockChannel as any, 'Hello')

      expect(result).toBeNull()
    })

    it('should throw non-ignored errors', async () => {
      const mockChannel = createMockGuildChannel({
        send: vi.fn().mockRejectedValue(new Error('Network error')),
      })

      await expect(MessageUtils.send(mockChannel as any, 'Hello')).rejects.toThrow('Network error')
    })

    it('should return null for PartialGroupDMChannel', async () => {
      const { PartialGroupDMChannel } = await import('discord.js')
      const mockChannel = Object.create(PartialGroupDMChannel.prototype, {
        id: { value: 'group123', writable: true },
        type: { value: 3, writable: true },
      })

      const result = await MessageUtils.send(mockChannel as any, 'Hello')

      expect(result).toBeNull()
    })
  })

  describe('reply', () => {
    it('should reply with a string message', async () => {
      const mockMessage = {
        id: 'msg123',
        reply: vi.fn().mockResolvedValue({ id: 'reply123' }),
      } as unknown as Message

      const result = await MessageUtils.reply(mockMessage, 'Hello world')

      expect(mockMessage.reply).toHaveBeenCalledWith({ content: 'Hello world' })
      expect(result).toEqual({ id: 'reply123' })
    })

    it('should reply with an EmbedBuilder', async () => {
      const mockMessage = {
        id: 'msg123',
        reply: vi.fn().mockResolvedValue({ id: 'reply123' }),
      } as unknown as Message
      const embed = new EmbedBuilder().setTitle('Test')

      const result = await MessageUtils.reply(mockMessage, embed)

      expect(mockMessage.reply).toHaveBeenCalledWith({ embeds: [embed] })
      expect(result).toEqual({ id: 'reply123' })
    })

    it('should return null for ignored errors', async () => {
      const mockMessage = {
        id: 'msg123',
        reply: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.UnknownChannel,
              'Unknown channel',
              404,
              'POST',
              '/channels/123/messages',
            ),
          ),
      } as unknown as Message

      const result = await MessageUtils.reply(mockMessage, 'Hello')

      expect(result).toBeNull()
    })

    it('should throw non-ignored errors', async () => {
      const mockMessage = {
        id: 'msg123',
        reply: vi.fn().mockRejectedValue(new Error('Network error')),
      } as unknown as Message

      await expect(MessageUtils.reply(mockMessage, 'Hello')).rejects.toThrow('Network error')
    })
  })

  describe('edit', () => {
    it('should edit with a string message', async () => {
      const mockMessage = {
        id: 'msg123',
        edit: vi.fn().mockResolvedValue({ id: 'msg123' }),
      } as unknown as Message

      const result = await MessageUtils.edit(mockMessage, 'Updated content')

      expect(mockMessage.edit).toHaveBeenCalledWith({ content: 'Updated content' })
      expect(result).toEqual({ id: 'msg123' })
    })

    it('should edit with an EmbedBuilder', async () => {
      const mockMessage = {
        id: 'msg123',
        edit: vi.fn().mockResolvedValue({ id: 'msg123' }),
      } as unknown as Message
      const embed = new EmbedBuilder().setTitle('Updated')

      const result = await MessageUtils.edit(mockMessage, embed)

      expect(mockMessage.edit).toHaveBeenCalledWith({ embeds: [embed] })
      expect(result).toEqual({ id: 'msg123' })
    })

    it('should return null for ignored errors', async () => {
      const mockMessage = {
        id: 'msg123',
        edit: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.UnknownMessage,
              'Unknown message',
              404,
              'PATCH',
              '/channels/123/messages/123',
            ),
          ),
      } as unknown as Message

      const result = await MessageUtils.edit(mockMessage, 'Updated')

      expect(result).toBeNull()
    })
  })

  describe('react', () => {
    it('should react to a message', async () => {
      const mockMessage = {
        id: 'msg123',
        react: vi.fn().mockResolvedValue({ emoji: { name: '👍' } }),
      } as unknown as Message

      const result = await MessageUtils.react(mockMessage, '👍')

      expect(mockMessage.react).toHaveBeenCalledWith('👍')
      expect(result).toEqual({ emoji: { name: '👍' } })
    })

    it('should return null for ignored errors', async () => {
      const mockMessage = {
        id: 'msg123',
        react: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.ReactionWasBlocked,
              'Reaction blocked',
              403,
              'PUT',
              '/channels/123/messages/123/reactions/👍/@me',
            ),
          ),
      } as unknown as Message

      const result = await MessageUtils.react(mockMessage, '👍')

      expect(result).toBeNull()
    })
  })

  describe('pin', () => {
    it('should pin a message', async () => {
      const mockMessage = {
        id: 'msg123',
        pin: vi.fn().mockResolvedValue({ id: 'msg123' }),
      } as unknown as Message

      const result = await MessageUtils.pin(mockMessage)

      expect(mockMessage.pin).toHaveBeenCalled()
      expect(result).toEqual({ id: 'msg123' })
    })

    it('should unpin a message when pinned is false', async () => {
      const mockMessage = {
        id: 'msg123',
        unpin: vi.fn().mockResolvedValue({ id: 'msg123' }),
      } as unknown as Message

      const result = await MessageUtils.pin(mockMessage, false)

      expect(mockMessage.unpin).toHaveBeenCalled()
      expect(result).toEqual({ id: 'msg123' })
    })

    it('should return null for ignored errors', async () => {
      const mockMessage = {
        id: 'msg123',
        pin: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.UnknownMessage,
              'Unknown message',
              404,
              'PUT',
              '/channels/123/pins/123',
            ),
          ),
      } as unknown as Message

      const result = await MessageUtils.pin(mockMessage)

      expect(result).toBeNull()
    })
  })

  describe('startThread', () => {
    it('should start a thread', async () => {
      const mockMessage = {
        id: 'msg123',
        startThread: vi.fn().mockResolvedValue({ id: 'thread123' }),
      } as unknown as Message

      const result = await MessageUtils.startThread(mockMessage, { name: 'Test Thread' })

      expect(mockMessage.startThread).toHaveBeenCalledWith({ name: 'Test Thread' })
      expect(result).toEqual({ id: 'thread123' })
    })

    it('should return null for ignored errors', async () => {
      const mockMessage = {
        id: 'msg123',
        startThread: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.MaximumActiveThreads,
              'Too many threads',
              400,
              'POST',
              '/channels/123/messages/123/threads',
            ),
          ),
      } as unknown as Message

      const result = await MessageUtils.startThread(mockMessage, { name: 'Test' })

      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete a message', async () => {
      const mockMessage = {
        id: 'msg123',
        delete: vi.fn().mockResolvedValue({ id: 'msg123' }),
      } as unknown as Message

      const result = await MessageUtils.delete(mockMessage)

      expect(mockMessage.delete).toHaveBeenCalled()
      expect(result).toEqual({ id: 'msg123' })
    })

    it('should return null for ignored errors', async () => {
      const mockMessage = {
        id: 'msg123',
        delete: vi
          .fn()
          .mockRejectedValue(
            createMockDiscordAPIError(
              RESTJSONErrorCodes.UnknownMessage,
              'Unknown message',
              404,
              'DELETE',
              '/channels/123/messages/123',
            ),
          ),
      } as unknown as Message

      const result = await MessageUtils.delete(mockMessage)

      expect(result).toBeNull()
    })
  })
})
