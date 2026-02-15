import { button } from '@/blocks/Button/config'
import type { NamedGroupField } from 'payload'

/** Legacy Action Button Field for existing Header button */
export const actionButton = (): NamedGroupField => {
  const buttonField = button({
    label: 'Action Button',
    admin: {
      condition: (_data, siblingData) => Boolean(siblingData?.enabled),
    },
  })
  // override the name to match the existing Action Button field
  buttonField.name = 'actionButton'
  buttonField.fields = [
    {
      name: 'enabled',
      label: 'Enable',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
    ...buttonField.fields,
  ]
  return buttonField
}
