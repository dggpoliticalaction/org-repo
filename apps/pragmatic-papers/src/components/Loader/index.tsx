"use client"

import { cn } from "@/utilities/utils"
import Lottie from "lottie-react"

import animationData from "./loader.json"

export const Loader: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div className={cn("flex min-h-16 w-full items-center justify-center", className)} {...props}>
      <Lottie
        animationData={animationData}
        className="aspect-25/3 w-xs opacity-25 brightness-0 dark:invert"
        loop
      />
    </div>
  )
}
