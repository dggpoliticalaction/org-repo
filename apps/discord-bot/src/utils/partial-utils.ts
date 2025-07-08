import {
  DiscordAPIError,
  RESTJSONErrorCodes as DiscordApiErrors,
  type Message,
  type MessageReaction,
  type PartialMessage,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from 'discord.js'

const IGNORED_ERRORS = [
  DiscordApiErrors.UnknownMessage,
  DiscordApiErrors.UnknownChannel,
  DiscordApiErrors.UnknownGuild,
  DiscordApiErrors.UnknownUser,
  DiscordApiErrors.UnknownInteraction,
  DiscordApiErrors.MissingAccess,
]

export class PartialUtils {
  public static async fillUser(user: User | PartialUser): Promise<User | null> {
    if (user.partial) {
      try {
        return await user.fetch()
      } catch (error) {
        if (
          error instanceof DiscordAPIError &&
          typeof error.code == 'number' &&
          IGNORED_ERRORS.includes(error.code)
        ) {
          return null
        } else {
          throw error
        }
      }
    }

    return user as User
  }

  public static async fillMessage(msg: Message | PartialMessage): Promise<Message | null> {
    if (msg.partial) {
      try {
        return await msg.fetch()
      } catch (error) {
        if (
          error instanceof DiscordAPIError &&
          typeof error.code == 'number' &&
          IGNORED_ERRORS.includes(error.code)
        ) {
          return null
        } else {
          throw error
        }
      }
    }

    return msg as Message
  }

  public static async fillReaction(
    msgReaction: MessageReaction | PartialMessageReaction,
  ): Promise<MessageReaction | null> {
    if (msgReaction.partial) {
      try {
        msgReaction = await msgReaction.fetch()
      } catch (error) {
        if (
          error instanceof DiscordAPIError &&
          typeof error.code == 'number' &&
          IGNORED_ERRORS.includes(error.code)
        ) {
          return null
        } else {
          throw error
        }
      }
    }

    const filledMessage = await this.fillMessage(msgReaction.message)
    if (!filledMessage) {
      return null
    }
    msgReaction.message = filledMessage

    return msgReaction as MessageReaction
  }
}
