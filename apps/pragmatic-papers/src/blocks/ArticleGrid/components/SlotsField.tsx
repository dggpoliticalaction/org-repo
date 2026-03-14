"use client"
import { ArrayField, useForm, useFormFields } from "@payloadcms/ui"
import type { ArrayFieldClientProps } from "payload"
import React, { useEffect, useRef } from "react"

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

  const basePath = path?.includes(".") ? path.substring(0, path.lastIndexOf(".")) : ""
  const layoutPath = basePath ? `${basePath}.${layoutFieldName}` : layoutFieldName

  const { addFieldRow, removeFieldRow } = useForm()

  const layoutValue = useFormFields(([fields]) => fields[layoutPath]?.value as string | undefined)

  const rowCount = useFormFields(([fields]) => {
    const rowsField = fields[path || "slots"]
    return rowsField && "rows" in rowsField && Array.isArray(rowsField.rows)
      ? rowsField.rows.length
      : 0
  })

  const prevLayoutRef = useRef(layoutValue)

  useEffect(() => {
    const requiredCount = (layoutValue && slotCounts[layoutValue]) || 0
    if (!requiredCount || layoutValue === prevLayoutRef.current) return
    prevLayoutRef.current = layoutValue

    const fieldPath = path || "slots"
    const fieldSchemaPath = schemaPath || fieldPath

    if (rowCount < requiredCount) {
      for (let i = rowCount; i < requiredCount; i++) {
        addFieldRow({ path: fieldPath, rowIndex: i, schemaPath: fieldSchemaPath })
      }
    } else if (rowCount > requiredCount) {
      for (let i = rowCount - 1; i >= requiredCount; i--) {
        removeFieldRow({ path: fieldPath, rowIndex: i })
      }
    }
  }, [layoutValue, slotCounts, rowCount, path, schemaPath, addFieldRow, removeFieldRow])

  const targetCount = (layoutValue && slotCounts[layoutValue]) || 0
  return <ArrayField {...props} field={{ ...field, minRows: targetCount, maxRows: targetCount }} />
}
