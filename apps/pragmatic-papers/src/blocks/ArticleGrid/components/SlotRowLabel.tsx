"use client"
import { useRowLabel, useFormFields } from "@payloadcms/ui"

type SlotDescriptionsMap = Record<string, string[]>

interface SlotRowLabelProps {
  /** Map of layout key → slot description array, passed via clientProps */
  slotDescriptions: SlotDescriptionsMap
  /** The field name for the layout select (default: "layout") */
  layoutFieldName?: string
}

/**
 * Custom row label for ArticleGrid slot rows.
 * Shows the slot description from the selected layout instead of "Slot 0", "Slot 1", etc.
 */
export const SlotRowLabel: React.FC<SlotRowLabelProps> = ({
  slotDescriptions,
  layoutFieldName = "layout",
}) => {
  const { rowNumber, path } = useRowLabel()

  // rowNumber is 0-indexed (passed as rowIndex from Payload's ArrayRow)
  const pathIndex = parseInt(path.substring(path.lastIndexOf(".") + 1), 10)
  const index = rowNumber ?? (isNaN(pathIndex) ? 0 : pathIndex)

  // Derive layout field path from the row path
  // e.g. path "slots.0" → slotsPath "slots" → basePath "" → layoutPath "layout"
  // e.g. path "layout.0.slots.2" → slotsPath "layout.0.slots" → basePath "layout.0" → layoutPath "layout.0.layout"
  const slotsPath = path.substring(0, path.lastIndexOf("."))
  const basePath = slotsPath.includes(".")
    ? slotsPath.substring(0, slotsPath.lastIndexOf("."))
    : ""
  const layoutPath = basePath ? `${basePath}.${layoutFieldName}` : layoutFieldName

  const layoutValue = useFormFields(([fields]) => {
    return fields[layoutPath]?.value as string | undefined
  })

  const descriptions = layoutValue ? slotDescriptions[layoutValue] : undefined
  const description = descriptions?.[index]

  return <>{description || `Slot ${index + 1}`}</>
}
