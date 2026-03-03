import { adminFieldLevel } from '@/access/admins'
import { menu } from '@/fields/menu'
import { revalidateHeader } from '@/Header/hooks/revalidateHeader'
import type { GlobalConfig } from 'payload'
import { actionButton } from './ActionButton/config'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: adminFieldLevel,
  },
  fields: [
    menu({
      name: 'navItems',
      label: 'Navigation Items',
      maxRows: 12,
      labels: { singular: 'Menu Item', plural: 'Menu Items' },
    }),
    actionButton(),
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
