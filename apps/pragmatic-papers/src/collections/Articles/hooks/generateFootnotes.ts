import type { Article, FootnoteBlock, FootnotesField } from "@/payload-types"
import type { SerializedInlineBlockNode } from "@payloadcms/richtext-lexical"
import type {
  SerializedEditorState,
  SerializedLexicalNode,
} from "@payloadcms/richtext-lexical/lexical"
import type { CollectionBeforeChangeHook } from "payload"

export const collectFootnotes = (editorState?: SerializedEditorState | null): FootnotesField => {
  if (!editorState || typeof editorState !== "object") return []

  let footnoteIndex = 0
  const result: FootnotesField = []

  const visitNode = (node: SerializedLexicalNode) => {
    if (!node || typeof node !== "object") return

    if (node.type === "inlineBlock") {
      const inlineNode = node as SerializedInlineBlockNode<FootnoteBlock>

      if (inlineNode.fields.blockType === "footnote") {
        footnoteIndex += 1
        inlineNode.fields.index = footnoteIndex
        result.push(inlineNode.fields)
      }
    }

    if ("children" in node && Array.isArray(node.children)) {
      node.children.forEach((child: SerializedLexicalNode) => visitNode(child))
    }
  }

  const rootChildren = editorState.root?.children
  if (Array.isArray(rootChildren)) {
    rootChildren.forEach((child: SerializedLexicalNode) => visitNode(child))
  }

  return result
}

export const generateFootnotes: CollectionBeforeChangeHook<Article> = ({ data, req }) => {
  const autosaveQuery = req?.query?.autosave
  const isAutosave =
    autosaveQuery === true ||
    autosaveQuery === "true" ||
    autosaveQuery === 1 ||
    autosaveQuery === "1"
  if (!isAutosave && data?.content) {
    data.footnotes = collectFootnotes(data.content as SerializedEditorState)
  }
  return data
}
