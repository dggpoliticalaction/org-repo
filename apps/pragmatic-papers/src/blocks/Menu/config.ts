import { link } from '@/fields/link'
import deepMerge from '@/utilities/deepMerge'
import type { ArrayField, Field } from 'payload'

type MenuType = Pick<ArrayField, 'name' | 'label' | 'labels'> & { overrides?: Partial<Field> }

export const menu = ({ name, label, labels, overrides = {} }: MenuType): Field => {
  const result: Field = {
    name,
    type: 'array',
    label,
    labels,
    interfaceName: 'MenuBlock',
    fields: [link({ appearances: false })],
    admin: {
      initCollapsed: true,
      components: {
        RowLabel: '@/blocks/Menu/RowLabel#RowLabel',
      },
    },
  }

  return deepMerge(result, overrides)
}
