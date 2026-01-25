import {
  type Guild,
  type GuildMember,
  PermissionFlagsBits,
  TextChannel,
  ChannelType,
  type CategoryChannel,
  type GuildChannel,
  EmbedBuilder,
} from 'discord.js'
import { createRequire } from 'node:module'

import { Logger } from './index.js'

const require = createRequire(import.meta.url)
const Config = require('../../config/config.json')
const TeamMessages = require('../../config/team-messages.json')

export class ChannelCreationService {
  /**
   * Finds the team lead for a given team (member with both team role and Team Lead role)
   * @param guild The guild to search in
   * @param teamName The team name to find the lead for
   * @returns The team lead member, or null if not found
   */
  private static async findTeamLead(
    guild: Guild,
    teamName: string,
  ): Promise<GuildMember | null> {
    try {
      // Find the team role (e.g., "Dev Team")
      const teamRole = guild.roles.cache.find((role) => role.name === teamName)

      if (!teamRole) {
        Logger.warn(`Team role "${teamName}" not found`)
        return null
      }

      // Find the Team Lead role - use team-specific leadRoleName if available, otherwise fall back to global config
      const teamConfig = Config.teams?.[teamName]
      const teamLeadRoleName =
        teamConfig?.leadRoleName ||
        Config.onboarding?.teamLeadRoleName ||
        'Team Lead'
      const teamLeadRole = guild.roles.cache.find(
        (role) => role.name === teamLeadRoleName,
      )

      if (!teamLeadRole) {
        Logger.warn(`Team Lead role "${teamLeadRoleName}" not found`)
        return null
      }

      // Fetch all members (or use cache if available)
      // Note: This might be expensive for large guilds, but necessary to find team lead
      const members = await guild.members.fetch()

      // Find a member who has both the team role AND the team lead role
      for (const [, guildMember] of members) {
        if (
          guildMember.roles.cache.has(teamRole.id) &&
          guildMember.roles.cache.has(teamLeadRole.id) &&
          !guildMember.user.bot
        ) {
          Logger.info(
            `Found team lead for ${teamName}: ${guildMember.user.tag}`,
          )
          return guildMember
        }
      }

      Logger.warn(
        `No team lead found for ${teamName} (member with both "${teamName}" and "${teamLeadRoleName}" roles)`,
      )
      return null
    } catch (error) {
      Logger.error(`Failed to find team lead for ${teamName}:`, error)
      return null
    }
  }

  /**
   * Creates a private onboarding channel for a user and team lead
   * @param member The guild member who received the role
   * @param teamName The team name
   * @param guild The guild where the channel should be created
   * @returns The created channel, or null if creation failed
   */
  public static async createOnboardingChannel(
    member: GuildMember,
    teamName: string,
    guild: Guild,
  ): Promise<TextChannel | null> {
    try {
      // Find the team lead
      const teamLead = await this.findTeamLead(guild, teamName)

      if (!teamLead) {
        Logger.error(
          `Cannot create onboarding channel for ${member.user.tag} and team ${teamName}: no team lead found`,
        )
        return null
      }

      // Generate channel name: onboarding-{username}-{team-slug}
      const username = member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const teamSlug = teamName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      const channelName = `onboarding-${username}-${teamSlug}`.slice(0, 100) // Discord limit is 100 chars

      // Check if channel already exists
      const existingChannel = guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildText &&
          channel.name === channelName &&
          channel.parent?.name === Config.onboarding?.categoryName,
      ) as GuildChannel | null

      if (existingChannel && existingChannel instanceof TextChannel) {
        Logger.info(
          `Onboarding channel already exists for ${member.user.tag} and team ${teamName}: ${channelName}`,
        )
        return existingChannel
      }

      // Find or create category
      const categoryName = Config.onboarding?.categoryName || 'onboarding'
      let category = guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildCategory && channel.name === categoryName,
      ) as CategoryChannel | undefined

      if (!category) {
        // Try to create category if it doesn't exist
        try {
          category = (await guild.channels.create({
            name: categoryName,
            type: ChannelType.GuildCategory,
          })) as CategoryChannel
          Logger.info(`Created onboarding category: ${categoryName}`)
        } catch (error) {
          Logger.error(`Failed to create category ${categoryName}:`, error)
          return null
        }
      }

      // Create private channel with permissions for only the new member and team lead
      const permissionOverwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: member.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: teamLead.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ],
        },
      ]

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites,
      })

      Logger.info(
        `Created private onboarding channel ${channelName} for ${member.user.tag} and team lead ${teamLead.user.tag} (team: ${teamName})`,
      )

      return channel as TextChannel
    } catch (error) {
      Logger.error(
        `Failed to create onboarding channel for ${member.user.tag} and team ${teamName}:`,
        error,
      )
      return null
    }
  }

  /**
   * Sends a welcome message to an onboarding channel based on the team name.
   * @param channel The channel to send the message to
   * @param teamName The team name to look up the message for
   * @param member The guild member who is being onboarded
   */
  public static async sendTeamWelcomeMessage(
    channel: TextChannel,
    teamName: string,
    member: GuildMember,
  ): Promise<void> {
    try {
      // Find the team lead to mention them in the message
      const teamLead = await this.findTeamLead(member.guild, teamName)
      const teamLeadMention = teamLead ? ` ${teamLead}` : ''

      // Look up the message for this team
      const message = TeamMessages[teamName] as string | undefined

      if (!message) {
        Logger.warn(
          `No welcome message configured for team "${teamName}". Sending default message.`,
        )
        // Send a default welcome message
        const defaultEmbed = new EmbedBuilder()
          .setTitle(`Welcome to ${teamName}!`)
          .setDescription(
            `Hello ${member}!${teamLeadMention ? `\n\nYour team lead${teamLeadMention} will help you get started.` : ''}\n\nThank you for expressing interest in the **${teamName}** team.`,
          )
          .setColor(0x4caf50)
          .setTimestamp()

        await channel.send({ embeds: [defaultEmbed] })
        return
      }

      // Send the configured welcome message as an embed
      const embed = new EmbedBuilder()
        .setTitle(`Welcome to ${teamName}!`)
        .setDescription(
          `Hello ${member}!${teamLeadMention ? `\n\nYour team lead${teamLeadMention} will help you get started.` : ''}\n\n${message}`,
        )
        .setColor(0x4caf50)
        .setTimestamp()

      await channel.send({ embeds: [embed] })

      Logger.info(`Sent welcome message to ${channel.name} for team ${teamName}`)
    } catch (error) {
      Logger.error(
        `Failed to send welcome message to channel ${channel.name} for team ${teamName}:`,
        error,
      )
    }
  }
}
