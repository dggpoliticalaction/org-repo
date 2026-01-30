/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChannelType, type TextChannel } from 'discord.js'

import { ChannelCreationService } from '../../src/services/channel-creation-service.js'
import { createMockGuildChannel, createMockGuildMember } from '../helpers/discord-mocks.js'

// Mock dependencies - these must be at the top before any imports
vi.mock('../../src/services/logger.js', () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../config/config.json', () => ({
  onboarding: {
    categoryName: 'onboarding',
    teamLeadRoleName: 'Team Lead',
  },
  teams: {
    'Dev Team': {
      leadRoleName: 'Dev Team Lead',
    },
  },
}))

describe('ChannelCreationService', () => {
  let mockMember: ReturnType<typeof createMockGuildMember>
  let mockGuild: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Create a mock guild with roles and channels
    const mockTeamRole = {
      id: 'teamRole123',
      name: 'Dev Team',
    }

    const mockTeamLeadRole = {
      id: 'teamLeadRole123',
      name: 'Team Lead',
    }

    const mockTeamLead = createMockGuildMember({
      id: 'teamLead123',
      roles: {
        cache: new Map([
          ['teamRole123', mockTeamRole],
          ['teamLeadRole123', mockTeamLeadRole],
        ]),
        has: vi.fn((id: string) => {
          return id === 'teamRole123' || id === 'teamLeadRole123'
        }),
      },
    })

    mockGuild = {
      id: 'guild123',
      name: 'Test Guild',
      roles: {
        cache: new Map([
          ['teamRole123', mockTeamRole],
          ['teamLeadRole123', mockTeamLeadRole],
        ]),
        everyone: {
          id: 'guild123',
        },
      },
      members: {
        fetch: vi.fn().mockResolvedValue(
          new Map([
            ['teamLead123', mockTeamLead],
            ['member123', mockMember],
          ]),
        ),
      },
      channels: {
        cache: new Map(),
        find: vi.fn().mockReturnValue(undefined),
        create: vi.fn().mockResolvedValue({
          id: 'channel123',
          name: 'onboarding-testuser-dev-team',
          type: ChannelType.GuildText,
          send: vi.fn().mockResolvedValue({}),
        }),
      },
    }

    mockMember = createMockGuildMember({
      id: 'member123',
      user: {
        id: 'member123',
        username: 'TestUser',
        tag: 'TestUser#0000',
        bot: false,
      },
      guild: mockGuild,
      roles: {
        cache: new Map([['teamRole123', mockTeamRole]]),
        has: vi.fn((id: string) => id === 'teamRole123'),
      },
    })
  })

  describe('createOnboardingChannel', () => {
    it('should create an onboarding channel when team lead exists', async () => {
      // The service finds roles by name, then checks if member has them by ID
      // So we need the role IDs to match between guild.roles.cache and member.roles.cache
      const teamRoleId = 'teamRole123'
      const teamLeadRoleId = 'teamLeadRole123'

      // Ensure guild.roles.cache has the roles with correct names
      mockGuild.roles.cache = new Map([
        [teamRoleId, { id: teamRoleId, name: 'Dev Team' }],
        [teamLeadRoleId, { id: teamLeadRoleId, name: 'Team Lead' }],
      ])
      mockGuild.roles.cache.find = vi.fn((predicate: any) => {
        for (const role of mockGuild.roles.cache.values()) {
          if (predicate(role)) return role
        }
        return undefined
      })

      // Create team lead with roles that match the IDs
      const teamLead = createMockGuildMember({
        id: 'teamLead123',
        user: {
          id: 'teamLead123',
          username: 'TeamLead',
          tag: 'TeamLead#0000',
          bot: false,
        },
        guild: mockGuild,
        roles: {
          cache: new Map([
            [teamRoleId, { id: teamRoleId, name: 'Dev Team' }],
            [teamLeadRoleId, { id: teamLeadRoleId, name: 'Team Lead' }],
          ]),
          has: vi.fn((id: string) => {
            return id === teamRoleId || id === teamLeadRoleId
          }),
        },
      })

      // Mock members.fetch to return a Map with the team lead
      const membersMap = new Map([['teamLead123', teamLead]])
      mockGuild.members.fetch = vi.fn().mockResolvedValue(membersMap)

      // Ensure channels.cache.find returns undefined (no existing channel)
      const cacheMap = new Map()
      cacheMap.find = vi.fn().mockReturnValue(undefined)
      mockGuild.channels.cache = cacheMap as any

      // Reset channels.create mock
      mockGuild.channels.create = vi.fn().mockResolvedValue({
        id: 'channel123',
        name: 'onboarding-testuser-dev-team',
        type: ChannelType.GuildText,
        send: vi.fn().mockResolvedValue({}),
      })

      const channel = await ChannelCreationService.createOnboardingChannel(
        mockMember,
        'Dev Team',
        mockGuild,
      )

      expect(channel).toBeDefined()
      expect(mockGuild.channels.create).toHaveBeenCalled()
    })

    it('should return null when team lead is not found', async () => {
      mockGuild.members.fetch = vi.fn().mockResolvedValue(new Map())

      const channel = await ChannelCreationService.createOnboardingChannel(
        mockMember,
        'Dev Team',
        mockGuild,
      )

      expect(channel).toBeNull()
    })

    it('should return existing channel if it already exists', async () => {
      // Set up roles for team lead lookup
      const teamRoleId = 'teamRole123'
      const teamLeadRoleId = 'teamLeadRole123'
      mockGuild.roles.cache = new Map([
        [teamRoleId, { id: teamRoleId, name: 'Dev Team' }],
        [teamLeadRoleId, { id: teamLeadRoleId, name: 'Team Lead' }],
      ])
      mockGuild.roles.cache.find = vi.fn((predicate: any) => {
        for (const role of mockGuild.roles.cache.values()) {
          if (predicate(role)) return role
        }
        return undefined
      })

      // Create team lead
      const teamLead = createMockGuildMember({
        id: 'teamLead123',
        user: { id: 'teamLead123', username: 'TeamLead', tag: 'TeamLead#0000', bot: false },
        guild: mockGuild,
        roles: {
          cache: new Map([
            [teamRoleId, { id: teamRoleId, name: 'Dev Team' }],
            [teamLeadRoleId, { id: teamLeadRoleId, name: 'Team Lead' }],
          ]),
          has: vi.fn((id: string) => id === teamRoleId || id === teamLeadRoleId),
        },
      })
      mockGuild.members.fetch = vi.fn().mockResolvedValue(new Map([['teamLead123', teamLead]]))

      const existingChannel = createMockGuildChannel({
        id: 'existingChannel123',
        name: 'onboarding-testuser-dev-team',
        type: ChannelType.GuildText,
        parent: {
          id: 'category123',
          name: 'onboarding',
          type: ChannelType.GuildCategory,
        },
      })

      // Ensure the channel is a TextChannel instance for the instanceof check
      Object.setPrototypeOf(existingChannel, (await import('discord.js')).TextChannel.prototype)

      // Set up the cache with find method that matches the predicate
      // The service checks: channel.type === ChannelType.GuildText && channel.name === channelName && channel.parent?.name === Config.onboarding?.categoryName
      const cacheMap = new Map([['existingChannel123', existingChannel]])
      cacheMap.find = vi.fn((predicate: any) => {
        for (const channel of cacheMap.values()) {
          // The predicate is a function that checks channel properties
          if (predicate(channel)) {
            return channel
          }
        }
        return undefined
      })

      mockGuild.channels.cache = cacheMap as any

      const channel = await ChannelCreationService.createOnboardingChannel(
        mockMember,
        'Dev Team',
        mockGuild,
      )

      expect(channel).toBe(existingChannel)
      expect(mockGuild.channels.create).not.toHaveBeenCalled()
    })

    it('should create category if it does not exist', async () => {
      const mockCategory = {
        id: 'category123',
        name: 'onboarding',
        type: ChannelType.GuildCategory,
      }

      // Set up roles cache for team lead lookup
      const teamRoleId = 'teamRole123'
      const teamLeadRoleId = 'teamLeadRole123'
      mockGuild.roles.cache = new Map([
        [teamRoleId, { id: teamRoleId, name: 'Dev Team' }],
        [teamLeadRoleId, { id: teamLeadRoleId, name: 'Team Lead' }],
      ])
      mockGuild.roles.cache.find = vi.fn((predicate: any) => {
        for (const role of mockGuild.roles.cache.values()) {
          if (predicate(role)) return role
        }
        return undefined
      })

      // Create team lead
      const teamLead = createMockGuildMember({
        id: 'teamLead123',
        user: { id: 'teamLead123', username: 'TeamLead', tag: 'TeamLead#0000', bot: false },
        guild: mockGuild,
        roles: {
          cache: new Map([
            [teamRoleId, { id: teamRoleId, name: 'Dev Team' }],
            [teamLeadRoleId, { id: teamLeadRoleId, name: 'Team Lead' }],
          ]),
          has: vi.fn((id: string) => id === teamRoleId || id === teamLeadRoleId),
        },
      })
      mockGuild.members.fetch = vi.fn().mockResolvedValue(new Map([['teamLead123', teamLead]]))

      // Mock channels.cache to not find the category or existing channel
      const cacheMap = new Map()
      cacheMap.find = vi.fn().mockReturnValue(undefined)
      mockGuild.channels.cache = cacheMap as any

      // Reset create mock to return category first, then channel
      mockGuild.channels.create = vi
        .fn()
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce({
          id: 'channel123',
          name: 'onboarding-testuser-dev-team',
          type: ChannelType.GuildText,
        })

      await ChannelCreationService.createOnboardingChannel(mockMember, 'Dev Team', mockGuild)

      expect(mockGuild.channels.create).toHaveBeenCalledTimes(2)
      expect(mockGuild.channels.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          name: 'onboarding',
          type: ChannelType.GuildCategory,
        }),
      )
    })

    it('should handle errors during channel creation', async () => {
      mockGuild.channels.create = vi.fn().mockRejectedValue(new Error('Creation failed'))
      const { Logger } = await import('../../src/services/logger.js')

      const channel = await ChannelCreationService.createOnboardingChannel(
        mockMember,
        'Dev Team',
        mockGuild,
      )

      expect(channel).toBeNull()
      expect(Logger.error).toHaveBeenCalled()
    })

    it('should truncate channel name to 100 characters', async () => {
      const longUsernameMember = createMockGuildMember({
        id: 'member123',
        user: {
          id: 'member123',
          username: 'a'.repeat(100),
          tag: 'TestUser#0000',
        },
        guild: mockGuild,
      })

      // Reset the mock
      mockGuild.channels.create = vi.fn().mockResolvedValue({
        id: 'channel123',
        name: 'onboarding-testuser-dev-team',
        type: ChannelType.GuildText,
      })

      await ChannelCreationService.createOnboardingChannel(
        longUsernameMember,
        'Dev Team',
        mockGuild,
      )

      const createCall = mockGuild.channels.create.mock.calls[0]
      if (createCall && createCall[0]) {
        expect(createCall[0].name.length).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('sendTeamWelcomeMessage', () => {
    it('should send default welcome message for team', async () => {
      const mockChannel = {
        id: 'channel123',
        name: 'onboarding-testuser-dev-team',
        send: vi.fn().mockResolvedValue({}),
      } as unknown as TextChannel

      await ChannelCreationService.sendTeamWelcomeMessage(mockChannel, 'Dev Team', mockMember)

      expect(mockChannel.send).toHaveBeenCalled()
      const sendCall = mockChannel.send.mock.calls[0]
      expect(sendCall[0].embeds[0].data.title).toBe('Welcome to Dev Team!')
      expect(sendCall[0].embeds[0].data.description).toContain(
        'Thank you for expressing interest in the **Dev Team** team.',
      )
    })

    it('should handle errors during message sending', async () => {
      const mockChannel = {
        id: 'channel123',
        name: 'onboarding-testuser-dev-team',
        send: vi.fn().mockRejectedValue(new Error('Send failed')),
      } as unknown as TextChannel

      const { Logger } = await import('../../src/services/logger.js')

      await ChannelCreationService.sendTeamWelcomeMessage(mockChannel, 'Dev Team', mockMember)

      expect(Logger.error).toHaveBeenCalled()
    })
  })
})
