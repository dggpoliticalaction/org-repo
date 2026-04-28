"use client"

import { Button, useDocumentInfo, useFormFields } from "@payloadcms/ui"
import React, { useState } from "react"

export const GenerateNarrationButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dispatch = useFormFields(([, d]) => d)
  const narrationValue = useFormFields(([fields]) => fields.narration?.value)

  if (narrationValue) return null

  const handleGenerate = async () => {
    if (!id || isLoading) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/articles/${id}/generate-narration`, { method: "POST" })
      const json = (await res.json()) as { narrationId?: number; error?: string }

      if (!res.ok) {
        setError(json.error ?? "Generation failed")
        return
      }

      dispatch({ type: "UPDATE", path: "narration", value: json.narrationId })
    } catch {
      setError("Request failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <Button
        buttonStyle="secondary"
        disabled={!id || isLoading}
        onClick={handleGenerate}
        size="small"
      >
        {isLoading ? "Generating…" : "Generate with AI"}
      </Button>
      {error && (
        <p style={{ color: "var(--theme-error-500)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
          {error}
        </p>
      )}
    </div>
  )
}
