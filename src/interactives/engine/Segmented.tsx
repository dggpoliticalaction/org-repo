"use client"

import React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/**
 * One choice out of a few, as a labelled row of toggle buttons — the pane's View, Mark and
 * seniority controls, and the summary's.
 *
 * The buttons are the design system's (`ui/toggle-group`), which brings the roving focus and
 * the arrow keys with it. Two things are this component's own: the label that says what is
 * being chosen, and the rule that something always is. A toggle group is otherwise free to
 * end up with nothing pressed, and "no view" is not a view.
 */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string; hint?: string }[]
  onChange(v: T): void
}): React.ReactElement {
  return (
    <div className="inline-flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <ToggleGroup
        aria-label={label}
        size="sm"
        spacing={0}
        variant="outline"
        value={[value]}
        // A press that would leave nothing chosen is the reader pressing what is already
        // chosen; the group keeps what it had rather than emptying.
        onValueChange={(next: string[]) => {
          const chosen = (next as T[]).find((v) => v !== value) ?? (next[0] as T | undefined)
          if (chosen) onChange(chosen)
        }}
      >
        {options.map((o) => (
          <ToggleGroupItem key={o.value} value={o.value} title={o.hint}>
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
