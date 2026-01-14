import type { Block } from 'payload'

export const OffCanvas: Block = {
  slug: 'offCanvas',
  interfaceName: 'OffCanvasBlock',
  labels: {
    plural: 'Off Canvases',
    singular: 'Off Canvas',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
  ],
}
