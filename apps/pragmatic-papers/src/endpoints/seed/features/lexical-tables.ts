import type { Media, User } from "@/payload-types"
import type { Payload } from "payload"
import { createArticle, validateWriters } from "../articles"
import {
  createParagraph,
  createRichText,
  createTableCellNode,
  createTableNode,
  createTableRowNode,
} from "../richtext"

const createArticleContentWithTable = () => {
  const headerRow = createTableRowNode([
    createTableCellNode("Framework", 1),
    createTableCellNode("Core Principle", 1),
    createTableCellNode("Key Thinker", 1),
  ])

  const dataRows = [
    ["Consequentialism", "Actions are judged by their outcomes", "Bentham, Mill"],
    ["Deontology", "Actions are judged by adherence to rules", "Immanuel Kant"],
    ["Virtue Ethics", "Character and virtues are central", "Aristotle"],
    ["Contractarianism", "Morality is grounded in social contracts", "John Rawls"],
  ].map((row) => createTableRowNode(row.map((cell) => createTableCellNode(cell, 0))))

  return createRichText([
    createParagraph(
      "Ethical frameworks provide systematic approaches for evaluating moral questions. The table below compares four major traditions in normative ethics, each offering a distinct criterion for what makes an action right or wrong.",
    ),
    createTableNode([headerRow, ...dataRows]),
    createParagraph(
      "These frameworks are not mutually exclusive. Contemporary moral philosophers often draw on multiple traditions, recognising that each captures genuine moral considerations that the others may underweight.",
    ),
  ])
}

export const createLexicalTablesArticle = async (
  payload: Payload,
  writers: User[],
  mediaDocs: Media[],
  topics: number[] = [],
): Promise<number> => {
  validateWriters(writers)

  const writer = writers[0]!
  const title = "Four Ethical Frameworks: A Comparative Overview"

  const article = await createArticle(payload, {
    title,
    content: createArticleContentWithTable(),
    authors: [writer.id],
    topics,
    slug: "demonstrating-lexical-tables",
    heroImage: mediaDocs[Math.floor(Math.random() * mediaDocs.length)]?.id,
    meta: {
      title,
      description:
        "A side-by-side comparison of consequentialism, deontology, virtue ethics, and contractarianism using a Lexical table.",
      image: mediaDocs[0]?.id,
    },
  })

  return article.id
}
