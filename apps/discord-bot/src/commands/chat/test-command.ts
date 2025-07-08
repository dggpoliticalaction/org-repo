import { type ChatInputCommandInteraction, type PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Language } from '../../models/enum-helpers/index.js';
import { type EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { type Command, CommandDeferType } from '../index.js';

export class TestCommand implements Command {
  public names = [Lang.getRef('chatCommands.test', Language.Default)];
  public cooldown = new RateLimiter(1, 5000);
  public deferType = CommandDeferType.HIDDEN;
  public requireClientPerms: PermissionsString[] = [];

  public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
    await InteractionUtils.send(intr, Lang.getEmbed('displayEmbeds.test', data.lang));
  }
}
