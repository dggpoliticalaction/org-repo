import { type Guild } from 'discord.js'
import { createRequire } from 'node:module'

import { type EventHandler } from './index.js'
import { Language } from '../models/enum-helpers/index.js'
import { type EventDataService, Lang, Logger } from '../services/index.js'
import { ClientUtils, FormatUtils, MessageUtils } from '../utils/index.js'

const require = createRequire(import.meta.url)
const Logs = require('../../lang/logs.json')

export class GuildJoinHandler implements EventHandler {
  constructor(private eventDataService: EventDataService) {}

  public async process(guild: Guild): Promise<void> {
    Logger.info(
      Logs.info.guildJoined
        .replaceAll('{GUILD_NAME}', guild.name)
        .replaceAll('{GUILD_ID}', guild.id),
    )

    const owner = await guild.fetchOwner()

    // Get data from database
    const data = await this.eventDataService.create({
      user: owner?.user,
      guild,
    })

    // Send welcome message to the server's notify channel
    const notifyChannel = await ClientUtils.findNotifyChannel(guild, data.langGuild)
    if (notifyChannel) {
      const notifyCmd = await ClientUtils.findAppCommand(
        guild.client,
        Lang.getRef('chatCommands.help', Language.Default),
      )
      const notifyCmdLinkHelp = notifyCmd
        ? FormatUtils.commandMention(notifyCmd)
        : Lang.getRef('other.na', data.langGuild)

      await MessageUtils.send(
        notifyChannel,
        Lang.getEmbed('displayEmbeds.welcome', data.langGuild, {
          CMD_LINK_HELP: notifyCmdLinkHelp,
        }).setAuthor({
          name: guild.name,
          iconURL: guild.iconURL() ?? undefined,
        }),
      )
    }

    const ownerCmd = await ClientUtils.findAppCommand(
      guild.client,
      Lang.getRef('chatCommands.help', Language.Default),
    )
    const ownerCmdLinkHelp = ownerCmd
      ? FormatUtils.commandMention(ownerCmd)
      : Lang.getRef('other.na', data.lang)

    await MessageUtils.send(
      owner.user,
      Lang.getEmbed('displayEmbeds.welcome', data.lang, {
        CMD_LINK_HELP: ownerCmdLinkHelp,
      }).setAuthor({
        name: guild.name,
        iconURL: guild.iconURL() ?? undefined,
      }),
    )
  }
}
