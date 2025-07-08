import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type CommandInteraction,
  type ContextMenuCommandInteraction,
  type Interaction,
  type Message,
  type MessageReaction,
  type ModalSubmitInteraction,
  type PartialMessageReaction,
  type StringSelectMenuInteraction,
  type VoiceState,
} from 'discord.js';
import { type SimpleCommandMessage } from 'discordx';

import packageJson from '../../../package.json';

type AllInteractions =
  | SimpleCommandMessage
  | ChatInputCommandInteraction
  | ContextMenuCommandInteraction
  | ButtonInteraction
  | StringSelectMenuInteraction
  | ModalSubmitInteraction
  | Message
  | VoiceState
  | MessageReaction
  | PartialMessageReaction

const resolvers = {
  user: {
    SimpleCommandMessage: (interaction: SimpleCommandMessage) => interaction.message.author,
    ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) => interaction.user,
    UserContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.member?.user,
    MessageContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.member?.user,

    ButtonInteraction: (interaction: ButtonInteraction) => interaction.member?.user,
    StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) =>
      interaction.member?.user,
    ModalSubmitInteraction: (interaction: ModalSubmitInteraction) => interaction.member?.user,

    Message: (interaction: Message) => interaction.author,
    VoiceState: (interaction: VoiceState) => interaction.member?.user,
    MessageReaction: (interaction: MessageReaction) => interaction.message.author,
    PartialMessageReaction: (interaction: PartialMessageReaction) => interaction.message.author,

    fallback: (_: unknown) => null,
  },

  member: {
    SimpleCommandMessage: (interaction: SimpleCommandMessage) => interaction.message.member,
    ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) => interaction.member,
    UserContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.member,
    MessageContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.member,

    ButtonInteraction: (interaction: ButtonInteraction) => interaction.member,
    StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) => interaction.member,
    ModalSubmitInteraction: (interaction: ModalSubmitInteraction) => interaction.member,

    Message: (interaction: Message) => interaction.member,
    VoiceState: (interaction: VoiceState) => interaction.member,
    MessageReaction: (interaction: MessageReaction) => interaction.message.member,
    PartialMessageReaction: (interaction: PartialMessageReaction) => interaction.message.member,

    fallback: (_: unknown) => null,
  },

  guild: {
    SimpleCommandMessage: (interaction: SimpleCommandMessage) => interaction.message.guild,
    ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) => interaction.guild,
    UserContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.guild,
    MessageContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.guild,

    ButtonInteraction: (interaction: ButtonInteraction) => interaction.guild,
    StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) => interaction.guild,
    ModalSubmitInteraction: (interaction: ModalSubmitInteraction) => interaction.guild,

    fallback: (_: unknown) => null,
  },

  channel: {
    ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) => interaction.channel,
    SimpleCommandMessage: (interaction: SimpleCommandMessage) => interaction.message.channel,
    UserContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.channel,
    MessageContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.channel,

    ButtonInteraction: (interaction: ButtonInteraction) => interaction.channel,
    StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) => interaction.channel,
    ModalSubmitInteraction: (interaction: ModalSubmitInteraction) => interaction.channel,

    fallback: (_: unknown) => null,
  },

  commandName: {
    SimpleCommandMessage: (interaction: SimpleCommandMessage) => interaction.name,
    ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) =>
      interaction.commandName,
    UserContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.commandName,
    MessageContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.commandName,

    fallback: (_: unknown) => '',
  },

  action: {
    ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) => {
      return (
        interaction.commandName +
        (interaction?.options.getSubcommandGroup(false)
          ? ` ${interaction.options.getSubcommandGroup(false)}`
          : '') +
        (interaction?.options.getSubcommand(false)
          ? ` ${interaction.options.getSubcommand(false)}`
          : '')
      );
    },
    SimpleCommandMessage: (interaction: SimpleCommandMessage) => interaction.name,
    UserContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.commandName,
    MessageContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.commandName,

    ButtonInteraction: (interaction: ButtonInteraction) => interaction.customId,
    StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) => interaction.customId,
    ModalSubmitInteraction: (interaction: ModalSubmitInteraction) => interaction.customId,

    fallback: (_: unknown) => '',
  },

  locale: {
    SimpleCommandMessage: (interaction: SimpleCommandMessage) =>
      interaction.message.guild?.preferredLocale ?? 'default',
    ChatInputCommandInteraction: (interaction: ChatInputCommandInteraction) => interaction.locale,
    UserContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.locale,
    MessageContextMenuCommandInteraction: (interaction: ContextMenuCommandInteraction) =>
      interaction.locale,

    ButtonInteraction: (interaction: ButtonInteraction) => interaction.locale,
    StringSelectMenuInteraction: (interaction: StringSelectMenuInteraction) => interaction.locale,
    ModalSubmitInteraction: (interaction: ModalSubmitInteraction) => interaction.locale,

    fallback: (_: unknown) => 'en',
  },
};

export function getTypeOfInteraction(
  interaction:
    | AllInteractions
    | Interaction
    | Message
    | VoiceState
    | MessageReaction
    | PartialMessageReaction,
): string {
  return interaction?.constructor.name ?? 'Unknown';
}

export function resolveUser(
  interaction:
    | AllInteractions
    | Interaction
    | Message
    | VoiceState
    | MessageReaction
    | PartialMessageReaction,
): unknown {
  return (
    resolvers.user[getTypeOfInteraction(interaction) as keyof typeof resolvers.user]?.(
      interaction as never,
    ) || resolvers.user.fallback(interaction)
  );
}

export function resolveMember(
  interaction:
    | AllInteractions
    | Interaction
    | Message
    | VoiceState
    | MessageReaction
    | PartialMessageReaction,
): unknown {
  return (
    resolvers.member[getTypeOfInteraction(interaction) as keyof typeof resolvers.member]?.(
      interaction as never,
    ) || resolvers.member.fallback(interaction)
  );
}

export function resolveGuild(
  interaction:
    | AllInteractions
    | Interaction
    | Message
    | VoiceState
    | MessageReaction
    | PartialMessageReaction,
): unknown {
  return (
    resolvers.guild[getTypeOfInteraction(interaction) as keyof typeof resolvers.guild]?.(
      interaction as never,
    ) || resolvers.guild.fallback(interaction)
  );
}

export function resolveChannel(interaction: AllInteractions): unknown {
  return (
    resolvers.channel[getTypeOfInteraction(interaction) as keyof typeof resolvers.channel]?.(
      interaction as never,
    ) || resolvers.channel.fallback(interaction)
  );
}

export function resolveCommandName(interaction: CommandInteraction | SimpleCommandMessage): string {
  return (
    resolvers.commandName[interaction.constructor.name as keyof typeof resolvers.commandName]?.(
      interaction as never,
    ) || resolvers.commandName.fallback(interaction)
  );
}

export function resolveAction(interaction: AllInteractions): string {
  return (
    resolvers.action[getTypeOfInteraction(interaction) as keyof typeof resolvers.action]?.(
      interaction as never,
    ) || resolvers.action.fallback(interaction)
  );
}

export function resolveLocale(interaction: AllInteractions): string {
  return (
    resolvers.locale[getTypeOfInteraction(interaction) as keyof typeof resolvers.locale]?.(
      interaction as never,
    ) || resolvers.locale.fallback(interaction)
  );
}

export function getTscordVersion(): string {
  return packageJson.tscord.version;
}
