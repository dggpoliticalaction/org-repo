/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Locale } from 'discord.js'

import { EventDataService } from '../../src/services/event-data-service.js'
import { createMockUser } from '../helpers/discord-mocks.js'

describe('EventDataService', () => {
  let service: EventDataService

  beforeEach(() => {
    service = new EventDataService()
  })

  describe('create', () => {
    it('should create EventData with default language when no guild provided', async () => {
      const eventData = await service.create()

      expect(eventData.lang).toBe(Locale.EnglishUS)
      expect(eventData.langGuild).toBe(Locale.EnglishUS)
    })

    it('should create EventData with default language when guild has no preferred locale', async () => {
      const mockGuild = {
        preferredLocale: null,
      }

      const eventData = await service.create({ guild: mockGuild as any })

      expect(eventData.lang).toBe(Locale.EnglishUS)
      expect(eventData.langGuild).toBe(Locale.EnglishUS)
    })

    it('should create EventData with guild preferred locale when enabled', async () => {
      // Mock Language.Enabled to include SpanishES
      const { Language } = await import('../../src/models/enum-helpers/language.js')
      const originalEnabled = Language.Enabled
      Language.Enabled = [Locale.EnglishUS, Locale.SpanishES]

      const mockGuild = {
        preferredLocale: Locale.SpanishES,
      }

      const eventData = await service.create({ guild: mockGuild as any })

      expect(eventData.lang).toBe(Locale.SpanishES)
      expect(eventData.langGuild).toBe(Locale.SpanishES)

      // Restore original
      Language.Enabled = originalEnabled
    })

    it('should use default language when preferred locale is not enabled', async () => {
      const mockGuild = {
        preferredLocale: 'xx-XX' as Locale, // Non-enabled locale
      }

      const eventData = await service.create({ guild: mockGuild as any })

      expect(eventData.lang).toBe(Locale.EnglishUS)
      expect(eventData.langGuild).toBe(Locale.EnglishUS)
    })

    it('should accept optional user parameter', async () => {
      const mockUser = createMockUser()
      const eventData = await service.create({ user: mockUser })

      expect(eventData).toBeDefined()
      expect(eventData.lang).toBe(Locale.EnglishUS)
    })

    it('should accept optional channel parameter', async () => {
      const mockChannel = {
        id: 'channel123',
        type: 0,
      }

      const eventData = await service.create({ channel: mockChannel as any })

      expect(eventData).toBeDefined()
      expect(eventData.lang).toBe(Locale.EnglishUS)
    })

    it('should accept optional args parameter', async () => {
      const mockArgs = {
        getString: vi.fn(),
        getUser: vi.fn(),
      }

      const eventData = await service.create({ args: mockArgs as any })

      expect(eventData).toBeDefined()
      expect(eventData.lang).toBe(Locale.EnglishUS)
    })

    it('should create EventData with all optional parameters', async () => {
      const mockUser = createMockUser()
      const mockGuild = {
        preferredLocale: Locale.EnglishUS,
      }
      const mockChannel = {
        id: 'channel123',
        type: 0,
      }
      const mockArgs = {
        getString: vi.fn(),
      }

      const eventData = await service.create({
        user: mockUser,
        guild: mockGuild as any,
        channel: mockChannel as any,
        args: mockArgs as any,
      })

      expect(eventData).toBeDefined()
      expect(eventData.lang).toBe(Locale.EnglishUS)
      expect(eventData.langGuild).toBe(Locale.EnglishUS)
    })
  })
})
