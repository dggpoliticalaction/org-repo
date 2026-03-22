"use client"

import type { FootnotesField } from "@/payload-types"
import { useDocumentInfo, useField } from "@payloadcms/ui"
import React, { useState } from "react"

export const InsertExistingFootnote: React.FC = () => {
  const { data } = useDocumentInfo()
  const [selected, setSelected] = useState("")

  const { setValue: setNote } = useField<string>({ path: "note" })
  const { setValue: setAttributionEnabled } = useField<boolean>({ path: "attributionEnabled" })
  const { setValue: setLinkType } = useField<string>({ path: "link.type" })
  const { setValue: setLinkUrl } = useField<string>({ path: "link.url" })
  const { setValue: setLinkNewTab } = useField<boolean>({ path: "link.newTab" })

  const footnotes = (data?.footnotes as NonNullable<FootnotesField>) ?? []

  const handleSelect = (value: string) => {
    setSelected(value)
    if (!value) return

    const footnote = footnotes[Number(value)]
    if (!footnote) return

    setNote(footnote.note)
    setAttributionEnabled(footnote.attributionEnabled)

    if (footnote.attributionEnabled && footnote.link) {
      setLinkType(footnote.link.type ?? "custom")
      setLinkUrl(footnote.link.url ?? "")
      setLinkNewTab(footnote.link.newTab ?? false)
    }
  }

  if (!footnotes.length) return null

  return (
    <div className="field-type">
      <div className="label-wrapper">
        <label className="field-label">Insert Existing Footnote</label>
      </div>
      <select
        value={selected}
        onChange={(e) => handleSelect(e.target.value)}
        style={{ width: "100%" }}
      >
        <option value="">— Select a footnote to copy —</option>
        {footnotes.map((footnote, i) => (
          <option key={footnote.id ?? i} value={String(i)}>
            {footnote.note.length > 80 ? `${footnote.note.slice(0, 80)}…` : footnote.note}
          </option>
        ))}
      </select>
    </div>
  )
}
