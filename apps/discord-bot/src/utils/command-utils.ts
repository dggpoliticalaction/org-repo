import {
  type CommandInteraction,
  GuildChannel,
  type MessageComponentInteraction,
  type ModalSubmitInteraction,
  ThreadChannel,
  GuildMember
} from 'discord.js'

import { FormatUtils, InteractionUtils } from './index.js'
import { type Command } from '../commands/index.js'
import { getRoleNameById } from '../constants/index.js'
import { Permission } from '../models/enum-helpers/index.js'
import { type EventData } from '../models/internal-models.js'
import { Lang } from '../services/index.js'

export class CommandUtils {
  public static findCommand(commands: Command[], commandParts: string[]): Command | null {
    let found = [...commands]
    let closestMatch: Command | null = null
    for (const [index, commandPart] of commandParts.entries()) {
      found = found.filter((command) => command.names[index] === commandPart)
      if (found.length === 0) {
        return null
      }

      if (found.length === 1) {
        return found[0] ?? null
      }

      const exactMatch = found.find((command) => command.names.length === index + 1)
      if (exactMatch) {
        closestMatch = exactMatch
      }
    }
    return closestMatch
  }

  public static async runChecks(
    command: Command,
    intr: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
    data: EventData,
  ): Promise<boolean> {
    ////////////////////
    // Cooldown check //
    ////////////////////
    if (command.cooldown) {
      const limited = command.cooldown.take(intr.user.id)
      if (limited) {
        await InteractionUtils.send(
          intr,
          Lang.getEmbed('validationEmbeds.cooldownHit', data.lang, {
            AMOUNT: command.cooldown.amount.toLocaleString(data.lang),
            INTERVAL: FormatUtils.duration(command.cooldown.interval, data.lang),
          }),
        )
        return false
      }
    }

    /////////////////////////////
    // Client permission check //
    /////////////////////////////
    if (
      (intr.channel instanceof GuildChannel || intr.channel instanceof ThreadChannel) &&
      !intr.channel.permissionsFor(intr.client.user)?.has(command.requireClientPerms)
    ) {
      await InteractionUtils.send(
        intr,
        Lang.getEmbed('validationEmbeds.missingClientPerms', data.lang, {
          PERMISSIONS: command.requireClientPerms
            .map((perm) => `**${Permission.Data[perm]?.displayName(data.lang)}**`)
            .join(', '),
        }),
      )
      return false
    }

    /////////////////
    // Role checks //
    /////////////////
    if (command.requireRoles?.length) {
      // Running in server
      if (!intr.inGuild() || !(intr?.member instanceof GuildMember)) {
        await InteractionUtils.send(
          intr,
          Lang.getEmbed("validationEmbeds.guildOnly", data.lang)
        )
        return false
      }

      // Ensure member isn't null before grabbing roles
      const guildMem = intr.member
      if (guildMem == null) {
        await InteractionUtils.send(
          intr,
          Lang.getEmbed("validationEmbeds.nullMember", data.lang)
        )
        return false
      }

      // Compare user roles to allowed roles
      const hasRole = command.requireRoles.some((role) =>
        guildMem.roles.cache.has(role),
      )

      // Handle incorrect role case
      if (!hasRole) {
        await InteractionUtils.send(
          intr,
          Lang.getEmbed('validationEmbeds.missingRole', data.lang, {
            ROLES: command.requireRoles
                    .map(getRoleNameById)
                    .join(', ')
          }),
        )
        return false
      }
    }

    return true
  }
}
