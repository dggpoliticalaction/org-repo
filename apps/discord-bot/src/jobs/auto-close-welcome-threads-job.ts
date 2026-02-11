import { type Client } from 'discord.js'
import { createRequire } from 'node:module'

import { Job } from './job.js'
import { Logger } from '../services/logger.js'
import { WelcomeThreadService } from '../services/welcome-thread-service.js'

const require = createRequire(import.meta.url)
const Config = require('../../config/config.json')

/**
 * Job that automatically closes welcome threads after a configured number of days
 * of inactivity (default 5 days) to reduce noise and stay under server thread caps.
 */
export class AutoCloseWelcomeThreadsJob extends Job {
  public name = 'Auto Close Welcome Threads'
  public schedule: string =
    Config.jobs.autoCloseWelcomeThreads?.schedule ?? '0 0 * * * *'
  public log: boolean = Config.jobs.autoCloseWelcomeThreads?.log ?? true
  public override runOnce: boolean =
    Config.jobs.autoCloseWelcomeThreads?.runOnce ?? false
  public override initialDelaySecs: number =
    Config.jobs.autoCloseWelcomeThreads?.initialDelaySecs ?? 120

  constructor(private client: Client) {
    super()
  }

  public async run(): Promise<void> {
    const inactivityDays = Config.welcomeThread?.inactivityDays ?? 5
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - inactivityDays)

    Logger.info(
      `Running auto-close job for welcome threads (inactive > ${inactivityDays} days, cutoff: ${cutoffDate.toISOString()})`,
    )

    let closedCount = 0
    let checkedCount = 0

    for (const [, guild] of this.client.guilds.cache) {
      try {
        const channel = WelcomeThreadService.findWelcomeChannel(guild)
        if (!channel) continue

        const active = await channel.threads.fetchActive()
        for (const [, thread] of active.threads) {
          checkedCount++
          try {
            const messages = await thread.messages.fetch({ limit: 1 })
            const lastMessage = messages.first()
            const lastActivityTime = lastMessage
              ? new Date(lastMessage.createdTimestamp)
              : thread.createdAt

            if (lastActivityTime && lastActivityTime < cutoffDate) {
              Logger.info(
                `Closing inactive welcome thread: ${thread.name} in ${guild.name} (last activity: ${lastActivityTime.toISOString()})`,
              )

              await thread.send({
                content: `This welcome thread has been inactive for ${inactivityDays} days and will now be closed. If you still need assistance, you can select your interest role again to create a new welcome thread.`,
              })

              await thread.delete(
                `Auto-closed after ${inactivityDays} days of inactivity`,
              )
              closedCount++
            }
          } catch (error) {
            Logger.error(
              `Failed to process welcome thread ${thread.name} in ${guild.name}:`,
              error,
            )
          }
        }
      } catch (error) {
        Logger.error(
          `Failed to process guild ${guild.name} for welcome thread auto-close:`,
          error,
        )
      }
    }

    Logger.info(
      `Auto-close welcome threads job completed: checked ${checkedCount} threads, closed ${closedCount} inactive threads`,
    )
  }
}
