"use client"

import { cn } from "@/utilities/utils"
import Lottie, { type LottieComponentProps } from "lottie-react"

import loader2 from "./loader-light.json"
import loader from "./loader.json"

type LoaderProps = Omit<LottieComponentProps, "animationData">

export const Loader: React.FC<LoaderProps> = ({ className, ...props }) => {
  return <Lottie animationData={loader} className={cn("aspect-25/3", className)} loop {...props} />
}

export const LoaderLight: React.FC<LoaderProps> = ({ className, ...props }) => {
  return <Lottie animationData={loader2} className={cn("aspect-25/3", className)} loop {...props} />
}
