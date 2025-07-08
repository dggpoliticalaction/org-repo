import { type Message, type MessageReaction, type User } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';

import { type EventHandler } from './index.js';
import { type Reaction } from '../reactions/index.js';
import { type EventDataService } from '../services/index.js';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

export class ReactionHandler implements EventHandler {
  private rateLimiter = new RateLimiter(
    Config.rateLimiting.reactions.amount,
    Config.rateLimiting.reactions.interval * 1000,
  );

  constructor(
        private reactions: Reaction[],
        private eventDataService: EventDataService,
  ) {}

  public async process(msgReaction: MessageReaction, msg: Message, reactor: User): Promise<void> {
    // Don't respond to self, or other bots
    if (reactor.id === msgReaction.client.user?.id || reactor.bot) {
      return;
    }

    // Check if user is rate limited
    const limited = this.rateLimiter.take(msg.author.id);
    if (limited) {
      return;
    }

    // Try to find the reaction the user wants
    const reaction = this.findReaction(msgReaction.emoji.name);
    if (!reaction) {
      return;
    }

    if (reaction.requireGuild && !msg.guild) {
      return;
    }

    if (reaction.requireSentByClient && msg.author.id !== msg.client.user?.id) {
      return;
    }

    // Check if the embeds author equals the reactors tag
    if (reaction.requireEmbedAuthorTag && msg.embeds[0]?.author?.name !== reactor.tag) {
      return;
    }

    // Get data from database
    const data = await this.eventDataService.create({
      user: reactor,
      channel: msg.channel,
      guild: msg.guild,
    });

    // Execute the reaction
    await reaction.execute(msgReaction, msg, reactor, data);
  }

  private findReaction(emoji: string): Reaction {
    return this.reactions.find(reaction => reaction.emoji === emoji);
  }
}
