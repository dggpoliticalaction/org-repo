/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest'
import { RESTJSONErrorCodes } from 'discord.js'

import { ThreadUtils } from '../../src/utils/thread-utils.js'
import { createMockDiscordAPIError, createMockThreadChannel } from '../helpers/discord-mocks.js'

describe('ThreadUtils', () => {
  describe('archive', () => {
    it('should archive a thread', async () => {
      const mockThread = createMockThreadChannel({
        setArchived: vi.fn().mockResolvedValue({
          id: 'thread123',
          archived: true,
        }),
      })

      const result = await ThreadUtils.archive(mockThread as any)

      expect(mockThread.setArchived).toHaveBeenCalledWith(true)
      expect(result.archived).toBe(true)
    })

    it('should unarchive a thread when archived is false', async () => {
      const mockThread = createMockThreadChannel({
        setArchived: vi.fn().mockResolvedValue({
          id: 'thread123',
          archived: false,
        }),
      })

      const result = await ThreadUtils.archive(mockThread as any, false)

      expect(mockThread.setArchived).toHaveBeenCalledWith(false)
      expect(result.archived).toBe(false)
    })

    it('should return thread on ignored errors', async () => {
      const mockThread = createMockThreadChannel({
        id: 'thread123',
      })
      const error = createMockDiscordAPIError(
        RESTJSONErrorCodes.UnknownChannel,
        'Unknown channel',
        404,
        'PATCH',
        '/channels/123',
      )

      const setArchivedSpy = vi.spyOn(mockThread as any, 'setArchived').mockRejectedValue(error)

      const result = await ThreadUtils.archive(mockThread as any)

      expect(result).toBe(mockThread)
      setArchivedSpy.mockRestore()
    })

    it('should throw non-ignored errors', async () => {
      const mockThread = createMockThreadChannel({
        setArchived: vi.fn().mockRejectedValue(new Error('Network error')),
      })

      await expect(ThreadUtils.archive(mockThread as any)).rejects.toThrow('Network error')
    })
  })

  describe('lock', () => {
    it('should lock a thread', async () => {
      const mockThread = createMockThreadChannel({
        setLocked: vi.fn().mockResolvedValue({
          id: 'thread123',
          locked: true,
        }),
      })

      const result = await ThreadUtils.lock(mockThread as any)

      expect(mockThread.setLocked).toHaveBeenCalledWith(true)
      expect(result.locked).toBe(true)
    })

    it('should unlock a thread when locked is false', async () => {
      const mockThread = createMockThreadChannel({
        setLocked: vi.fn().mockResolvedValue({
          id: 'thread123',
          locked: false,
        }),
      })

      const result = await ThreadUtils.lock(mockThread as any, false)

      expect(mockThread.setLocked).toHaveBeenCalledWith(false)
      expect(result.locked).toBe(false)
    })

    it('should return thread on ignored errors', async () => {
      const mockThread = createMockThreadChannel({
        id: 'thread123',
      })
      const error = createMockDiscordAPIError(
        RESTJSONErrorCodes.UnknownChannel,
        'Unknown channel',
        404,
        'PATCH',
        '/channels/123',
      )

      const setLockedSpy = vi.spyOn(mockThread as any, 'setLocked').mockRejectedValue(error)

      const result = await ThreadUtils.lock(mockThread as any)

      expect(result).toBe(mockThread)
      setLockedSpy.mockRestore()
    })

    it('should throw non-ignored errors', async () => {
      const mockThread = createMockThreadChannel({
        setLocked: vi.fn().mockRejectedValue(new Error('Network error')),
      })

      await expect(ThreadUtils.lock(mockThread as any)).rejects.toThrow('Network error')
    })
  })
})
