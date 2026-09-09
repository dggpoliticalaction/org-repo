"use client"

import type { LucideIcon } from "lucide-react"
import React from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export interface SegmentedOption<T extends string> {
  value: T
  /** The accessible name, and what shows on the button unless `icon` replaces it. */
  label: string
  /** Drawn instead of `label`'s text; `label` stays the button's accessible name. */
  icon?: LucideIcon
  /** What a hover or a focus explains about this choice. */
  hint?: React.ReactNode
}

/**
 * One choice out of a few, as a labelled row of toggle buttons — the pane's View, Mark and
 * seniority controls, and the summary's.
 *
 * The buttons are the design system's (`ui/toggle-group`), which brings the roving focus and
 * the arrow keys with it. Three things are this component's own: the label that says what is
 * being chosen (or, given `labelHint`, a term worth explaining rather than a caption), a hint
 * on any option worth a sentence, and the rule that something always is — a toggle group is
 * otherwise free to end up with nothing pressed, and "no view" is not a view.
 */
export function Segmented<T extends string>({
  label,
  /** Turns the label into a tooltip trigger: what "Senior" means, not merely that it exists. */
  labelHint,
  /** Drops the visible label — the options read on their own — while `label` still names the
      group for anyone not looking at it. */
  hideLabel,
  value,
  options,
  onChange,
}: {
  label: string
  labelHint?: React.ReactNode
  hideLabel?: boolean
  value: T
  options: SegmentedOption<T>[]
  onChange(v: T): void
}): React.ReactElement {
  return (
    <TooltipProvider delay={300} closeDelay={0}>
      <div className="inline-flex items-center gap-1.5 text-sm">
        {hideLabel ? null : labelHint ? (
          <Tooltip>
            <TooltipTrigger className="text-muted-foreground cursor-help text-xs underline decoration-dotted underline-offset-2">
              {label}
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-56">
              {labelHint}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground text-xs">{label}</span>
        )}
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
          {options.map((o) => {
            const Icon = o.icon
            const item = (
              <ToggleGroupItem value={o.value} aria-label={Icon ? o.label : undefined}>
                {Icon ? <Icon aria-hidden="true" /> : o.label}
              </ToggleGroupItem>
            )
            if (!o.hint) return <React.Fragment key={o.value}>{item}</React.Fragment>
            return (
              <Tooltip key={o.value}>
                <TooltipTrigger render={item} />
                <TooltipContent side="top" align="center" className="max-w-56">
                  {o.hint}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </ToggleGroup>
      </div>
    </TooltipProvider>
  )
}
