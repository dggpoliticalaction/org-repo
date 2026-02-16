'use client'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Footer } from '@/payload-types'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<NonNullable<Footer['navItems']>[number]>()

  let label = 'Row'
  if (data?.link?.label) {
    label = `Nav item`
    if (rowNumber !== undefined) {
      label += ` ${rowNumber + 1}`
    }
    label += `: ${data.link.label}`
  }

  return <div>{label}</div>
}
