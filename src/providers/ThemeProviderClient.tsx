"use client"
import { ThemeProvider } from "@teispace/next-themes"

export function ThemeProviderClient({
  children,
  initialTheme,
}: {
  children: React.ReactNode
  initialTheme: string | null
}): React.ReactNode {
  return (
    <ThemeProvider attribute="class" initialTheme={initialTheme ?? undefined}>
      {children}
    </ThemeProvider>
  )
}
