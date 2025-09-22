import React, { Fragment } from 'react'

import type { Article } from '@/payload-types'

import { ArticleBodyContentBlock } from './ArticleBodyContent/Component'
import { ArticleIntroductionBlock } from './ArticleIntroduction/Component'
import { EditorsNoteBlock } from './EditorsNote/Component'
import { SquiggleRuleBlock } from './SquiggleRule/Component'

const blockComponents = {
  articleIntroduction: ArticleIntroductionBlock,
  articleBodyContent: ArticleBodyContentBlock,
  editorsNote: EditorsNoteBlock,
  squiggleRule: SquiggleRuleBlock,
}

export const RenderArticleBlocks: React.FC<{
  blocks: Article['layout']
}> = (props) => {
  const blocks = props.blocks?.content

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block
          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="container" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} />
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
