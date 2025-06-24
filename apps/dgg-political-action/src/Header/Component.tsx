import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()

  return <HeaderClient data={headerData} />
}
