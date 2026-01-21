import { type Request, type Response } from 'express'
import { type Client } from 'discord.js'

export abstract class Webhook {
  abstract name: string
  abstract log: boolean
  abstract endpoint: string
  abstract run(req: Request, res: Response, client: Client): Promise<void>
}
