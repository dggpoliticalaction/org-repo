import {
  ChannelType,
  EmbedBuilder,
  type Guild,
  type GuildMember,
  type TextChannel,
  type ThreadChannel,
} from 'discord.js'
import { createRequire } from 'node:module'

import { Logger } from './logger.js'

const require = createRequire(import.meta.url)
const Config = require('../../config/config.json')

interface WelcomeThreadConfig {
  channelName: string
  welcomeTeamRoleName: string
  modRoleName: string
  directorRoleName: string
  maxActiveThreads: number
  maxTotalThreads: number
  inactivityDays: number
  welcomeMessage: string
}

/**
 * Service to create and manage welcome threads in a designated welcome channel.
 * Threads have restricted visibility (user, welcome team, mods, directors),
 * a hard cap on total count, and auto-close after inactivity.
 */
export class WelcomeThreadService {
  private static getConfig(): WelcomeThreadConfig | null {
    const wt = Config.welcomeThread
    if (!wt?.channelName) return null
    return {
      channelName: wt.channelName,
      welcomeTeamRoleName: wt.welcomeTeamRoleName ?? 'Welcome Team',
      modRoleName: wt.modRoleName ?? 'Moderator',
      directorRoleName: wt.directorRoleName ?? 'Director',
      maxActiveThreads: Math.max(1, Number(wt.maxActiveThreads) || 50),
      maxTotalThreads: Math.max(1, Number(wt.maxTotalThreads) || 500),
      inactivityDays: Math.max(1, Number(wt.inactivityDays) || 5),
      welcomeMessage:
        wt.welcomeMessage ??
        'Welcome! Someone from the Welcome Team will introduce themselves and help you get started.',
    }
  }

