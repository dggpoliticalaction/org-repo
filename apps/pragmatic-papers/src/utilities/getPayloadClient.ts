import config from '@/payload.config'
import type { Payload } from 'payload'
import { getPayload } from 'payload'

let cached: Payload | null = null

// TODO WE SHOULD PROBABLY REPLACE ALL INSTANCES OF getPayload({ config }) WITH getPayloadClient()
export async function getPayloadClient(): Promise<Payload> {
  if (!cached) {
    cached = await getPayload({ config })
  }
  return cached
}
