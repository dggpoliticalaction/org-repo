/* eslint-disable no-console */
import { ChannelType, Client, ThreadAutoArchiveDuration, User, type Message } from "discord.js";
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
            [X] Async read reactions to message
                [X] Get users and roles from reactions
            [ ] Create chart from reactions sorted by role
        */

        if (msg.channel.type === ChannelType.GuildText) {
            const userReactions: {[reactId: string]: string[]} = {};
            const collector = msg.createReactionCollector({time: 15_000});
            const thread = msg.startThread({
                name: 'CTA Thread',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Tracking CTA participation.'
            })
            
            console.log(`Created thread: ${(await thread).name}`)
           
            collector.on('end', collected => {
                console.log(`Collected ${collected.size} reactions. Thank you for participating.`);
            });
            
            collector.on('collect', (reaction, user) => {
                let reactionEmojiName = reaction.emoji?.name ?? '';
                
                if (!userReactions[reactionEmojiName]) {
                    userReactions[reactionEmojiName] = [];
                }
                console.log(`${reactionEmojiName} from ${user.displayName}`);
                userReactions[reactionEmojiName]?.push(user.id);
            });

            console.log(`Reactions: ${userReactions}`)
            console.log(`Data: ${data}`)
            return
        }

    }
}