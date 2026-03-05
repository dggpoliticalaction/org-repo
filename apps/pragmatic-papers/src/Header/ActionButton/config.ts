import { button } from '@/fields/button'
import type { NamedGroupField } from 'payload'

/**
 * Returns a configured Action Button group field for the Header.
 *
 * This field group allows toggling an "action button" (e.g. for prominent CTAs)
 * in the header via the "enabled" checkbox.
 *
 * - The `enabled` checkbox controls whether the button appears.
 * - Button fields are reused from the shared `button` block config, ensuring
 *   consistent data structure (URL, color, variant, etc).
 * - The `admin.condition` ensures the sub-fields are only shown if enabled.
 *
 * @returns {NamedGroupField} A Payload CMS group field definition for an action button.
 */
export const actionButton = (): NamedGroupField => {
  const buttonField = button({
    label: 'Action Button',
  })

  // override the name to match the existing Action Button field implementation
  return {
    ...buttonField,
    name: 'actionButton',
    interfaceName: 'ActionButtonField',
    required: false,
    fields: [
      ...buttonField.fields,
      {
        name: 'enabled',
        label: 'Enable',
        type: 'checkbox',
        defaultValue: false,
        required: true,
      },
    ],
  }
}
