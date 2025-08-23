/* eslint-disable no-console */
import { ChannelType, Client, ThreadAutoArchiveDuration, User, type Message } from "discord.js";
import { type Trigger } from "./trigger";
import { type EventData } from "../models/internal-models";
import { BarController, BarElement, CategoryScale, Chart, LinearScale, plugins } from "chart.js";
import { Canvas } from "canvas";
import { writeFile } from "node:fs";

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

            collector.on('collect', (reaction, user) => {
                let reactionEmojiName = reaction.emoji?.name ?? '';
                
                if (!userReactions[reactionEmojiName]) {
                    userReactions[reactionEmojiName] = [];
                }
                console.log(`${reactionEmojiName} from ${user.displayName}`);
                userReactions[reactionEmojiName]?.push(user.id);
            });

            collector.on('end', collected => {
                console.log(`Collected ${collected.size} reactions. Thank you for participating.`);
                const thread = msg.startThread({
                    name: 'CTA Thread',
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                    reason: 'Tracking CTA participation.'
                });

                // const reactionSummary = Object.entries(userReactions).map(([emoji, users]) => `${emoji}: ${users.length} users`).join('\n');
                
                Chart.register(
                    CategoryScale,
                    BarController,
                    BarElement,
                    LinearScale,
                );

                const canvas = new Canvas(800, 600);
                const chart = new Chart(canvas, {
                    type: "bar",
                    data: {
                        labels: Object.keys(userReactions),
                        datasets: [{
                            label: "Reactions",
                            data: Object.values(userReactions).map(users => users.length),
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        }]
                    }
                });

                const pngBuffer = canvas.toBuffer('image/png');
                const attachment = {
                    files: [{
                        attachment: pngBuffer,
                        name: 'reaction_summary.png'
                    }]
                };

                writeFile('./misc/tmp/reaction_summary.png', pngBuffer, (err) => {
                    if (err) throw err;
                    console.log('Chart saved');
                });
                
               // (async () => {
                //     const threadChannel = await thread;
                //     await threadChannel.send(`Reaction Summary:\n${
                //         attachment.files[0]?.attachment
                //     }`);
                // })();
            });
            
            console.log(`Data: ${data}`)
            return
        }

    }
}