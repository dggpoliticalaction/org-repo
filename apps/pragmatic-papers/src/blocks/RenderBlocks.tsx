import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { VolumeViewBlock } from '@/blocks/VolumeViewBlock/component'
import { MathBlock } from '@/blocks/Math/Component'

const blockComponents = {
  InlineMathBlock: MathBlock,
  DisplayMathBlock: MathBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  volumeView: VolumeViewBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  searchParamsPromise: Promise<{ p?: string }>
}> = (props) => {
  const { blocks, searchParamsPromise } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType == 'volumeView') {
            return (
              <div className="my-4" key={index}>
                <VolumeViewBlock
                  {...block}
                  id={block.id ?? undefined}
                  searchParamsPromise={searchParamsPromise}
                  blockType={'volumeView'}
                />
              </div>
            )
          } else if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-4" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
