import { type ChatInputCommandInteraction } from 'discord.js'
import { RateLimiter } from 'discord.js-rate-limiter'
import { type EventData } from '../../models/internal-models.js'
import { type Command, CommandDeferType } from '../index.js'
import { Lang } from '../../services/lang.js'
import { Language } from '../../models/enum-helpers/index.js'
import { InteractionUtils } from '../../utils/interaction-utils.js'
import { Rules } from '../../constants/rules.js'

export class RulesCommand implements Command {
  names = [Lang.getRef('chatCommands.rules', Language.Default)]
  cooldown = new RateLimiter(2, 30 * 1000)
  deferType = CommandDeferType.HIDDEN
  requireClientPerms = []

  public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
    const args = {
      ruleNumber: intr.options.getInteger(
        Lang.getRef('arguments.ruleNumber', Language.Default),
      ) as number,
    }

    const embed = Lang.getEmbed('displayEmbeds.rules', data.lang)
    if (args.ruleNumber !== null) {
      // The rule number range is enforced by Discord.
      const rule = Rules.ServerRules[args.ruleNumber - 1]
      embed.addFields([
        {
          name: `**${args.ruleNumber}. ${rule?.title}**`,
          value: `${rule?.description}`,
        },
      ])
    } else {
      embed.addFields(
        Rules.ServerRules.map((r) => {
          const ruleNo = Rules.ServerRules.indexOf(r) + 1
          return {
            name: `**${ruleNo}. ${r.title}**`,
            value: r.description,
          }
        }),
      )
    }

    await InteractionUtils.send(intr, embed)
  }
}
