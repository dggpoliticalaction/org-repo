/* eslint-disable no-console */
import { ChannelType, ThreadAutoArchiveDuration, type Message } from "discord.js";
import { type Trigger } from "./trigger";
import { type EventData } from "../models/internal-models";
import { BarController, Colors, BarElement, CategoryScale, Chart, LinearScale, PieController, ArcElement, Legend, Title } from "chart.js";
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
            [X] Create chart from reactions sorted by role
        */
        const regionRoles = [
            'Midwest-South Squad',
            'Northeast Squad',
            'West Coast Squad'
        ]

        const finishedEmoji = '✅'

        if (msg.channel.type === ChannelType.GuildText) {
            const roleReactions: { [reactId: string]: string[] } = {};
            const collector = msg.createReactionCollector({ time: 15_000 });

            collector.on('collect', async (reaction, user) => {
                const member = msg.guild?.members.fetch(user.id)
                if (member != undefined) {

                    console.log(`Got ${reaction.emoji.name} from ${(await member).displayName}`)

                    if (reaction.emoji.name === finishedEmoji.toString()) {

                        const memberRoles = (await member).roles.cache;
                        const role = memberRoles.filter(r => regionRoles.includes(r.name));
                        const memberRegionRole = role.first()?.name;

                        if (memberRegionRole != undefined) {
                            if (!roleReactions[memberRegionRole]) {
                                roleReactions[memberRegionRole] = [];
                            }
                            roleReactions[memberRegionRole]?.push(user.id);
                            console.log(`${role} member, ${user.displayName}`);
                        }

                        console.log(`${Object.entries(roleReactions)}`)
                    }
                }
            });

            collector.on('end', collected => {
                console.log(`Collected ${collected.size} reactions. Thank you for participating.`);
                const thread = msg.startThread({
                    name: 'CTA Thread',
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                    reason: 'Tracking CTA participation.'
                });

                const pngBuffer = this.createChart(roleReactions).toBuffer('image/png');

                writeFile('./misc/tmp/reaction_summary.png', pngBuffer, (err) => {
                    if (err) throw err;
                    console.log('Chart saved');
                });

                (async () => {
                    const threadChannel = await thread;
                    await threadChannel.send({ files: ["./misc/tmp/reaction_summary.png"] });
                })();
            });

            console.log(`Data: ${data}`)
            return
        }
    }

    private createChart(roleReactions: object): Canvas {

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
                labels: Object.keys(roleReactions),
                datasets: [{
                    label: "Squad CTA Completions by Region",
                    // roleReactions is a map of <string, string[]>
                    data: Object.values(roleReactions).map(role => role.length),
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
                        text: "Squad CTA Completions by Region",
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
}