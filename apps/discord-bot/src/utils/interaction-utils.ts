import {
  type ApplicationCommandOptionChoiceData,
  type AutocompleteInteraction,
  type CommandInteraction,
  DiscordAPIError,
  RESTJSONErrorCodes as DiscordApiErrors,
  EmbedBuilder,
  type InteractionReplyOptions,
  type InteractionResponse,
  type InteractionUpdateOptions,
  type Message,
  type MessageComponentInteraction,
  MessageFlags,
  type ModalSubmitInteraction,
  type WebhookMessageEditOptions,
} from 'discord.js'

const IGNORED_ERRORS = [
  DiscordApiErrors.UnknownMessage,
  DiscordApiErrors.UnknownChannel,
  DiscordApiErrors.UnknownGuild,
  DiscordApiErrors.UnknownUser,
  DiscordApiErrors.UnknownInteraction,
  DiscordApiErrors.CannotSendMessagesToThisUser, // User blocked bot or DM disabled
  DiscordApiErrors.ReactionWasBlocked, // User blocked bot or DM disabled
  DiscordApiErrors.MaximumActiveThreads,
]

export class InteractionUtils {
  public static async deferReply(
    intr: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
    hidden: boolean = false,
  ): Promise<InteractionResponse | null> {
    try {
      return await intr.deferReply({
        flags: hidden ? MessageFlags.Ephemeral : undefined,
      })
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

  public static async deferUpdate(
    intr: MessageComponentInteraction | ModalSubmitInteraction,
  ): Promise<InteractionResponse | null> {
    try {
      return await intr.deferUpdate()
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

  public static async send(
    intr: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
    content: string | EmbedBuilder | InteractionReplyOptions,
    hidden: boolean = false,
  ): Promise<Message | null> {
    try {
      const options: InteractionReplyOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content
      if (intr.deferred || intr.replied) {
        return await intr.followUp({
          ...options,
          flags: hidden ? MessageFlags.Ephemeral : undefined,
        })
      } else {
        return await intr.reply({
          ...options,
          flags: hidden ? MessageFlags.Ephemeral : undefined,
          fetchReply: true,
        })
      }
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

  public static async respond(
    intr: AutocompleteInteraction,
    choices: ApplicationCommandOptionChoiceData[] = [],
  ): Promise<void> {
    try {
      return await intr.respond(choices)
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return
      } else {
        throw error
      }
    }
  }

  public static async editReply(
    intr: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
    content: string | EmbedBuilder | WebhookMessageEditOptions,
  ): Promise<Message | null> {
    try {
      const options: WebhookMessageEditOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content
      return await intr.editReply(options)
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

  public static async update(
    intr: MessageComponentInteraction,
    content: string | EmbedBuilder | InteractionUpdateOptions,
  ): Promise<Message | null> {
    try {
      const options: InteractionUpdateOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content
      return await intr.update({
        ...options,
        fetchReply: true,
      })
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
}