  /**
   * Find the welcome channel by name (case-insensitive).
   */
  public static findWelcomeChannel(guild: Guild): TextChannel | null {
    const config = this.getConfig()
    if (!config) return null
    const name = config.channelName.toLowerCase()
    const channel = guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        c.name.toLowerCase() === name,
    ) as TextChannel | undefined
    return channel ?? null
  }

  /**
   * Count active (non-archived) threads in the welcome channel.
   */
  public static async getActiveWelcomeThreadCount(
    channel: TextChannel,
  ): Promise<number> {
    const active = await channel.threads.fetchActive()
    return active.threads.size
  }

  /**
   * Check whether the member already has an active welcome thread in this channel.
   */
  public static async memberHasActiveWelcomeThread(
    channel: TextChannel,
    memberId: string,
  ): Promise<boolean> {
    const active = await channel.threads.fetchActive()
    for (const [, thread] of active.threads) {
      try {
        const members = await thread.members.fetch()
        if (members.has(memberId)) return true
      } catch {
        // Skip threads we can't read
      }
    }
    return false
  }

  /**
   * Fetch all threads (active + archived) in the welcome channel.
   */
  public static async getAllWelcomeThreads(
    channel: TextChannel,
  ): Promise<ThreadChannel[]> {
    const threads: ThreadChannel[] = []

    // Fetch active threads
    const active = await channel.threads.fetchActive()
    for (const [, thread] of active.threads) {
      threads.push(thread)
    }

    // Fetch all archived private threads (paginated)
    let hasMore = true
    let before: Date | undefined
    while (hasMore) {
      const fetchOptions: {
        type: 'private'
        fetchAll: boolean
        limit: number
        before?: Date
      } = {
        type: 'private',
        fetchAll: true,
        limit: 100,
      }
      if (before) fetchOptions.before = before

      const archived = await channel.threads.fetchArchived(fetchOptions)
      for (const [, thread] of archived.threads) {
        threads.push(thread as ThreadChannel)
      }
      hasMore = archived.hasMore
      const lastThread = archived.threads.last()
      if (lastThread?.archivedAt) {
        before = lastThread.archivedAt
      } else {
        hasMore = false
      }
    }

    return threads
  }

  /**
   * Enforce the max total threads limit by deleting the oldest threads
   * to make room for a new one.
   */
  public static async enforceMaxTotalThreads(
    channel: TextChannel,
    maxTotal: number,
  ): Promise<void> {
    const allThreads = await this.getAllWelcomeThreads(channel)

    if (allThreads.length < maxTotal) return

    // Sort by creation date ascending (oldest first)
    allThreads.sort(
      (a, b) => (a.createdTimestamp ?? 0) - (b.createdTimestamp ?? 0),
    )

    // Delete enough threads to make room for 1 new thread
    const toDelete = allThreads.length - maxTotal + 1
    for (let i = 0; i < toDelete; i++) {
      try {
        Logger.info(
          `Deleting oldest welcome thread "${allThreads[i].name}" to stay under ${maxTotal} total thread limit`,
        )
        await allThreads[i].delete(
          `Exceeded max total threads limit of ${maxTotal}`,
        )
      } catch (error) {
        Logger.error(
          `Failed to delete old welcome thread "${allThreads[i].name}":`,
          error,
        )
      }
    }
  }

  /**
   * Create a private welcome thread for the member, add allowed roles' members,
   * send the standard welcome message. Returns the thread or null if cap reached,
   * config missing, or user already has a thread.
   */
  public static async createWelcomeThread(
    member: GuildMember,
  ): Promise<ThreadChannel | null> {
    const config = this.getConfig()
    if (!config) {
      Logger.warn('Welcome thread config (welcomeThread.channelName) is missing')
      return null
    }

    const channel = this.findWelcomeChannel(member.guild)
    if (!channel) {
      Logger.warn(`Welcome channel "${config.channelName}" not found in ${member.guild.name}`)
      return null
    }

    const activeCount = await this.getActiveWelcomeThreadCount(channel)
    if (activeCount >= config.maxActiveThreads) {
      Logger.warn(
        `Welcome thread cap reached (${activeCount}/${config.maxActiveThreads}) in ${member.guild.name}`,
      )
      return null
    }

    const alreadyHas = await this.memberHasActiveWelcomeThread(channel, member.id)
    if (alreadyHas) {
      Logger.info(
        `Member ${member.user.tag} already has an active welcome thread, skipping`,
      )
      return null
    }

    // Enforce total thread cap – delete the oldest thread(s) if at or over the limit
    await this.enforceMaxTotalThreads(channel, config.maxTotalThreads)

    const threadName = `welcome-${member.user.username}`.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 100)
    let thread: ThreadChannel
    try {
      thread = await channel.threads.create({
        name: threadName,
        type: ChannelType.PrivateThread,
        invitable: false,
        autoArchiveDuration: 10080, // 7 days in minutes
        reason: `Welcome thread for ${member.user.tag}`,
      })
    } catch (error) {
      Logger.error(`Failed to create welcome thread for ${member.user.tag}:`, error)
      return null
    }

    try {
      await thread.members.add(member.id)
    } catch (error) {
      Logger.error(`Failed to add member ${member.user.tag} to welcome thread:`, error)
      await thread.delete('Failed to add member').catch(() => {})
      return null
    }

    const roleIds = new Set<string>()
    const welcomeRole = member.guild.roles.cache.find(
      (r) => r.name === config.welcomeTeamRoleName,
    )
    const modRole = member.guild.roles.cache.find((r) => r.name === config.modRoleName)
    const directorRole = member.guild.roles.cache.find(
      (r) => r.name === config.directorRoleName,
    )
    if (welcomeRole) roleIds.add(welcomeRole.id)
    if (modRole) roleIds.add(modRole.id)
    if (directorRole) roleIds.add(directorRole.id)

    const membersToAdd = new Set<string>()
    const allMembers = await member.guild.members.fetch()
    for (const [, m] of allMembers) {
      if (m.user.bot) continue
      const hasRole = [...roleIds].some((rid) => m.roles.cache.has(rid))
      if (hasRole) membersToAdd.add(m.id)
    }

    for (const userId of membersToAdd) {
      if (userId === member.id) continue
      try {
        await thread.members.add(userId)
      } catch {
        // Skip if we can't add (e.g. left server, permissions)
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('Welcome')
      .setDescription(config.welcomeMessage)
      .setColor(0x4caf50)
      .setTimestamp()

    try {
      await thread.send({ embeds: [embed] })
    } catch (error) {
      Logger.error(`Failed to send welcome message in thread ${thread.name}:`, error)
    }

    Logger.info(
      `Created welcome thread ${thread.name} for ${member.user.tag} in ${member.guild.name}`,
    )
    return thread
  }
}
