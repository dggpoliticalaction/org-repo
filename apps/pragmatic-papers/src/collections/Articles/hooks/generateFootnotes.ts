import type { Article, FootnoteBlock, FootnotesField } from "@/payload-types"
import type { SerializedInlineBlockNode } from "@payloadcms/richtext-lexical"
import type {
  SerializedEditorState,
  SerializedLexicalNode,
} from "@payloadcms/richtext-lexical/lexical"
import type { CollectionBeforeChangeHook } from "payload"

const getDedupeKey = (fields: FootnoteBlock): string => {
  if (!fields.attributionEnabled || !fields.link) {
    return fields.note
  }
  if (fields.link.type === "custom") {
    return `${fields.note}|${fields.link.url ?? ""}`
  }
  const ref = fields.link.reference
  const refId =
    typeof ref?.value === "string" ? ref.value : ((ref?.value as { id?: string } | null)?.id ?? "")
  return `${fields.note}|${refId}`
}

export const collectFootnotes = (editorState?: SerializedEditorState | null): FootnotesField => {
  if (!editorState || typeof editorState !== "object") return []

  let footnoteIndex = 0
  const result: FootnotesField = []
  const seen = new Map<string, number>()

  const visitNode = (node: SerializedLexicalNode) => {
    if (!node || typeof node !== "object") return

    if (node.type === "inlineBlock") {
      const inlineNode = node as SerializedInlineBlockNode<FootnoteBlock>

      if (inlineNode.fields.blockType === "footnote") {
        const key = getDedupeKey(inlineNode.fields)

        if (seen.has(key)) {
          inlineNode.fields.index = seen.get(key)!
        } else {
          footnoteIndex += 1
          inlineNode.fields.index = footnoteIndex
          seen.set(key, footnoteIndex)
          result.push(inlineNode.fields)
        }
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
