import { ActivityType, type ShardingManager } from 'discord.js'
import { type Request, type Response, Router } from 'express'
import { createRequire } from 'node:module'

import { type Controller } from './index.js'
import { type CustomClient } from '../extensions/index.js'
import { mapClass } from '../middleware/index.js'
import {
  type GetShardsResponse,
  SetShardPresencesRequest,
  type ShardInfo,
  type ShardStats,
} from '../models/cluster-api/index.js'
import { Logger } from '../services/index.js'

const require = createRequire(import.meta.url)
const Config = require('../../config/config.json')
const Logs = require('../../lang/logs.json')

export class ShardsController implements Controller {
  public path = '/shards'
  public router: Router = Router()
  public authToken: string = Config.api.secret

  constructor(private shardManager: ShardingManager) {}

  public register(): void {
    this.router.get('/', (req, res) => this.getShards(req, res))
    this.router.put('/presence', mapClass(SetShardPresencesRequest), (req, res) =>
      this.setShardPresences(req, res),
    )
  }

  private async getShards(req: Request, res: Response): Promise<void> {
    const shardDatas = await Promise.all(
      this.shardManager.shards.map(async (shard) => {
        const shardInfo: ShardInfo = {
          id: shard.id,
          ready: shard.ready,
          error: false,
        }

        try {
          const uptime = (await shard.fetchClientValue('uptime')) as number
          shardInfo.uptimeSecs = Math.floor(uptime / 1000)
        } catch (error) {
          Logger.error(Logs.error.managerShardInfo, error)
          shardInfo.error = true
        }

        return shardInfo
      }),
    )

    const stats: ShardStats = {
      shardCount: this.shardManager.shards.size,
      uptimeSecs: Math.floor(process.uptime()),
    }

    const resBody: GetShardsResponse = {
      shards: shardDatas,
      stats,
    }
    res.status(200).json(resBody)
  }

  private async setShardPresences(req: Request, res: Response): Promise<void> {
    const reqBody: SetShardPresencesRequest = res.locals.input

    await this.shardManager.broadcastEval(
      (client, context) => {
        const customClient = client as CustomClient
        return customClient.setPresence(context.type, context.name, context.url)
      },
      { context: { type: ActivityType[reqBody.type], name: reqBody.name, url: reqBody.url } },
    )

    res.sendStatus(200)
  }
}
