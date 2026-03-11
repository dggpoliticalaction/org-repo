import { adminFieldLevel } from '@/access/admins'
import type { GlobalConfig } from 'payload'

import { menu } from '@/fields/menu'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: adminFieldLevel,
  },
  fields: [
    menu({
      name: 'navItems',
      label: 'Navigation Items',
      maxRows: 6,
      labels: { singular: 'Menu Item', plural: 'Menu Items' },
    }),
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
