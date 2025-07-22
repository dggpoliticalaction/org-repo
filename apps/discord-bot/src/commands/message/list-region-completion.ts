import { type MessageContextMenuCommandInteraction, type PermissionsString } from "discord.js";
import { Language } from "../../models/enum-helpers/index.js";
import { Lang } from "../../services/index.js";
import { CommandDeferType, type Command } from "../index.js";
import { type EventData } from "../../models/internal-models.js";
import { InteractionUtils } from "../../utils/index.js";

export class ListRegionCompletion implements Command {
  public names = [Lang.getRef('messageCommands.listRegionCompletion', Language.Default)]
  public deferType = CommandDeferType.PUBLIC
  public requireClientPerms: PermissionsString[] = []

  public async execute(intr: MessageContextMenuCommandInteraction, data: EventData): Promise<void> {

    // define reaction emojis
    const finishedEmoji = '✅'
    const planningEmoji = '🟨'
    const notGonnaEmoji = '❌'
    const targetEmojis = [finishedEmoji, planningEmoji, notGonnaEmoji]

    // get the region roles
    const regionRoleNames = [
      'Midwest-South Squad'
    ]
    const regionRoles = {}
    for (const roleName of regionRoleNames) {
      const role = intr.guild?.roles.cache.filter(r => r.name === roleName).first()
      if (role === null || role === undefined) {
        throw new Error(`Guild roles cache was missing ${roleName} (intr.guild is null: ${intr.guild === null})`)
      }
      regionRoles[role.id] = role
    }

    // create recording of region by reaction
    const totals = {}
    for (const emoji of targetEmojis) {
      totals[emoji] = Object.fromEntries(Object.keys(regionRoles).map(roleName => [roleName, 0]))
    }
    // also create a set of users we've already encountered. this way, if someone marks the CTA as finished but forgets
    // to remove their previous reaction, we'll count the "best" one.
    const encounteredUsers = new Set<string>()

    // tally each reaction's entries by role
    const reactions = intr.targetMessage.reactions.cache
    for (const [emoji, messageReaction] of reactions.filter(r => targetEmojis.includes(r.emoji.toString()))) {
      const reactionUsers = messageReaction.users
      for (const [id, user] of await reactionUsers.fetch()) {
        if (encounteredUsers.has(user.id)) {
          continue
        }

        const guildMember = intr.guild?.members.cache.get(id)
        const memberRegionRoles = guildMember?.roles.cache.filter(r => regionRoleNames.includes(r.name))
        if (!memberRegionRoles || memberRegionRoles.size !== 1) {
          continue
        }
        const memberRole = memberRegionRoles.first()!

        totals[emoji][memberRole.id]++
        encounteredUsers.add(user.id)
      }
    }

    // this will generate 2D arrays, where first element of the nested array is the role ID and the second element
    // is the number of respondents in that role with the specified reaction. will be ordered from highest to lowest.
    const finishedRank = Object.keys(totals[finishedEmoji])
      .map(i => [i, totals[finishedEmoji][i]])
      .sort(a => a[1]).reverse()
    const planningRank = Object.keys(totals[planningEmoji])
      .map(i => [i, totals[planningEmoji][i]])
      .sort(a => a[1]).reverse()
    const notGonnaRank = Object.keys(totals[notGonnaEmoji])
      .map(i => [i, totals[notGonnaEmoji][i]])
      .sort(a => a[1]).reverse()

    const embed = Lang.getEmbed('displayEmbeds.listRegionCompletion', data.lang)
    embed.addFields([
      {
        name: `${finishedEmoji} Completed`,
        value: (finishedRank.map((rankArr, idx) => {
          const role = regionRoles[rankArr[0]]
          return `${idx + 1}. ${role.name} (${rankArr[1]})`
        }).join('\n'))
      },
      {
        name: `${planningEmoji} Planned`,
        value: (planningRank.map((rankArr, idx) => {
          const role = regionRoles[rankArr[0]]
          return `${idx + 1}. ${role.name} (${rankArr[1]})`
        }).join('\n'))
      },
      {
        name: `${notGonnaEmoji} Didn't do`,
        value: (notGonnaRank.map((rankArr, idx) => {
          const role = regionRoles[rankArr[0]]
          return `${idx + 1}. ${role.name} (${rankArr[1]})`
        }).join('\n'))
      },
    ])
    await InteractionUtils.send(intr, embed)
  }
}
