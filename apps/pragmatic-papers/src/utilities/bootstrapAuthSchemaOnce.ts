import { ensureBetterAuthTables } from '@/utilities/ensureBetterAuthTables'
import { getPayloadClient } from '@/utilities/getPayloadClient'

let boot: Promise<void> | null = null

export async function bootstrapAuthSchemaOnce(): Promise<void> {
  if (!boot) {
    boot = (async () => {
      await getPayloadClient()
      await ensureBetterAuthTables()
    })()
  }
  return boot
}
