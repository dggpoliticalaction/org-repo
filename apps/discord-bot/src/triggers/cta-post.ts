/* eslint-disable no-console */
import { ChannelType, type PublicThreadChannel, ThreadAutoArchiveDuration, type Message, MessageFlags } from "discord.js";
import { type Trigger } from "./trigger";
import { type EventData } from "../models/internal-models";
import { BarController, Colors, BarElement, CategoryScale, Chart, LinearScale, PieController, ArcElement, Legend, Title } from "chart.js";
import { Canvas } from "canvas";
import { writeFile } from "node:fs";

const channelName = "call-to-action";
const regionRoles = [
    'Midwest-South Squad',
    'Northeast Squad',
    'West Coast Squad'
]
const finishedEmoji = '✅'
const roleReactions: { [reactId: string]: string[] } = {};
const oneHour = 3_600_000

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
        if (msg.channel.type === ChannelType.GuildText) {
            const thread = await this.createCTAThread(msg)
            if (thread) {
                this.startCTAReactionCollector(msg, thread)
            }

            console.log(`Data: ${data}`)
            return
        }
    }

    private async createCTAThread(msg: Message): Promise<PublicThreadChannel | undefined> {

        if (msg.channel.type === ChannelType.GuildText) {
            const thread = msg.startThread({
                name: 'CTA Completion by Region',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                reason: 'Tracking CTA participation.',
            });

            const threadChannel = await thread;
            threadChannel.send({
                content: `Mark your completion of the CTA by reacting with ${finishedEmoji}.\n\n A chart will be posted in an hour, and updated every hour until the thread is archived, showing the number of completions per region.`,
                flags: [MessageFlags.SuppressNotifications]
            });
            msg.react(finishedEmoji)

            return thread
        }

        return undefined
    }

    private createChart(rr: object): Canvas {

        Chart.register(
            CategoryScale,
            PieController,
            ArcElement,
            BarController,
            BarElement,
            LinearScale,
            Legend,
            Title,
            Colors
        );

        const canvas = new Canvas(800, 600);

        Chart.defaults.color = 'rgb(255,255,255)';
        // Chart.defaults.borderColor = 'rgb(255,255,255)';

        const plugin = {
            id: 'customCanvasBackgroundColor',
            beforeDraw: (chart, args, options) => {
                const { ctx } = chart;
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = options.color || 'rgb(0, 0, 0)';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        };

        const _ = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: Object.keys(rr),
                datasets: [{
                    label: "CTA Completions by Region",
                    // rr is a map of <string, string[]>
                    data: Object.values(rr).map(role => role.length),
                    backgroundColor: [
                        'rgb(228, 27, 50)',
                        'rgb(255, 255, 255)',
                        'rgb(23, 25, 77)',
                    ],
                    borderColor: [
                        'rgb(0,0,0)',
                        'rgb(0,0,0)',
                        'rgb(0,0,0)',
                    ]
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            font: {
                                size: 20
                            },
                            boxWidth: 20,
                            usePointStyle: false
                        },
                    },
                    title: {
                        display: true,
                        text: "CTA Completions by Region",
                        font: {
                            size: 24,
                        }
                    }
                }
            },
            plugins: [plugin]
        });

        return canvas
    }

    // start a reaction collector on the given message
    private async startCTAReactionCollector(msg: Message, thread: PublicThreadChannel): Promise<void> {
        const filter = (reaction, user) => reaction.emoji.name === finishedEmoji && user.id != msg.client.user.id
        const collector = msg.createReactionCollector({ filter, time: oneHour });

        collector.on('collect', async (reaction, user) => {
            const member = msg.guild?.members.fetch(user.id)
            if (member != undefined) {

                console.log(`Got ${reaction.emoji.name} from ${(await member).displayName}`)

                const memberRoles = (await member).roles.cache;
                const role = memberRoles.filter(r => regionRoles.includes(r.name));
                const memberRegionRole = role.first()?.name;

                if (memberRegionRole != undefined) {
                    if (!roleReactions[memberRegionRole]) {
                        roleReactions[memberRegionRole] = [];
                    }
                    if (!roleReactions[memberRegionRole]?.includes(user.id)) {
                        roleReactions[memberRegionRole]?.push(user.id);
                        console.log(`Adding ${role.first()?.name} member, ${user.displayName}`);
                    }
                }

                console.log(`${Object.entries(roleReactions)}`)
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} reactions.`);

            const pngBuffer = this.createChart(roleReactions).toBuffer('image/png');

            writeFile('./misc/tmp/reaction_summary.png', pngBuffer, (err) => {
                if (err) throw err;
            });

            (async () => {
                const threadChannel = await thread;
                if (!threadChannel.archived) {
                    await this.deleteLastChart(threadChannel);
                    await threadChannel.send({
                        files: ["./misc/tmp/reaction_summary.png"],
                        flags: [MessageFlags.SuppressNotifications]
                    });
                    this.startCTAReactionCollector(msg, thread);
                }
            })();
        });
    }

    private async deleteLastChart(tc: PublicThreadChannel): Promise<void> {
        const threadMessages = await tc.messages.fetch({ limit: 1 });
        const latest = threadMessages.first();
        if (latest && latest.attachments.size > 0) {
            await latest.delete();
        }
    }
}