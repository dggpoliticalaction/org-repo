import {
  type PermissionsString,
  type UserContextMenuCommandInteraction,
} from 'discord.js'
import { RateLimiter } from 'discord.js-rate-limiter'

import { Language } from '../../models/enum-helpers/index.js'
import { type EventData } from '../../models/internal-models.js'
import { Lang, Logger } from '../../services/index.js'
import { InteractionUtils } from '../../utils/index.js'
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
    await InteractionUtils.send(
      intr,
      Lang.getEmbed('displayEmbeds.devOnboarding', data.lang, {
        CONTENT: DevOnboarding.Message
      }),
    )
  }
}
