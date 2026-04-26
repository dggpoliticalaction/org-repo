import { type Article, type Narration } from "@/payload-types"

export function isNarration(value: Article["narration"]): value is Narration {
  return !!value && typeof value !== "number"
}
