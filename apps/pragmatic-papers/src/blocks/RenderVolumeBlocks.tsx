import React, { Fragment } from 'react'

import type { Volume } from '@/payload-types'

import { VolumeIntroductionComponent } from './VolumeIntroduction/Component'
import { EditorsNoteBlock } from './EditorsNote/Component'
import { ArticleCardsGridComponent } from './ArticleCardsGrid/Component'
import { SquiggleRuleBlock } from './SquiggleRule/Component'

const blockComponents = {
  volumeIntroduction: VolumeIntroductionComponent,
  editorsNote: EditorsNoteBlock,
  articleCardsGrid: ArticleCardsGridComponent,
  squiggleRule: SquiggleRuleBlock,
}

export const RenderVolumeBlocks: React.FC<{
  blocks: Volume['layout']
  volume?: Volume
}> = (props) => {
  const blocks = props.blocks?.content
  const { volume } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block
          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              // Pass volume context to ArticleCardsGrid block
              const blockProps = blockType === 'articleCardsGrid' ? { ...block, volume } : block

              return (
                <div className="container" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...blockProps} />
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
