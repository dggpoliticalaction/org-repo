import { describe, expect, it, vi } from 'vitest'
import { DMChannel, PermissionFlagsBits, PermissionsBitField } from 'discord.js'

import { PermissionUtils } from '../../src/utils/permission-utils.js'
import { createMockGuildChannel, createMockThreadChannel } from '../helpers/discord-mocks.js'

describe('PermissionUtils', () => {
  describe('canSend', () => {
    it('should return true for DMChannel', () => {
      const mockDMChannel = Object.create(DMChannel.prototype, {
        id: { value: 'dm123', writable: true },
      }) as DMChannel

      expect(PermissionUtils.canSend(mockDMChannel)).toBe(true)
      expect(PermissionUtils.canSend(mockDMChannel, true)).toBe(true)
    })

    it('should return true when bot has required permissions', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ]),
          ),
      })

      expect(PermissionUtils.canSend(mockChannel)).toBe(true)
    })

    it('should return true when bot has embed links permission', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.EmbedLinks,
            ]),
          ),
      })

      expect(PermissionUtils.canSend(mockChannel, true)).toBe(true)
    })

    it('should return false when bot lacks ViewChannel permission', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(new PermissionsBitField([PermissionFlagsBits.SendMessages])),
      })

      expect(PermissionUtils.canSend(mockChannel)).toBe(false)
    })

    it('should return false when bot lacks SendMessages permission', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(new PermissionsBitField([PermissionFlagsBits.ViewChannel])),
      })

      expect(PermissionUtils.canSend(mockChannel)).toBe(false)
    })

    it('should return false when bot lacks EmbedLinks permission when required', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ]),
          ),
      })

      expect(PermissionUtils.canSend(mockChannel, true)).toBe(false)
    })

    it('should return false when permissionsFor returns null', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi.fn().mockReturnValue(null),
      })

      expect(PermissionUtils.canSend(mockChannel)).toBe(false)
    })

    it('should work with ThreadChannel', () => {
      const mockThread = createMockThreadChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ]),
          ),
      })

      expect(PermissionUtils.canSend(mockThread)).toBe(true)
    })
  })

  describe('canMention', () => {
    it('should return true for DMChannel', () => {
      const mockDMChannel = Object.create(DMChannel.prototype, {
        id: { value: 'dm123', writable: true },
      }) as DMChannel

      expect(PermissionUtils.canMention(mockDMChannel)).toBe(true)
    })

    it('should return true when bot has required permissions', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.MentionEveryone,
            ]),
          ),
      })

      expect(PermissionUtils.canMention(mockChannel)).toBe(true)
    })

    it('should return false when bot lacks MentionEveryone permission', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(new PermissionsBitField([PermissionFlagsBits.ViewChannel])),
      })

      expect(PermissionUtils.canMention(mockChannel)).toBe(false)
    })

    it('should return false when permissionsFor returns null', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi.fn().mockReturnValue(null),
      })

      expect(PermissionUtils.canMention(mockChannel)).toBe(false)
    })
  })

  describe('canReact', () => {
    it('should return true for DMChannel', () => {
      const mockDMChannel = Object.create(DMChannel.prototype, {
        id: { value: 'dm123', writable: true },
      }) as DMChannel

      expect(PermissionUtils.canReact(mockDMChannel)).toBe(true)
      expect(PermissionUtils.canReact(mockDMChannel, true)).toBe(true)
    })

    it('should return true when bot has required permissions', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.ReadMessageHistory,
            ]),
          ),
      })

      expect(PermissionUtils.canReact(mockChannel)).toBe(true)
    })

    it('should return true when bot has ManageMessages permission for removeOthers', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.ManageMessages,
            ]),
          ),
      })

      expect(PermissionUtils.canReact(mockChannel, true)).toBe(true)
    })

    it('should return false when bot lacks ManageMessages for removeOthers', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.ReadMessageHistory,
            ]),
          ),
      })

      expect(PermissionUtils.canReact(mockChannel, true)).toBe(false)
    })

    it('should return false when permissionsFor returns null', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi.fn().mockReturnValue(null),
      })

      expect(PermissionUtils.canReact(mockChannel)).toBe(false)
    })
  })

  describe('canPin', () => {
    it('should return true for DMChannel', () => {
      const mockDMChannel = Object.create(DMChannel.prototype, {
        id: { value: 'dm123', writable: true },
      }) as DMChannel

      expect(PermissionUtils.canPin(mockDMChannel)).toBe(true)
      expect(PermissionUtils.canPin(mockDMChannel, true)).toBe(true)
    })

    it('should return true when bot has required permissions', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ManageMessages,
            ]),
          ),
      })

      expect(PermissionUtils.canPin(mockChannel)).toBe(true)
    })

    it('should return true when bot has ReadMessageHistory for findOld', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ManageMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ]),
          ),
      })

      expect(PermissionUtils.canPin(mockChannel, true)).toBe(true)
    })

    it('should return false when bot lacks ManageMessages permission', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(new PermissionsBitField([PermissionFlagsBits.ViewChannel])),
      })

      expect(PermissionUtils.canPin(mockChannel)).toBe(false)
    })

    it('should return false when permissionsFor returns null', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi.fn().mockReturnValue(null),
      })

      expect(PermissionUtils.canPin(mockChannel)).toBe(false)
    })
  })

  describe('canCreateThreads', () => {
    it('should return false for DMChannel', () => {
      const mockDMChannel = {
        id: 'dm123',
      } as unknown as DMChannel

      expect(PermissionUtils.canCreateThreads(mockDMChannel)).toBe(false)
    })

    it('should return true when bot has required permissions', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessagesInThreads,
              PermissionFlagsBits.CreatePublicThreads,
            ]),
          ),
      })

      expect(PermissionUtils.canCreateThreads(mockChannel)).toBe(true)
    })

    it('should return true when bot has ManageThreads for manageThreads', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessagesInThreads,
              PermissionFlagsBits.CreatePublicThreads,
              PermissionFlagsBits.ManageThreads,
            ]),
          ),
      })

      expect(PermissionUtils.canCreateThreads(mockChannel, true)).toBe(true)
    })

    it('should return true when bot has ReadMessageHistory for findOld', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessagesInThreads,
              PermissionFlagsBits.CreatePublicThreads,
              PermissionFlagsBits.ReadMessageHistory,
            ]),
          ),
      })

      expect(PermissionUtils.canCreateThreads(mockChannel, false, true)).toBe(true)
    })

    it('should return false when bot lacks CreatePublicThreads permission', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi
          .fn()
          .mockReturnValue(
            new PermissionsBitField([
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessagesInThreads,
            ]),
          ),
      })

      expect(PermissionUtils.canCreateThreads(mockChannel)).toBe(false)
    })

    it('should return false when permissionsFor returns null', () => {
      const mockChannel = createMockGuildChannel({
        permissionsFor: vi.fn().mockReturnValue(null),
      })

      expect(PermissionUtils.canCreateThreads(mockChannel)).toBe(false)
    })
  })
})
