import { colorPicker } from '@/fields/colorPicker'
import { link } from '@/fields/link2'
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
  return {
    name: 'actionButton',
    interfaceName: 'ActionButtonField',
    type: 'group',
    required: false,
    fields: [
      {
        name: 'enabled',
        label: 'Enable',
        type: 'checkbox',
        defaultValue: false,
        required: true,
      },
      link({
        admin: {
          condition: (_data, siblingData) => Boolean(siblingData?.enabled),
        },
      }),
      {
        type: 'row',
        admin: {
          condition: (_data, siblingData) => Boolean(siblingData?.enabled),
        },
        fields: [
          /**
           * Background color picker for button.
           */
          colorPicker({ name: 'backgroundColor', label: 'Background Color' }),
          /**
           * Text color picker for button.
           */
          colorPicker({ name: 'textColor', label: 'Text Color' }),
          {
            type: 'select',
            name: 'variant',
            label: 'Variant',
            options: ['default', 'outline', 'ghost', 'link'],
            defaultValue: 'default',
          },
        ],
      },
    ],
  }
}
