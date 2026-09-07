"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import * as React from "react"

import { cn } from "@/utilities/utils"

function TooltipProvider({ ...props }: TooltipPrimitive.Provider.Props): React.ReactNode {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={400} {...props} />
}

function TooltipRoot({ ...props }: TooltipPrimitive.Root.Props): React.ReactNode {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props): React.ReactNode {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipPortal({ ...props }: TooltipPrimitive.Portal.Props): React.ReactNode {
  return <TooltipPrimitive.Portal data-slot="tooltip-portal" {...props} />
}

function TooltipPositioner({
  className,
  ...props
}: TooltipPrimitive.Positioner.Props): React.ReactNode {
  return (
    <TooltipPrimitive.Positioner
      data-slot="tooltip-positioner"
      sideOffset={6}
      className={cn("z-50", className)}
      {...props}
    />
  )
}

function TooltipPopup({ className, ...props }: TooltipPrimitive.Popup.Props): React.ReactNode {
  return (
    <TooltipPrimitive.Popup
      data-slot="tooltip-popup"
      className={cn(
        "bg-foreground text-background rounded-xs px-2.5 py-1.5 text-xs shadow-md",
        "opacity-0 transition-opacity data-[instant]:transition-none data-[open]:opacity-100",
        className,
      )}
      {...props}
    />
  )
}

/**
 * The two-part shape the shadcn registry writes against: a `Tooltip` wrapping a trigger and a
 * `TooltipContent`. It composes the parts above, so a component copied in from the registry —
 * `sidebar.tsx` is the first — works unedited, while anything bespoke here keeps reaching for
 * the portal, positioner and popup directly.
 */
function Tooltip({ ...props }: TooltipPrimitive.Root.Props): React.ReactNode {
  return <TooltipRoot {...props} />
}

type TooltipContentProps = TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "hidden">

function TooltipContent({
  side,
  align,
  sideOffset,
  hidden,
  ...props
}: TooltipContentProps): React.ReactNode {
  return (
    <TooltipPortal>
      <TooltipPositioner side={side} align={align} sideOffset={sideOffset} hidden={hidden}>
        <TooltipPopup {...props} />
      </TooltipPositioner>
    </TooltipPortal>
  )
}

export {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipPositioner,
  TooltipPopup,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
}
