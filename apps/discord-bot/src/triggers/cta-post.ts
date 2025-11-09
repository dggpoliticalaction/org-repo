import { ChannelType, type PublicThreadChannel, ThreadAutoArchiveDuration, MessageFlags, AttachmentBuilder, type Message, type GuildBasedChannel } from "discord.js";
import { type Trigger } from "./trigger";
import { BarController, Colors, BarElement, CategoryScale, Chart, LinearScale, PieController, ArcElement, Legend, Title } from "chart.js";
import { Canvas } from "canvas";
import { Logger } from "../services/index.js";

const channelName = "call-to-action";
const regionRoles = [
  'Midwest Squad',
  'South Squad',
  'Northeast Squad',
  'West Coast Squad'
]
const finishedEmoji = '✅'
const oneHour = 3_600_000
const activeCollectors = new Map();
let chanThreadsByMsg = new Map();

export class CTAPostTrigger implements Trigger {
  requireGuild: boolean;
  chanThreadsByMsg = new Map();

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
    Logger.info(`execute() [START]: ${msg.id}`)
    if (msg === undefined) {
      return
    }

    if (msg.channel.type != ChannelType.GuildText) {
      return
    }

    // check if message already has a thread
    if (chanThreadsByMsg.has(msg.id)) {
      Logger.info("message with thread...");

      const foundThread = chanThreadsByMsg.get(msg.id);

      if (foundThread.archived) {
        foundThread.setArchived(false, "Updating chart...");
      }
      // update the chart in the thread
      await this.updateChart(msg, foundThread)
      return
    }

    // create thread and start collector
    const thread = await this.createCTAThread(msg)
    if (thread) {
      await this.startCTAReactionCollector(msg, thread)
    }
  }

  private async getFinishedReactions(msg: Message): Promise<object> {
    Logger.info(`getFinishedReactions() [START]: ${msg.id}`)

    const finishedReactions = msg.reactions.cache.filter(reaction => finishedEmoji === reaction.emoji.name);
    const roleReactions: { [region: string]: string[] } = {};

    for (const reaction of finishedReactions.values()) {
      const users = await reaction.users.fetch();

      for (const user of users.values()) {
        if (user.id === msg.client.user.id) {
          continue;
        }
        const member = await msg.guild?.members.fetch(user.id);
        const memberRoles = member?.roles.cache;
        const role = memberRoles?.filter(r => regionRoles.includes(r.name));
        const memberRegionRole = role?.first()?.name;

        if (memberRegionRole === undefined) {
          continue;
        }

        if (!roleReactions[memberRegionRole]) {
          roleReactions[memberRegionRole] = [];
        }
        if (!roleReactions[memberRegionRole]?.includes(user.id)) {
          roleReactions[memberRegionRole]?.push(user.id);
          Logger.info(`Adding ${role?.first()?.name} member, ${user.displayName}`);
        }
      }
    }
    return roleReactions;
  }

  public async getChannelThreads(chan: GuildBasedChannel | undefined): Promise<void> {
    Logger.info(`chanThreadsByMsg BEFORE: ${chanThreadsByMsg.size}`);
    if (chan === undefined) {
      return
    }

    if (chan.type != ChannelType.GuildText) {
      return
    }

    const activeThreads = await chan.threads.fetch();
    const archivedThreads = await chan.threads.fetchArchived({ fetchAll: true });

    chanThreadsByMsg = new Map([...activeThreads.threads.entries(), ...archivedThreads.threads.entries()]);
    Logger.info(`chanThreadsByMsg AFTER: ${chanThreadsByMsg.size}`);
  }

  private async activeCTAThread(msg: Message): Promise<PublicThreadChannel | undefined> {
    Logger.info(`activeCTAThread() [START]: ${msg.id}`)
    if (msg.hasThread && msg.thread?.type === ChannelType.PublicThread && !msg.thread?.archived) {
      return msg.thread;
    }
  }

  private async createCTAThread(msg: Message): Promise<PublicThreadChannel | undefined> {
    Logger.info(`createCTAThread() [START]: ${msg.id}`)

    if (msg.channel.type != ChannelType.GuildText) {
      Logger.warn(`createCTAThread(): message type ${msg.channel.type} is not GuildText.`)
      return undefined
    }

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

  // start a reaction collector on the given message
  private async startCTAReactionCollector(msg: Message, thread: PublicThreadChannel): Promise<void> {
    Logger.info(`startCTAReactionCollector() [START] ${msg.id}`)

    const filter = (reaction, user) => reaction.emoji.name === finishedEmoji && user.id != msg.client.user.id
    const collector = msg.createReactionCollector({ filter, time: oneHour });
    activeCollectors.set(msg.id, collector);

    const roleReactions = await this.getFinishedReactions(msg);

    collector.on('collect', async (reaction, user) => {
      const member = msg.guild?.members.fetch(user.id)

      if (member === undefined) return

      Logger.info(`Got ${reaction.emoji.name} from ${(await member).displayName}`)

      const memberRoles = (await member).roles.cache;
      const role = memberRoles.filter(r => regionRoles.includes(r.name));
      const memberRegionRole = role.first()?.name;

      if (memberRegionRole != undefined) {
        if (!roleReactions[memberRegionRole]) {
          roleReactions[memberRegionRole] = [];
        }
        if (!roleReactions[memberRegionRole]?.includes(user.id)) {
          roleReactions[memberRegionRole]?.push(user.id);
          Logger.info(`Adding ${role.first()?.name} member, ${user.displayName}`);
        }
      }

      this.sendChartToThread(thread, roleReactions);
    });

    collector.on('end', collected => {
      Logger.info(`Collected ${collected.size} reactions.`);
      activeCollectors.delete(msg.id)
      this.sendChartToThread(thread, roleReactions);
      this.startCTAReactionCollector(msg, thread)
    });
  }

  private async deleteLastChart(tc: PublicThreadChannel): Promise<void> {
    const threadMessages = await tc.messages.fetch({ limit: 100 });
    const botId = tc.client.user.id
    const botMsgs = threadMessages.filter(msg => msg.author.id === botId);

    botMsgs.forEach(msg => {
      if (msg.attachments.size === 0) {
        return
      }
      msg.delete();
    })
  }

  private async sendChartToThread(thread: PublicThreadChannel, roleReactions: object): Promise<void> {
    const pngStream = this.createChart(roleReactions).createPNGStream();
    const attachmentBuilder = new AttachmentBuilder(pngStream);

    const threadChannel = thread;
    if (!threadChannel.archived) {
      await this.deleteLastChart(threadChannel);
      await threadChannel.send({
        files: [attachmentBuilder.attachment],
        flags: [MessageFlags.SuppressNotifications]
      });
    }
  }

  private async updateChart(msg: Message<boolean>, thread: PublicThreadChannel<boolean>): Promise<void> {
    await this.sendChartToThread(thread, (await this.getFinishedReactions(msg)));
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
      beforeDraw: (chart, options) => {
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
