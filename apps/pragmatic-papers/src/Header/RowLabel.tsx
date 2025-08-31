'use client'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Header } from '@/payload-types'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Header['navItems']>[number]>()

  const label = data?.data?.link?.label
    ? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.link?.label}`
    : 'Row'

  return <div>{label}</div>
}
