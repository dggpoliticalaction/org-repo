"use client"
import React, { useEffect, useMemo, useRef } from "react"
import type { ArrayFieldClientProps } from "payload"
import { ArrayField, useFormFields, useForm } from "@payloadcms/ui"

type SlotCountMap = Record<string, number>

type SlotsFieldProps = ArrayFieldClientProps & {
  /** Map of layout key → required slot count, passed via clientProps */
  slotCounts: SlotCountMap
  /** The sibling field name for the layout select (default: "layout") */
  layoutFieldName?: string
}

/**
 * Custom array field component for ArticleGrid slots.
 *
 * Watches the sibling `layout` select field and automatically adjusts
 * the number of array rows to match the selected layout's slot count.
 * Also locks maxRows/minRows so the "Add Slot" button is hidden and
 * rows cannot be removed below the required count.
 */
export const SlotsField: React.FC<SlotsFieldProps> = (props) => {
  const { slotCounts, layoutFieldName = "layout", path, schemaPath, field } = props

  // Derive the full path to the layout field (sibling of this array field)
  const basePath = path?.includes(".") ? path.substring(0, path.lastIndexOf(".")) : ""
  const layoutPath = basePath ? `${basePath}.${layoutFieldName}` : layoutFieldName

  const { addFieldRow, removeFieldRow } = useForm()

  const layoutValue = useFormFields(([fields]) => {
    return fields[layoutPath]?.value as string | undefined
  })

  const targetCount = (layoutValue && slotCounts[layoutValue]) || 0

  // Override the field config to lock min/max rows to the target count
  const lockedField = useMemo(
    () => ({
      ...field,
      minRows: targetCount,
      maxRows: targetCount,
    }),
    [field, targetCount],
  )

  // Get current row count from form state
  const rowCount = useFormFields(([fields]) => {
    const prefix = path || "slots"
    const rowsField = fields[prefix]
    if (rowsField && "rows" in rowsField && Array.isArray(rowsField.rows)) {
      return rowsField.rows.length
    }
    return 0
  })

  // Track previous layout to only react to *changes*, not initial render
  const prevLayoutRef = useRef<string | undefined>(undefined)
  const isInitialRender = useRef(true)

  useEffect(() => {
    if (!layoutValue || !slotCounts[layoutValue]) return

    if (isInitialRender.current) {
      isInitialRender.current = false
      prevLayoutRef.current = layoutValue
      return
    }

    if (layoutValue === prevLayoutRef.current) return
    prevLayoutRef.current = layoutValue

    const targetCount = slotCounts[layoutValue]!
    const fieldPath = path || "slots"
    const fieldSchemaPath = schemaPath || fieldPath

    if (rowCount < targetCount) {
      for (let i = rowCount; i < targetCount; i++) {
        addFieldRow({ path: fieldPath, rowIndex: i, schemaPath: fieldSchemaPath })
      }
    } else if (rowCount > targetCount) {
      for (let i = rowCount - 1; i >= targetCount; i--) {
        removeFieldRow({ path: fieldPath, rowIndex: i })
      }
    }
  }, [layoutValue, slotCounts, rowCount, path, schemaPath, addFieldRow, removeFieldRow])

  return <ArrayField {...props} field={lockedField} />
}
