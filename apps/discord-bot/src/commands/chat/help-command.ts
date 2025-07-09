import {
  type ChatInputCommandInteraction,
  type EmbedBuilder,
  type PermissionsString,
} from 'discord.js'

import { HelpOption } from '../../enums/index.js'
import { Language } from '../../models/enum-helpers/index.js'
import { type EventData } from '../../models/internal-models.js'
import { Lang } from '../../services/index.js'
import { ClientUtils, FormatUtils, InteractionUtils } from '../../utils/index.js'
import { type Command, CommandDeferType } from '../index.js'

export class HelpCommand implements Command {
  public names = [Lang.getRef('chatCommands.help', Language.Default)]
  public deferType = CommandDeferType.HIDDEN
  public requireClientPerms: PermissionsString[] = []
  public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
    const args = {
      option: intr.options.getString(
        Lang.getRef('arguments.option', Language.Default),
      ) as HelpOption,
    }

    let embed: EmbedBuilder
    switch (args.option) {
      case HelpOption.CONTACT_SUPPORT: {
        embed = Lang.getEmbed('displayEmbeds.helpContactSupport', data.lang)
        break
      }
      case HelpOption.COMMANDS: {
        const testCmd = await ClientUtils.findAppCommand(
          intr.client,
          Lang.getRef('chatCommands.test', Language.Default),
        )
        const infoCmd = await ClientUtils.findAppCommand(
          intr.client,
          Lang.getRef('chatCommands.info', Language.Default),
        )
        embed = Lang.getEmbed('displayEmbeds.helpCommands', data.lang, {
          CMD_LINK_TEST: testCmd
            ? FormatUtils.commandMention(testCmd)
            : Lang.getRef('other.na', data.lang),
          CMD_LINK_INFO: infoCmd
            ? FormatUtils.commandMention(infoCmd)
            : Lang.getRef('other.na', data.lang),
        })
        break
      }
      default: {
        return
      }
    }

    await InteractionUtils.send(intr, embed)
  }
}
