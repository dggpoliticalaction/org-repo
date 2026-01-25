import { ChannelType, type Client, type TextChannel } from 'discord.js'
import { createRequire } from 'node:module'

import { Job } from './job.js'
import { Logger } from '../services/index.js'

const require = createRequire(import.meta.url)
const Config = require('../../config/config.json')

/**
 * Job that automatically closes/archives onboarding channels after a configured
 * number of days of inactivity.
 */
export class AutoCloseOnboardingChannelsJob extends Job {
  public name = 'Auto Close Onboarding Channels'
  public schedule: string = Config.jobs.autoCloseOnboardingChannels?.schedule ?? '0 0 * * * *'
  public log: boolean = Config.jobs.autoCloseOnboardingChannels?.log ?? true
  public override runOnce: boolean = Config.jobs.autoCloseOnboardingChannels?.runOnce ?? false
  public override initialDelaySecs: number =
    Config.jobs.autoCloseOnboardingChannels?.initialDelaySecs ?? 60

  constructor(private client: Client) {
    super()
  }

  public async run(): Promise<void> {
    const autoCloseDays = Config.onboarding?.autoCloseDays ?? 7
    const categoryName = Config.onboarding?.categoryName ?? 'onboarding'
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - autoCloseDays)

    Logger.info(
      `Running auto-close job for onboarding channels older than ${autoCloseDays} days (cutoff: ${cutoffDate.toISOString()})`,
    )

    let closedCount = 0
    let checkedCount = 0

    // Iterate through all guilds the bot is in
    for (const [, guild] of this.client.guilds.cache) {
      try {
        // Find the onboarding category
        const category = guild.channels.cache.find(
          (channel) =>
            channel.type === ChannelType.GuildCategory &&
            channel.name.toLowerCase() === categoryName.toLowerCase(),
        )

        if (!category) {
          continue
        }

        // Find all text channels in the onboarding category
        const onboardingChannels = guild.channels.cache.filter(
          (channel) =>
            channel.type === ChannelType.GuildText &&
            channel.parentId === category.id &&
            channel.name.startsWith('onboarding-'),
        )

        for (const [, channel] of onboardingChannels) {
          checkedCount++
          const textChannel = channel as TextChannel

          try {
            // Fetch the last message to check activity
            const messages = await textChannel.messages.fetch({ limit: 1 })
            const lastMessage = messages.first()

            // Determine the last activity time
            const lastActivityTime = lastMessage
              ? new Date(lastMessage.createdTimestamp)
              : textChannel.createdAt

            // Check if the channel is inactive
            if (lastActivityTime && lastActivityTime < cutoffDate) {
              Logger.info(
                `Closing inactive onboarding channel: ${textChannel.name} in ${guild.name} (last activity: ${lastActivityTime.toISOString()})`,
              )

              // Send a closing message before deleting
              await textChannel.send({
                content: `This onboarding channel has been inactive for ${autoCloseDays} days and will now be closed. If you still need assistance, please select your team role again to create a new channel.`,
              })

              // Delete the channel
              await textChannel.delete(
                `Auto-closed after ${autoCloseDays} days of inactivity`,
              )

              closedCount++
            }
          } catch (error) {
            Logger.error(
              `Failed to process onboarding channel ${textChannel.name} in ${guild.name}:`,
              error,
            )
          }
        }
      } catch (error) {
        Logger.error(`Failed to process guild ${guild.name} for auto-close:`, error)
      }
    }

    Logger.info(
      `Auto-close job completed: checked ${checkedCount} channels, closed ${closedCount} inactive channels`,
    )
  }
}
