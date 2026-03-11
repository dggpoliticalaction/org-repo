import type {
  CheckboxField,
  GroupField,
  NamedGroupField,
  RadioField,
  SingleRelationshipField,
  TextField,
  TextFieldSingleValidation,
} from 'payload'

interface LinkFields {
  label?: Partial<TextField>
  newTab?: Partial<CheckboxField>
  reference?: Partial<SingleRelationshipField>
  type?: Partial<RadioField>
  url?: Partial<TextField>
}

type LinkProps = Omit<NamedGroupField, 'fields' | 'name' | 'type' | 'interfaceName'> & {
  component?: LinkFields
}

/**
 * New Link Field with component overrides
 * @param component - The component overrides
 * @param props - The props for the base link field
 * @returns The link field
 */
export const link = ({ component = {}, ...props }: LinkProps = {}): GroupField => {
  const { type = {}, newTab = {}, reference = {}, url = {}, label = {} } = component
  return {
    label: 'Link',
    ...props,
    name: 'link',
    type: 'group',
    interfaceName: 'LinkField',
    fields: [
      {
        type: 'row',
        fields: [
          {
            label: 'Type',
            name: 'type',
            type: 'radio',
            defaultValue: type.defaultValue || 'reference',
            options: [
              {
                label: 'Internal link',
                value: 'reference',
              },
              {
                label: 'Custom URL',
                value: 'custom',
              },
            ],
            admin: {
              layout: 'horizontal',
              style: {
                flex: 1,
                ...type.admin?.style,
              },
              ...type.admin,
            },
          },
          {
            ...newTab,
            name: 'newTab',
            type: 'checkbox',
            label: 'Open in new tab',
            admin: {
              ...newTab.admin,
              style: {
                flex: 1,
                alignSelf: 'flex-end',
                ...newTab.admin?.style,
              },
            },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            label: reference.label || 'Document to link to',
            relationTo: ['pages', 'volumes', 'articles'],
            name: 'reference',
            type: 'relationship',
            required: true,
            admin: {
              condition: (_, siblingData) => siblingData?.type === 'reference',
            },
          },
          {
            label: url.label || 'Custom URL',
            name: 'url',
            type: 'text',
            required: true,
            hooks: { ...url.hooks },
            admin: {
              condition: (_, siblingData) => siblingData?.type === 'custom',
              ...url.admin,
            },
          },
          {
            label: label.label || 'Label',
            admin: {
              ...label.admin,
            },
            hooks: { ...label.hooks },
            hasMany: false,
            validate: label.validate as TextFieldSingleValidation,
            name: 'label',
            type: 'text',
            required: false,
          },
        ],
      },
    ],
  }
}
