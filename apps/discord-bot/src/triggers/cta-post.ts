/* eslint-disable no-console */
import { ChannelType, type PublicThreadChannel, ThreadAutoArchiveDuration, type Message, MessageFlags } from "discord.js";
import { type Trigger } from "./trigger";
import { BarController, Colors, BarElement, CategoryScale, Chart, LinearScale, PieController, ArcElement, Legend, Title } from "chart.js";
import { Canvas } from "canvas";
import { writeFile } from "node:fs";

const channelName = "call-to-action";
const regionRoles = [
  'Midwest Squad',
  'South Squad',
  'Northeast Squad',
  'West Coast Squad'
]
const finishedEmoji = '✅'
const oneHour = 3_600_000
const d = new Date();

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

  public async execute(msg: Message): Promise<void> {

    if (msg === undefined) {
      return
    }

    if (msg.channel.type === ChannelType.GuildText) {

      // check if message created in last 2 weeks
      if (msg.createdTimestamp >= d.getDate() - 14) {

        // check if message already has a thread
        if (msg.hasThread) {

          // is it active?
          const thread = await this.activeCTAThread(msg)
          if (thread != undefined) {

            // update the chart in the thread
            this.updateChart(msg, thread)
          }

          return
        }

        // create thread and start collector
        const thread = await this.createCTAThread(msg)
        if (thread) {
          this.startCTAReactionCollector(msg, thread)
        }
      }
    }
  }

  private async getFinishedReactions(msg: Message): Promise<object> {
    const finishedReactions = msg.reactions.cache.filter(reaction => finishedEmoji === reaction.emoji.name);
    const roleReactions: { [region: string]: string[] } = {};

    finishedReactions.forEach(async (reaction) => {
      const users = await reaction.users.fetch();
      users.forEach(async (user) => {
        if (user.id === msg.client.user.id) {
          return;
        }
        const member = msg.guild?.members.fetch(user.id);
        const memberRoles = (await member)?.roles.cache;
        const role = memberRoles?.filter(r => regionRoles.includes(r.name));
        const memberRegionRole = role?.first()?.name;

        if (memberRegionRole != undefined) {
          if (!roleReactions[memberRegionRole]) {
            roleReactions[memberRegionRole] = [];
          }
          if (!roleReactions[memberRegionRole]?.includes(user.id)) {
            roleReactions[memberRegionRole]?.push(user.id);
            console.log(`Adding ${role?.first()?.name} member, ${user.displayName}`);
          }
        }
      });
    });
    return roleReactions;
  }

  private async activeCTAThread(msg: Message): Promise<PublicThreadChannel | undefined> {
    if (msg.hasThread && msg.thread?.type === ChannelType.PublicThread && !msg.thread?.archived) {
      return msg.thread;
    }
  }

  private async createCTAThread(msg: Message): Promise<PublicThreadChannel | undefined> {

    if (msg.channel.type === ChannelType.GuildText) {
      const thread = msg.startThread({
        // set as the title of the message

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

  // start a reaction collector on the given message
  private async startCTAReactionCollector(msg: Message, thread: PublicThreadChannel): Promise<void> {
    const filter = (reaction, user) => reaction.emoji.name === finishedEmoji && user.id != msg.client.user.id
    const collector = msg.createReactionCollector({ filter, time: oneHour });
    const roleReactions = await this.getFinishedReactions(msg)

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

        this.sendChartToThread(msg, thread, roleReactions);
      }
    });

    collector.on('end', collected => {
      console.log(`Collected ${collected.size} reactions.`);
      this.sendChartToThread(msg, thread, roleReactions);
    });
  }

  private async deleteLastChart(tc: PublicThreadChannel): Promise<void> {
    const threadMessages = await tc.messages.fetch({ limit: 1 });
    const latest = threadMessages.first();
    if (latest && latest.attachments.size > 0) {
      await latest.delete();
    }
  }

  private async sendChartToThread(msg: Message, thread: PublicThreadChannel, roleReactions: object): Promise<void> {
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
  }

  private async updateChart(msg: Message<boolean>, thread: PublicThreadChannel<boolean>) {
    const roleReactions = await this.getFinishedReactions(msg);
    this.sendChartToThread(msg, thread, roleReactions);
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
}
