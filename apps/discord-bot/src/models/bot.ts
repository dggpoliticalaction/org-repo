import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChannelType,
  type Client,
  CommandInteraction,
  Events,
  type Guild,
  type Interaction,
  type Message,
  type MessageReaction,
  type PartialMessageReaction,
  type PartialUser,
  type RateLimitData,
  RESTEvents,
  type User,
} from 'discord.js'
import { createRequire } from 'node:module'

import {
  type ButtonHandler,
  type CommandHandler,
  type GuildJoinHandler,
  type GuildLeaveHandler,
  type MessageHandler,
  type ReactionHandler,
} from '../events/index.js'
import { type JobService, Logger } from '../services/index.js'
import { PartialUtils } from '../utils/index.js'
import { CTAPostTrigger } from '../triggers/cta-post.js'

const require = createRequire(import.meta.url)
const Config = require('../../config/config.json')
const Debug = require('../../config/debug.json')
const Logs = require('../../lang/logs.json')
const ctaChannelName = "call-to-action";
// const guildName = "DGG Political Action"
const guildName = "TexasMomtears's server"

export class Bot {
  private ready = false

  constructor(
    private token: string,
    private client: Client,
    private guildJoinHandler: GuildJoinHandler,
    private guildLeaveHandler: GuildLeaveHandler,
    private messageHandler: MessageHandler,
    private commandHandler: CommandHandler,
    private buttonHandler: ButtonHandler,
    private reactionHandler: ReactionHandler,
    private jobService: JobService,
  ) { }

  public async start(): Promise<void> {
    this.registerListeners()
    await this.login(this.token)
  }

  private registerListeners(): void {
    this.client.on(Events.ClientReady, () => this.onReady())
    this.client.on(Events.ShardReady, (shardId: number, unavailableGuilds: Set<string>) =>
      this.onShardReady(shardId, unavailableGuilds),
    )
    this.client.on(Events.GuildCreate, (guild: Guild) => this.onGuildJoin(guild))
    this.client.on(Events.GuildDelete, (guild: Guild) => this.onGuildLeave(guild))
    this.client.on(Events.MessageCreate, (msg: Message) => this.onMessage(msg))
    this.client.on(Events.InteractionCreate, (intr: Interaction) => this.onInteraction(intr))
    this.client.on(
      Events.MessageReactionAdd,
      (messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) =>
        this.onReaction(messageReaction, user),
    )
    this.client.rest.on(RESTEvents.RateLimited, (rateLimitData: RateLimitData) =>
      this.onRateLimit(rateLimitData),
    )
  }

  private async login(token: string): Promise<void> {
    try {
      await this.client.login(token)
    } catch (error) {
      Logger.error(Logs.error.clientLogin, error)
      return
    }
  }

  private async onReady(): Promise<void> {
    const userTag = this.client.user?.tag

    Logger.info(Logs.info.clientLogin.replaceAll('{USER_TAG}', userTag))

    if (!Debug.dummyMode.enabled) {
      this.jobService.start()
    }

    this.ready = true
    Logger.info(Logs.info.clientReady)

    const ctaChannel = this.client.guilds.cache.find(dggPol => dggPol.name === guildName)?.channels.cache.find(ctaChan => ctaChan?.name === ctaChannelName);

    if (ctaChannel?.type === ChannelType.GuildText) {
      // eslint-disable-next-line no-console
      const ctaPostTrigger = new CTAPostTrigger();

      ctaChannel.messages.fetch().then(msgs => {
        msgs.forEach(msg => {
          ctaPostTrigger.execute(msg)
        })
      })
    }
  }

  private onShardReady(shardId: number, _unavailableGuilds: Set<string>): void {
    Logger.setShardId(shardId)
  }

  private async onGuildJoin(guild: Guild): Promise<void> {
    if (!this.ready || Debug.dummyMode.enabled) {
      return
    }

    try {
      await this.guildJoinHandler.process(guild)
    } catch (error) {
      Logger.error(Logs.error.guildJoin, error)
    }
  }

  private async onGuildLeave(guild: Guild): Promise<void> {
    if (!this.ready || Debug.dummyMode.enabled) {
      return
    }

    try {
      await this.guildLeaveHandler.process(guild)
    } catch (error) {
      Logger.error(Logs.error.guildLeave, error)
    }
  }

  private async onMessage(msg: Message): Promise<void> {
    if (
      !this.ready ||
      (Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(msg.author.id))
    ) {
      return
    }

    try {
      const filledMsg = await PartialUtils.fillMessage(msg)
      if (!filledMsg) {
        return
      }

      await this.messageHandler.process(filledMsg)
    } catch (error) {
      Logger.error(Logs.error.message, error)
    }
  }

  private async onInteraction(intr: Interaction): Promise<void> {
    if (
      !this.ready ||
      (Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(intr.user.id))
    ) {
      return
    }

    if (intr instanceof CommandInteraction || intr instanceof AutocompleteInteraction) {
      try {
        await this.commandHandler.process(intr)
      } catch (error) {
        Logger.error(Logs.error.command, error)
      }
    } else if (intr instanceof ButtonInteraction) {
      try {
        await this.buttonHandler.process(intr)
      } catch (error) {
        Logger.error(Logs.error.button, error)
      }
    }
  }

  private async onReaction(
    msgReaction: MessageReaction | PartialMessageReaction,
    reactor: User | PartialUser,
  ): Promise<void> {
    if (
      !this.ready ||
      (Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(reactor.id))
    ) {
      return
    }

    try {
      const filledReaction = await PartialUtils.fillReaction(msgReaction)
      if (!filledReaction) {
        return
      }
      msgReaction = filledReaction

      const filledUser = await PartialUtils.fillUser(reactor)
      if (!filledUser) {
        return
      }
      reactor = filledUser

      await this.reactionHandler.process(msgReaction, msgReaction.message as Message, reactor)
    } catch (error) {
      Logger.error(Logs.error.reaction, error)
    }
  }

  private async onRateLimit(rateLimitData: RateLimitData): Promise<void> {
    if (rateLimitData.timeToReset >= Config.logging.rateLimit.minTimeout * 1000) {
      Logger.error(Logs.error.apiRateLimit, rateLimitData)
    }
  }
}
