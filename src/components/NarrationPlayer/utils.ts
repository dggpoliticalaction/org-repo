import { type Article, type Media } from "@/payload-types"

export function isAudioMedia(value: Article["narration"]): value is Media {
  return !!value && typeof value !== "number"
}
