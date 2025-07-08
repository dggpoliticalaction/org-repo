import { type Message, type MessageReaction, type User } from 'discord.js'

import { type EventData } from '../models/internal-models.js'

export interface Reaction {
  emoji: string
  requireGuild: boolean
  requireSentByClient: boolean
  requireEmbedAuthorTag: boolean
  execute(msgReaction: MessageReaction, msg: Message, reactor: User, data: EventData): Promise<void>
}
