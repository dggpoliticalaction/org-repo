import type { TextField } from 'payload'

import deepMerge from '@/utilities/deepMerge'

type ColorPicker = (options?: { overrides?: Partial<TextField> }) => TextField

export const colorPicker: ColorPicker = ({ overrides = {} } = {}) => {
  const colorField: TextField = {
    name: 'color',
    type: 'text',
    label: 'Color',
    admin: {
      description: 'Select a color using the color picker or enter a HEX code (e.g., #FF5733)',
      components: {
        Field: {
          path: '@/fields/colorPicker/ColorPickerComponent#ColorPickerComponent',
        },
      },
    },
    validate: (value) => {
      if (!value) return true // Allow empty values if not required

      // Validate HEX color format
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      if (hexColorRegex.test(value)) {
        return true
      }

      return 'Please enter a valid HEX color code (e.g., #FF5733 or #F53)'
    },
  }

  return deepMerge(colorField, overrides)
}
