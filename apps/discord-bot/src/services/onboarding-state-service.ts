import { type GuildMember } from 'discord.js'
import { createRequire } from 'node:module'

import { ChannelCreationService } from './channel-creation-service.js'
import { Logger } from './logger.js'

const require = createRequire(import.meta.url)
const Config = require('../../config/config.json')

interface PendingOnboarding {
  memberId: string
  guildId: string
  teamName: string
  roleId: string
  timeoutId: NodeJS.Timeout
  createdAt: Date
}

/**
 * Service to manage pending onboarding channel creations with delays.
 * Handles the delay queue and cancellation if role is removed during the delay period.
 */
export class OnboardingStateService {
  // Map key: `${guildId}-${memberId}-${roleId}`
  private pendingOnboardings: Map<string, PendingOnboarding> = new Map()

  private getKey(guildId: string, memberId: string, roleId: string): string {
    return `${guildId}-${memberId}-${roleId}`
  }

  /**
   * Queue a channel creation for a member who just received a team role.
   * The channel will be created after the configured delay period.
   */
  public queueChannelCreation(
    member: GuildMember,
    teamName: string,
    roleId: string,
  ): void {
    const key = this.getKey(member.guild.id, member.id, roleId)

    // If already pending for this role, don't queue again
    if (this.pendingOnboardings.has(key)) {
      Logger.info(
        `Onboarding channel creation already pending for ${member.user.tag} and team ${teamName}`,
      )
      return
    }

    const delaySeconds = Config.onboarding?.delaySeconds ?? 7
    const delayMs = delaySeconds * 1000

    Logger.info(
      `Queueing onboarding channel creation for ${member.user.tag} and team ${teamName} (delay: ${delaySeconds}s)`,
    )

    const timeoutId = setTimeout(async () => {
      await this.executeChannelCreation(member, teamName, roleId)
    }, delayMs)

    const pending: PendingOnboarding = {
      memberId: member.id,
      guildId: member.guild.id,
      teamName,
      roleId,
      timeoutId,
      createdAt: new Date(),
    }

    this.pendingOnboardings.set(key, pending)
  }

  /**
   * Cancel a pending channel creation if the role was removed during the delay period.
   */
  public cancelPendingCreation(
    guildId: string,
    memberId: string,
    roleId: string,
  ): boolean {
    const key = this.getKey(guildId, memberId, roleId)
    const pending = this.pendingOnboardings.get(key)

    if (pending) {
      clearTimeout(pending.timeoutId)
      this.pendingOnboardings.delete(key)
      Logger.info(
        `Cancelled pending onboarding channel creation for member ${memberId} and role ${roleId}`,
      )
      return true
    }

    return false
  }

  /**
   * Cancel all pending creations for a member (e.g., if they leave the server).
   */
  public cancelAllForMember(guildId: string, memberId: string): number {
    let cancelled = 0

    for (const [key, pending] of this.pendingOnboardings.entries()) {
      if (pending.guildId === guildId && pending.memberId === memberId) {
        clearTimeout(pending.timeoutId)
        this.pendingOnboardings.delete(key)
        cancelled++
      }
    }

    if (cancelled > 0) {
      Logger.info(
        `Cancelled ${cancelled} pending onboarding channel creation(s) for member ${memberId}`,
      )
    }

    return cancelled
  }

  /**
   * Check if there's a pending creation for a specific role.
   */
  public hasPendingCreation(
    guildId: string,
    memberId: string,
    roleId: string,
  ): boolean {
    const key = this.getKey(guildId, memberId, roleId)
    return this.pendingOnboardings.has(key)
  }

  /**
   * Get count of all pending creations.
   */
  public getPendingCount(): number {
    return this.pendingOnboardings.size
  }

  /**
   * Execute the channel creation after the delay period.
   */
  private async executeChannelCreation(
    member: GuildMember,
    teamName: string,
    roleId: string,
  ): Promise<void> {
    const key = this.getKey(member.guild.id, member.id, roleId)

    // Remove from pending map
    this.pendingOnboardings.delete(key)

    // Verify member still has the role
    try {
      const freshMember = await member.guild.members.fetch(member.id)
      if (!freshMember.roles.cache.has(roleId)) {
        Logger.info(
          `Member ${member.user.tag} no longer has role ${roleId}, skipping channel creation`,
        )
        return
      }

      // Create the channel
      const channel = await ChannelCreationService.createOnboardingChannel(
        freshMember,
        teamName,
        freshMember.guild,
      )

      if (channel) {
        // Send welcome message
        await ChannelCreationService.sendTeamWelcomeMessage(channel, teamName, freshMember)
      }
    } catch (error) {
      Logger.error(
        `Failed to execute channel creation for ${member.user.tag} and team ${teamName}:`,
        error,
      )
    }
  }
}
