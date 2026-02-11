import { type GuildMember, type PartialGuildMember } from 'discord.js'
import { RateLimiter } from 'discord.js-rate-limiter'
import { createRequire } from 'node:module'

import { type EventHandler } from './event-handler.js'
import { Logger } from '../services/logger.js'
import { type OnboardingStateService } from '../services/onboarding-state-service.js'

const require = createRequire(import.meta.url)
const Config = require('../../config/config.json')

/**
 * Handles GuildMemberUpdate events to detect when users receive team roles
 * via the Discord "Channels & Roles" tab onboarding flow.
 */
export class GuildMemberUpdateHandler implements EventHandler {
  private rateLimiter = new RateLimiter(
    Config.rateLimiting.buttons?.amount ?? 10,
    (Config.rateLimiting.buttons?.interval ?? 30) * 1000,
  )

  constructor(private readonly onboardingStateService: OnboardingStateService) {}

  /**
   * Process a GuildMemberUpdate event.
   * Detects role additions that match configured team interest roles
   * and queues welcome thread creation with a delay.
   */
  public async process(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
  ): Promise<void> {
    if (newMember.user.bot) {
      return
    }

    const limited = this.rateLimiter.take(newMember.id)
    if (limited) {
      return
    }

    const teams = Config.teams as Record<
      string,
      { interestRoleName?: string }
    > | undefined

    if (!teams) {
      return
    }

    const oldRoles = oldMember.roles.cache
    const newRoles = newMember.roles.cache

    const addedRoles = newRoles.filter((role) => !oldRoles.has(role.id))
    const removedRoles = oldRoles.filter((role) => !newRoles.has(role.id))

    // Handle added team roles - check if role matches any interest role in teams config
    for (const [roleId, role] of addedRoles) {
      const teamName = Object.keys(teams).find(
        (team) => teams[team]?.interestRoleName === role.name,
      )

      if (teamName) {
        Logger.info(
          `Detected team interest role addition: ${newMember.user.tag} received "${role.name}" (team: ${teamName})`,
        )

        this.onboardingStateService.queueChannelCreation(newMember, teamName, roleId)
      }
    }

    // Handle removed team roles - cancel pending channel creation
    for (const [roleId, role] of removedRoles) {
      const teamName = Object.keys(teams).find(
        (team) => teams[team]?.interestRoleName === role.name,
      )

      if (teamName) {
        Logger.info(
          `Detected team interest role removal: ${newMember.user.tag} lost "${role.name}" (team: ${teamName})`,
        )

        this.onboardingStateService.cancelPendingCreation(
          newMember.guild.id,
          newMember.id,
          roleId,
        )
      }
    }
  }
}
