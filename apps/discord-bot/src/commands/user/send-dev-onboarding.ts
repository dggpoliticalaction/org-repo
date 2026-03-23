import {
  type PermissionsString,
  type UserContextMenuCommandInteraction,
} from 'discord.js'
import { RateLimiter } from 'discord.js-rate-limiter'

import { Language } from '../../models/enum-helpers/index.js'
import { type EventData } from '../../models/internal-models.js'
import { Lang, Logger } from '../../services/index.js'
import { InteractionUtils, MessageUtils } from '../../utils/index.js'
import { type Command, CommandDeferType } from '../index.js'
import { DevOnboarding } from '../../constants/dev-onboarding.js'

export class SendDevOnboarding implements Command {
  public names = [Lang.getRef('userCommands.sendDevOnboarding', Language.Default)]
  public cooldown = new RateLimiter(2, 4000)
  public deferType = CommandDeferType.HIDDEN
  public requireClientPerms: PermissionsString[] = []

  public constructor() {
    Logger.info(`Created SendDevOnboarding command add: ${this.names}`)
  }

  public async execute(intr: UserContextMenuCommandInteraction, data: EventData): Promise<void> {
    try {
      // Send the onboarding info
      await MessageUtils.send(
        intr.targetUser,
        Lang.getEmbed("displayEmbeds.devOnboarding", data.lang, {
          CONTENT: DevOnboarding.Message
        })
      )

      // Inform the sender it worked
      await InteractionUtils.send(intr, {
        content: `${Lang.getCom("emojis.yes")} Sent onboarding info to ${intr.targetUser.tag}!`,
        ephemeral: true,
      })
    } catch {
      // Inform the sender it didn't work
      await InteractionUtils.send(intr, {
        content: `${Lang.getCom("emojis.no")} User DMs are disabled! Failed to send.`,
        ephemeral: true,
      })

      // Log the issue
      Logger.warn(`Failed to send dev onboarding; ${intr.targetUser.tag} has DMs off`)
    }
  }
}
