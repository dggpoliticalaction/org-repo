import { ensureBetterAuthTables } from '@/utilities/ensureBetterAuthTables'
import { getPayloadClient } from '@/utilities/getPayloadClient'

let boot: Promise<void> | null = null
export async function bootstrapAuthSchemaOnce(): Promise<void> {
  if (!boot) {
    boot = (async () => {
      /* eslint-disable no-console */
      console.log(' ○ Bootstrapping Schemas')
      console.log(' ○ Ensuring Payload Schema exists...')
      await getPayloadClient()
      console.log(' \x1b[32m✓\x1b[0m Payload Schema loaded')
      console.log(' ○ Ensuring Better Auth Schema exists...')
      await ensureBetterAuthTables()
      console.log(' \x1b[32m✓\x1b[0m Better Auth Tables loaded')
    })()
  }
  return boot
}
