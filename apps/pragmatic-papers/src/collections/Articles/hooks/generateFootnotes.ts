import type { Article, FootnoteBlock, FootnotesField } from "@/payload-types"
import type { SerializedInlineBlockNode } from "@payloadcms/richtext-lexical"
import type {
  SerializedEditorState,
  SerializedLexicalNode,
} from "@payloadcms/richtext-lexical/lexical"
import type { CollectionBeforeChangeHook } from "payload"

type FootnoteFields = FootnoteBlock & { sourceId?: string | null }

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

const collectByNode = (node: SerializedLexicalNode, into: Map<string, FootnoteFields>): void => {
  if (!node || typeof node !== "object") return

  if (node.type === "inlineBlock") {
    const inlineNode = node as SerializedInlineBlockNode<FootnoteBlock>
    const fields = inlineNode.fields as FootnoteFields
    if (fields.blockType === "footnote" && !fields.sourceId) {
      if (!fields.id) {
        fields.id = crypto.randomUUID()
      }
      into.set(fields.id, fields)
    }
  }

  if ("children" in node && Array.isArray(node.children)) {
    node.children.forEach((child: SerializedLexicalNode) => collectByNode(child, into))
  }
}

export const collectFootnotes = (editorState?: SerializedEditorState | null): FootnotesField => {
  if (!editorState || typeof editorState !== "object") return []

  const rootChildren = editorState.root?.children
  if (!Array.isArray(rootChildren)) return []

  // Phase 1: index all original (non-reference) footnote blocks by id
  const blockById = new Map<string, FootnoteFields>()
  rootChildren.forEach((child: SerializedLexicalNode) => collectByNode(child, blockById))

  type FootnoteResult = NonNullable<FootnotesField>[number]

  // Phase 2: resolve references, then dedup and assign indices
  let footnoteIndex = 0
  const result: FootnotesField = []
  const seen = new Map<string, number>()

  const visitNode = (node: SerializedLexicalNode) => {
    if (!node || typeof node !== "object") return

    if (node.type === "inlineBlock") {
      const inlineNode = node as SerializedInlineBlockNode<FootnoteBlock>
      const fields = inlineNode.fields as FootnoteFields

      if (fields.blockType === "footnote") {
        if (fields.sourceId) {
          const source = blockById.get(fields.sourceId)
          if (source) {
            fields.note = source.note
            fields.attributionEnabled = source.attributionEnabled
            fields.link = source.link
          } else {
            // Orphaned reference: promote to standalone original
            fields.sourceId = null
          }
        }

        const key = getDedupeKey(fields)

        if (seen.has(key)) {
          fields.index = seen.get(key)!
        } else {
          footnoteIndex += 1
          fields.index = footnoteIndex
          seen.set(key, footnoteIndex)
          result.push(fields as FootnoteResult)
        }
      }
    }

    if ("children" in node && Array.isArray(node.children)) {
      node.children.forEach((child: SerializedLexicalNode) => visitNode(child))
    }
  }

  rootChildren.forEach((child: SerializedLexicalNode) => visitNode(child))

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
