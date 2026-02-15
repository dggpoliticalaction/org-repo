import { colorPicker } from "@/fields/colorPicker"
import { link } from "@/fields/link2"
import type { NamedGroupField } from "payload"

type ButtonProps = Omit<NamedGroupField, 'fields' | 'name' | 'type' | 'interfaceName'>

export const button = (props?: ButtonProps): NamedGroupField => {
  return {
    label: 'Button',
    ...props,
    name: 'button',
    interfaceName: 'ButtonBlock',
    type: 'group',
    fields: [
      link(),
      {
        type: 'row',
        fields: [
          colorPicker({ overrides: { name: 'backgroundColor', label: 'Background Color' } }),
          colorPicker({ overrides: { name: 'textColor', label: 'Text Color' } }),
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