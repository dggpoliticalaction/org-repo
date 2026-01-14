import { ensureBetterAuthTables } from '@/utilities/ensureBetterAuthTables'
import config from '@payload-config'
import { getPayload } from 'payload'

let boot: Promise<void> | null = null
export async function bootstrapAuthSchemaOnce(): Promise<void> {
  if (!boot) {
    boot = (async () => {
      await getPayload({ config })
      await ensureBetterAuthTables()
    })()
  }
  return boot
}
