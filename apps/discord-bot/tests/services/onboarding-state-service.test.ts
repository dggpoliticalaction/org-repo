import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type GuildMember } from 'discord.js'

import { OnboardingStateService } from '../../src/services/onboarding-state-service.js'
import { createMockGuildMember } from '../helpers/discord-mocks.js'

// Mock dependencies
vi.mock('../../src/services/channel-creation-service.js', () => ({
  ChannelCreationService: {
    createOnboardingChannel: vi.fn().mockResolvedValue({
      id: 'channel123',
      name: 'onboarding-testuser-dev-team',
      send: vi.fn().mockResolvedValue({}),
    }),
    sendTeamWelcomeMessage: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('../../src/services/logger.js', () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../config/config.json', () => ({
  onboarding: {
    delaySeconds: 7,
  },
}))

describe('OnboardingStateService', () => {
  let service: OnboardingStateService
  let mockMember: GuildMember

  beforeEach(() => {
    service = new OnboardingStateService()
    mockMember = createMockGuildMember({
      id: 'member123',
      guild: { id: 'guild123' },
    })
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('queueChannelCreation', () => {
    it('should queue a channel creation with delay', () => {
      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')

      expect(service.getPendingCount()).toBe(1)
      expect(service.hasPendingCreation('guild123', 'member123', 'role123')).toBe(true)
    })

    it('should not queue duplicate pending creations', () => {
      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')
      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')

      expect(service.getPendingCount()).toBe(1)
    })

    it('should allow multiple pending creations for different roles', () => {
      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')
      service.queueChannelCreation(mockMember, 'Design Team', 'role456')

      expect(service.getPendingCount()).toBe(2)
    })

    it('should execute channel creation after delay', async () => {
      const { ChannelCreationService } = await import(
        '../../src/services/channel-creation-service.js'
      )

      // Mock member.fetch to return member with the role
      const freshMember = createMockGuildMember({
        id: 'member123',
        guild: { id: 'guild123', members: { fetch: vi.fn() } },
        roles: {
          cache: new Map([['role123', {}]]),
          has: vi.fn().mockReturnValue(true),
        },
      })

      Object.defineProperty(mockMember.guild, 'members', {
        value: { fetch: vi.fn().mockResolvedValue(freshMember) },
        writable: true,
      })

      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')

      // Fast-forward time past the delay
      vi.advanceTimersByTime(7000)

      // Wait for async operations
      await vi.runAllTimersAsync()

      expect(ChannelCreationService.createOnboardingChannel).toHaveBeenCalled()
      expect(service.getPendingCount()).toBe(0)
    })

    it('should use default delay when config is missing', () => {
      vi.doMock('../../config/config.json', () => ({}))
      const newService = new OnboardingStateService()
      newService.queueChannelCreation(mockMember, 'Dev Team', 'role123')
      expect(newService.getPendingCount()).toBe(1)
    })
  })

  describe('cancelPendingCreation', () => {
    it('should cancel a pending creation', () => {
      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')
      expect(service.getPendingCount()).toBe(1)

      const cancelled = service.cancelPendingCreation('guild123', 'member123', 'role123')

      expect(cancelled).toBe(true)
      expect(service.getPendingCount()).toBe(0)
      expect(service.hasPendingCreation('guild123', 'member123', 'role123')).toBe(false)
    })

    it('should return false if no pending creation exists', () => {
      const cancelled = service.cancelPendingCreation('guild123', 'member123', 'role123')

      expect(cancelled).toBe(false)
    })

    it('should clear timeout when cancelling', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')

      service.cancelPendingCreation('guild123', 'member123', 'role123')

      expect(clearTimeoutSpy).toHaveBeenCalled()
      clearTimeoutSpy.mockRestore()
    })
  })

  describe('cancelAllForMember', () => {
    it('should cancel all pending creations for a member', () => {
      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')
      service.queueChannelCreation(mockMember, 'Design Team', 'role456')

      const cancelled = service.cancelAllForMember('guild123', 'member123')

      expect(cancelled).toBe(2)
      expect(service.getPendingCount()).toBe(0)
    })

    it('should only cancel creations for the specified member', () => {
      const otherMember = createMockGuildMember({
        id: 'member456',
        guild: { id: 'guild123' },
      })

      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')
      service.queueChannelCreation(otherMember, 'Design Team', 'role456')

      const cancelled = service.cancelAllForMember('guild123', 'member123')

      expect(cancelled).toBe(1)
      expect(service.getPendingCount()).toBe(1)
    })

    it('should return 0 if no pending creations exist for member', () => {
      const cancelled = service.cancelAllForMember('guild123', 'member123')

      expect(cancelled).toBe(0)
    })
  })

  describe('hasPendingCreation', () => {
    it('should return true if pending creation exists', () => {
      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')

      expect(service.hasPendingCreation('guild123', 'member123', 'role123')).toBe(true)
    })

    it('should return false if no pending creation exists', () => {
      expect(service.hasPendingCreation('guild123', 'member123', 'role123')).toBe(false)
    })

    it('should return false after creation is cancelled', () => {
      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')
      service.cancelPendingCreation('guild123', 'member123', 'role123')

      expect(service.hasPendingCreation('guild123', 'member123', 'role123')).toBe(false)
    })
  })

  describe('getPendingCount', () => {
    it('should return 0 when no pending creations', () => {
      expect(service.getPendingCount()).toBe(0)
    })

    it('should return correct count of pending creations', () => {
      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')
      expect(service.getPendingCount()).toBe(1)

      service.queueChannelCreation(mockMember, 'Design Team', 'role456')
      expect(service.getPendingCount()).toBe(2)
    })
  })

  describe('executeChannelCreation', () => {
    it('should skip channel creation if member no longer has role', async () => {
      const { ChannelCreationService } = await import(
        '../../src/services/channel-creation-service.js'
      )

      // Mock member.fetch to return member without the role
      const freshMember = createMockGuildMember({
        id: 'member123',
        guild: { id: 'guild123', members: { fetch: vi.fn() } },
        roles: {
          cache: new Map(),
          has: vi.fn().mockReturnValue(false),
        },
      })

      Object.defineProperty(mockMember.guild, 'members', {
        value: { fetch: vi.fn().mockResolvedValue(freshMember) },
        writable: true,
      })

      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')

      vi.advanceTimersByTime(7000)
      await vi.runAllTimersAsync()

      expect(ChannelCreationService.createOnboardingChannel).not.toHaveBeenCalled()
    })

    it('should create channel and send welcome message when member has role', async () => {
      const { ChannelCreationService } = await import(
        '../../src/services/channel-creation-service.js'
      )

      const mockChannel = {
        id: 'channel123',
        name: 'onboarding-testuser-dev-team',
        send: vi.fn().mockResolvedValue({}),
      }

      ChannelCreationService.createOnboardingChannel = vi.fn().mockResolvedValue(mockChannel)

      const freshMember = createMockGuildMember({
        id: 'member123',
        guild: { id: 'guild123', members: { fetch: vi.fn() } },
        roles: {
          cache: new Map([['role123', {}]]),
          has: vi.fn().mockReturnValue(true),
        },
      })

      Object.defineProperty(mockMember.guild, 'members', {
        value: { fetch: vi.fn().mockResolvedValue(freshMember) },
        writable: true,
      })

      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')

      vi.advanceTimersByTime(7000)
      await vi.runAllTimersAsync()

      expect(ChannelCreationService.createOnboardingChannel).toHaveBeenCalled()
      expect(ChannelCreationService.sendTeamWelcomeMessage).toHaveBeenCalledWith(
        mockChannel,
        'Dev Team',
        freshMember,
      )
    })

    it('should handle errors during channel creation', async () => {
      const { ChannelCreationService } = await import(
        '../../src/services/channel-creation-service.js'
      )
      const { Logger } = await import('../../src/services/logger.js')

      const freshMember = createMockGuildMember({
        id: 'member123',
        guild: { id: 'guild123', members: { fetch: vi.fn() } },
        roles: {
          cache: new Map([['role123', {}]]),
          has: vi.fn().mockReturnValue(true),
        },
      })

      Object.defineProperty(mockMember.guild, 'members', {
        value: { fetch: vi.fn().mockResolvedValue(freshMember) },
        writable: true,
      })

      ChannelCreationService.createOnboardingChannel = vi
        .fn()
        .mockRejectedValue(new Error('Channel creation failed'))

      service.queueChannelCreation(mockMember, 'Dev Team', 'role123')

      vi.advanceTimersByTime(7000)
      await vi.runAllTimersAsync()

      expect(Logger.error).toHaveBeenCalled()
    })
  })
})
