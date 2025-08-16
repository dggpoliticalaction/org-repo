/* eslint-disable no-console */
import { ChannelType, ThreadAutoArchiveDuration, type Message } from "discord.js";
import { type Trigger } from "./trigger";
import { type EventData } from "../models/internal-models";

const channelName = "call-to-action";

export class CTAPostTrigger implements Trigger {
    requireGuild: boolean;
    public triggered(msg: Message): boolean {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const ctaChannel = msg.guild?.channels.cache.find(ctaChannel => ctaChannel?.name === channelName)
        // check cta channel exists
        if (ctaChannel !== undefined) {
            
            // check message came from cta channel
            if (msg.channelId === ctaChannel.id) {
                return true
            }
        }

        return false
    }

    public async execute(msg: Message, data: EventData): Promise<void> {

        /*
        TODO
            [X] Create Public Thread
            [ ] Async read reactions to message
                [ ] Get users and roles from reactions
            [ ] Create chart from reactions sorted by role
        */

        if (msg.channel.type === ChannelType.GuildText) {
            const thread = msg.startThread({
                name: 'CTA Thread',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Tracking CTA participation.'
            })
            console.log(`Created thread: ${(await thread).name}`)

            const collector = msg.createReactionCollector({time: 15_000});
            
            collector.on('collect', (reaction, user) => {
                console.log(`Collected ${reaction.emoji.name} from ${user.displayName}`)
            })
            
            collector.on('end', collected => {
                console.log(`Collected ${collected.size} items`)
            })
            console.log(`Data: ${data}`)
            return
        }

    }
}