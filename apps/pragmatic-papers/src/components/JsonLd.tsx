import React from "react"
import type { JsonLdData } from "@/utilities/structuredData"

interface JsonLdProps {
  data: JsonLdData | JsonLdData[]
}

export function JsonLd({ data }: JsonLdProps): React.ReactElement {
  return (
    // eslint-disable-next-line react/no-danger
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}
