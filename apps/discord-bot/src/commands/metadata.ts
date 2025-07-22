import {
  ApplicationCommandType,
  PermissionFlagsBits,
  PermissionsBitField,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js'

import { Args } from './index.js'
import { Language } from '../models/enum-helpers/index.js'
import { Lang } from '../services/index.js'

export const ChatCommandMetadata: {
  [command: string]: RESTPostAPIChatInputApplicationCommandsJSONBody
} = {
  DEV: {
    type: ApplicationCommandType.ChatInput,
    name: Lang.getRef('chatCommands.dev', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('chatCommands.dev'),
    description: Lang.getRef('commandDescs.dev', Language.Default),
    description_localizations: Lang.getRefLocalizationMap('commandDescs.dev'),
    dm_permission: true,
    default_member_permissions: PermissionsBitField.resolve([
      PermissionFlagsBits.Administrator,
    ]).toString(),
    options: [
      {
        ...Args.DEV_COMMAND,
        required: true,
      },
    ],
  },
  HELP: {
    type: ApplicationCommandType.ChatInput,
    name: Lang.getRef('chatCommands.help', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('chatCommands.help'),
    description: Lang.getRef('commandDescs.help', Language.Default),
    description_localizations: Lang.getRefLocalizationMap('commandDescs.help'),
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        ...Args.HELP_OPTION,
        required: true,
      },
    ],
  },
  INFO: {
    type: ApplicationCommandType.ChatInput,
    name: Lang.getRef('chatCommands.info', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('chatCommands.info'),
    description: Lang.getRef('commandDescs.info', Language.Default),
    description_localizations: Lang.getRefLocalizationMap('commandDescs.info'),
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        ...Args.INFO_OPTION,
        required: true,
      },
    ],
  },
  TEST: {
    type: ApplicationCommandType.ChatInput,
    name: Lang.getRef('chatCommands.test', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('chatCommands.test'),
    description: Lang.getRef('commandDescs.test', Language.Default),
    description_localizations: Lang.getRefLocalizationMap('commandDescs.test'),
    dm_permission: true,
    default_member_permissions: undefined,
  },
  RULES: {
    type: ApplicationCommandType.ChatInput,
    name: Lang.getRef('chatCommands.rules', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('chatCommands.rules'),
    description: Lang.getRef('commandDescs.rules', Language.Default),
    description_localizations: Lang.getRefLocalizationMap('commandDescs.rules'),
    default_member_permissions: undefined,
    options: [
      {
        ...Args.RULES_OPTIION,
        required: false,
      }
    ]
  }
}

export const MessageCommandMetadata: {
  [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody
} = {
  VIEW_DATE_SENT: {
    type: ApplicationCommandType.Message,
    name: Lang.getRef('messageCommands.viewDateSent', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('messageCommands.viewDateSent'),
    default_member_permissions: undefined,
    dm_permission: true,
  },
  LIST_REGION_COMPLETION: {
    type: ApplicationCommandType.Message,
    name: Lang.getRef('messageCommands.listRegionCompletion', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('messageCommands.listRegionCompletion'),
    default_member_permissions: undefined,
    dm_permission: false,
  },
}

export const UserCommandMetadata: {
  [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody
} = {
  VIEW_DATE_JOINED: {
    type: ApplicationCommandType.User,
    name: Lang.getRef('userCommands.viewDateJoined', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('userCommands.viewDateJoined'),
    default_member_permissions: undefined,
    dm_permission: true,
  },
}
