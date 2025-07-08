import {
  type ApplicationCommand,
  type Channel,
  type Client,
  DiscordAPIError,
  RESTJSONErrorCodes as DiscordApiErrors,
  type Guild,
  type GuildMember,
  type Locale,
  NewsChannel,
  type Role,
  StageChannel,
  TextChannel,
  type User,
  VoiceChannel,
} from 'discord.js'

import { PermissionUtils, RegexUtils } from './index.js'
import { Lang } from '../services/index.js'

const FETCH_MEMBER_LIMIT = 20
const IGNORED_ERRORS = [
  DiscordApiErrors.UnknownMessage,
  DiscordApiErrors.UnknownChannel,
  DiscordApiErrors.UnknownGuild,
  DiscordApiErrors.UnknownMember,
  DiscordApiErrors.UnknownUser,
  DiscordApiErrors.UnknownInteraction,
  DiscordApiErrors.MissingAccess,
]

export class ClientUtils {
  public static async getGuild(client: Client, discordId: string): Promise<Guild> {
    discordId = RegexUtils.discordId(discordId)
    if (!discordId) {
      return
    }

    try {
      return await client.guilds.fetch(discordId)
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return
      } else {
        throw error
      }
    }
  }

  public static async getChannel(client: Client, discordId: string): Promise<Channel> {
    discordId = RegexUtils.discordId(discordId)
    if (!discordId) {
      return
    }

    try {
      return await client.channels.fetch(discordId)
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return
      } else {
        throw error
      }
    }
  }

  public static async getUser(client: Client, discordId: string): Promise<User> {
    discordId = RegexUtils.discordId(discordId)
    if (!discordId) {
      return
    }

    try {
      return await client.users.fetch(discordId)
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return
      } else {
        throw error
      }
    }
  }

  public static async findAppCommand(client: Client, name: string): Promise<ApplicationCommand> {
    const commands = await client.application.commands.fetch()
    return commands.find((command) => command.name === name)
  }

  public static async findMember(guild: Guild, input: string): Promise<GuildMember> {
    try {
      const discordId = RegexUtils.discordId(input)
      if (discordId) {
        return await guild.members.fetch(discordId)
      }

      const tag = RegexUtils.tag(input)
      if (tag) {
        return (await guild.members.fetch({ query: tag.username, limit: FETCH_MEMBER_LIMIT })).find(
          (member) => member.user.discriminator === tag.discriminator,
        )
      }

      return (await guild.members.fetch({ query: input, limit: 1 })).first()
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return
      } else {
        throw error
      }
    }
  }

  public static async findRole(guild: Guild, input: string): Promise<Role> {
    try {
      const discordId = RegexUtils.discordId(input)
      if (discordId) {
        return await guild.roles.fetch(discordId)
      }

      const search = input.trim().toLowerCase().replace(/^@/, '')
      const roles = await guild.roles.fetch()
      return (
        roles.find((role) => role.name.toLowerCase() === search) ??
        roles.find((role) => role.name.toLowerCase().includes(search))
      )
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return
      } else {
        throw error
      }
    }
  }

  public static async findTextChannel(
    guild: Guild,
    input: string,
  ): Promise<NewsChannel | TextChannel> {
    try {
      const discordId = RegexUtils.discordId(input)
      if (discordId) {
        const channel = await guild.channels.fetch(discordId)
        if (channel instanceof NewsChannel || channel instanceof TextChannel) {
          return channel
        } else {
          return
        }
      }

      const search = input.trim().toLowerCase().replace(/^#/, '').replaceAll(' ', '-')
      const channels = [...(await guild.channels.fetch()).values()].filter(
        (channel) => channel instanceof NewsChannel || channel instanceof TextChannel,
      )
      return (
        channels.find((channel) => channel.name.toLowerCase() === search) ??
        channels.find((channel) => channel.name.toLowerCase().includes(search))
      )
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return
      } else {
        throw error
      }
    }
  }

  public static async findVoiceChannel(
    guild: Guild,
    input: string,
  ): Promise<VoiceChannel | StageChannel> {
    try {
      const discordId = RegexUtils.discordId(input)
      if (discordId) {
        const channel = await guild.channels.fetch(discordId)
        if (channel instanceof VoiceChannel || channel instanceof StageChannel) {
          return channel
        } else {
          return
        }
      }

      const search = input.trim().toLowerCase().replace(/^#/, '')
      const channels = [...(await guild.channels.fetch()).values()].filter(
        (channel) => channel instanceof VoiceChannel || channel instanceof StageChannel,
      )
      return (
        channels.find((channel) => channel.name.toLowerCase() === search) ??
        channels.find((channel) => channel.name.toLowerCase().includes(search))
      )
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return
      } else {
        throw error
      }
    }
  }

  public static async findNotifyChannel(
    guild: Guild,
    langCode: Locale,
  ): Promise<TextChannel | NewsChannel> {
    // Prefer the system channel
    const systemChannel = guild.systemChannel
    if (systemChannel && PermissionUtils.canSend(systemChannel, true)) {
      return systemChannel
    }

    // Otherwise look for a bot channel
    return (await guild.channels.fetch()).find(
      (channel) =>
        (channel instanceof TextChannel || channel instanceof NewsChannel) &&
        PermissionUtils.canSend(channel, true) &&
        Lang.getRegex('channelRegexes.bot', langCode).test(channel.name),
    ) as TextChannel | NewsChannel
  }
}
