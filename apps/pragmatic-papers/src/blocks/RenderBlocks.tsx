import React, { Suspense } from "react"

import type { Page } from "@/payload-types"

import { CallToActionBlock } from "@/blocks/CallToAction/Component"
import { CollectionGridBlock } from "@/blocks/CollectionGrid/Component"
import { ContentBlock } from "@/blocks/Content/Component"
import { FormBlock } from "@/blocks/Form/Component"
import { MediaBlock } from "@/blocks/MediaBlock/Component"
import { VolumeViewBlock, VolumeViewSkeleton } from "@/blocks/VolumeViewBlock/component"
import { Loader } from "@/components/Loader"
import { Skeleton } from "@/components/ui/skeleton"

type LayoutBlock = Page["layout"][number]
type BlockType = LayoutBlock["blockType"]

type BlockRenderers = {
  [K in BlockType]: (
    block: Extract<LayoutBlock, { blockType: K }>,
    pageNumber?: number,
  ) => React.ReactNode
}

const BLOCK_RENDERERS: BlockRenderers = {
  collectionGrid: (block) => <CollectionGridBlock {...block} />,
  content: (block) => <ContentBlock {...block} />,
  cta: (block) => <CallToActionBlock {...block} />,
  formBlock: (block) => {
    if (typeof block.form === "number") return null
    return <FormBlock {...block} />
  },
  mediaBlock: (block) => <MediaBlock {...block} />,
  volumeView: (block, pageNumber) => <VolumeViewBlock {...block} pageNumber={pageNumber} />,
}

interface RenderBlockProps {
  block: LayoutBlock
  pageNumber?: number
}

const RenderBlock: React.FC<RenderBlockProps> = ({ block, pageNumber }) => {
  const renderer = BLOCK_RENDERERS[block.blockType]
  if (!renderer) return null
  return (renderer as (b: LayoutBlock, p?: number) => React.ReactNode)(block, pageNumber)
}

/** Generic block fallback */
const BlockFallback: React.FC<LayoutBlock> = (block) => {
  if (block.blockType === "volumeView") {
    return <VolumeViewSkeleton {...block} />
  }
  return (
    <Skeleton className="mx-auto my-16 flex min-h-32 max-w-2xl items-center justify-center rounded-xl py-16">
      <Loader />
    </Skeleton>
  )
}

interface RenderBlocksProps {
  blocks: Page["layout"][number][]
  pageNumber?: number
}

export const RenderBlocks: React.FC<RenderBlocksProps> = ({ blocks, pageNumber }) => (
  <>
    {blocks.map((block, index) => (
      <Suspense key={`block-${block.id || index}`} fallback={<BlockFallback {...block} />}>
        <RenderBlock block={block} pageNumber={pageNumber} />
      </Suspense>
    ))}
  </>
)
