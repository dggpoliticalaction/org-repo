import type { TextField, TextFieldSingleValidation } from 'payload'

type ColorPickerProps = Omit<TextField, 'type'>

const validateColorPicker: TextFieldSingleValidation = (value, options) => {
  if (!value && !options?.required) return true // Allow empty values if not required

  // Validate HEX color format
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (hexColorRegex.test(value || '')) {
    return true
  }

  return 'Please enter a valid HEX color code (e.g., #FF5733 or #F53)'
}

export const colorPicker = (props: ColorPickerProps): TextField => {
  return {
    ...props,
    type: 'text',
    admin: {
      description: 'Select a color using the color picker or enter a HEX code (e.g., #FF5733)',
      components: {
        Field: {
          path: '@/fields/colorPicker/ColorPickerComponent#ColorPickerComponent',
        },
        ...props.admin?.components,
      },
      ...props.admin,
    },
    hasMany: false,
    maxRows: undefined,
    minRows: undefined,
    validate: validateColorPicker,
  }
}
