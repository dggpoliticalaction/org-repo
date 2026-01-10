import { link } from '@/fields/link'
import type { ArrayField, Field } from 'payload'

type MenuType = Pick<ArrayField, 'name' | 'label' | 'labels'>

export const menu = ({ name, label, labels }: MenuType): Field => {
  return {
    name,
    type: 'array',
    label,
    labels,
    interfaceName: 'MenuBlock',
    fields: [link({ appearances: false })],
    admin: {
      components: {
        RowLabel: '@/blocks/Menu/RowLabel#RowLabel',
      },
    },
  }
}
