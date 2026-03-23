"use client"
import React, { useCallback, useState } from "react"
import type { TextFieldClientProps } from "payload"
import { Button, FieldLabel, TextInput, useDocumentInfo, useField } from "@payloadcms/ui"

export const BlurDataURLField: React.FC<TextFieldClientProps> = ({ field, path }) => {
  const { label } = field
  const fieldPath = path || field.name
  const { value, setValue } = useField<string>({ path: fieldPath })
  const { id } = useDocumentInfo()
  const [isLoading, setIsLoading] = useState(false)

  const handleRegenerate = useCallback(async () => {
    if (!id || isLoading) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/media/${id}/regenerate-blur`, { method: "POST" })
      if (response.ok) {
        const { blurDataURL } = (await response.json()) as { blurDataURL: string }
        setValue(blurDataURL)
      }
    } finally {
      setIsLoading(false)
    }
  }, [id, isLoading, setValue])

  return (
    <div>
      <FieldLabel htmlFor={`field-${fieldPath}`} label={label} />
      <div style={{ alignItems: "center", display: "flex", gap: "var(--spacing-xs)" }}>
        <div style={{ flex: 1 }}>
          <TextInput onChange={setValue} path={fieldPath} readOnly value={value ?? ""} />
        </div>
        <Button
          buttonStyle="secondary"
          disabled={!id || isLoading}
          onClick={handleRegenerate}
          size="small"
        >
          {isLoading ? "Regenerating..." : "Regenerate"}
        </Button>
      </div>
    </div>
  )
}
