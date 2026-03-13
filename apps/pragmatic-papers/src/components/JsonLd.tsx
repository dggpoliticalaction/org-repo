import type { JsonLdData } from "@/utilities/structuredData"

interface JsonLdProps {
  data: JsonLdData | JsonLdData[]
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}
