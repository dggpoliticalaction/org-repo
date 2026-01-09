import type { GlobalConfig } from 'payload'

import { menu } from '../blocks/Menu/config'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    menu({
      name: 'primaryMenu',
      label: 'Primary Menu',
      labels: { singular: 'Menu Item', plural: 'Menu Items' },
    }),
    menu({
      name: 'secondaryMenu',
      label: 'Secondary Menu',
      labels: { singular: 'Menu Item', plural: 'Menu Items' },
    }),
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
