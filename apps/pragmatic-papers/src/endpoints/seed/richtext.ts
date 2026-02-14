/**
 * Utility functions for creating Lexical rich text structures
 */

type LexicalDirection = 'ltr' | 'rtl' | null
type LexicalFormat = '' | 'left' | 'center' | 'right' | 'justify'
type LexicalNodeType = 'text' | 'paragraph' | 'root' | 'block' | 'inlineBlock' | string

interface LexicalBaseNode {
  [k: string]: unknown
  type: LexicalNodeType
  version: number
}

interface LexicalTextNode extends LexicalBaseNode {
  detail: number
  format: number
  mode: 'normal' | 'token' | 'segmented'
  style: string
  text: string
  type: 'text'
}

interface LexicalParagraphNode extends LexicalBaseNode {
  children: LexicalTextNode[]
  direction: LexicalDirection
  format: LexicalFormat
  indent: number
  type: 'paragraph'
  textFormat?: number
  textStyle?: string
}

interface LexicalRootNode extends LexicalBaseNode {
  children: LexicalBaseNode[]
  direction: LexicalDirection
  format: LexicalFormat
  indent: number
  type: 'root'
}

export interface LexicalContent {
  [k: string]: unknown
  root: LexicalRootNode
}

/**
 * Creates a text node for use within paragraphs
 */
export function createTextNode(text: string, format = 0): LexicalTextNode {
  return {
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  }
}

/**
 * Creates a paragraph node containing text
 */
export function createParagraph(
  text: string | LexicalTextNode | (LexicalTextNode | Record<string, unknown>)[],
  format: LexicalFormat = '',
): LexicalParagraphNode {
  const children = Array.isArray(text)
    ? (text as LexicalTextNode[])
    : typeof text === 'string'
      ? [createTextNode(text)]
      : [text]

  return {
    children,
    direction: 'ltr',
    format,
    indent: 0,
    type: 'paragraph',
    version: 1,
    textFormat: 0,
    textStyle: '',
  }
}

/**
 * Creates an empty paragraph node (for line breaks)
 */
export function createEmptyParagraph(): LexicalBaseNode {
  return {
    children: [],
    direction: null,
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
  }
}

/**
 * Creates a complete Lexical rich text structure from a single string
 */
export function createRichTextFromString(text: string): LexicalContent {
  return {
    root: {
      children: [createParagraph(text)],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

/**
 * Creates a complete Lexical rich text structure from an array of paragraphs
 * Automatically adds empty paragraphs between each text paragraph for spacing
 */
export function createRichTextFromParagraphs(
  paragraphs: string[],
  addSpacing = true,
): LexicalContent {
  const children: LexicalBaseNode[] = []

  paragraphs.forEach((text, index) => {
    children.push(createParagraph(text))
    // Add spacing paragraph between (but not after the last one)
    if (addSpacing && index < paragraphs.length - 1) {
      children.push(createEmptyParagraph())
    }
  })

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

/**
 * Creates a complete Lexical rich text structure from paragraph nodes
 * Useful when you need more control over the paragraph structure
 */
export function createRichText(children: LexicalBaseNode[]): LexicalContent {
  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

/**
 * Generates Lorem Ipsum sentences
 */
const LOREM_IPSUMS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur; yee wins.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
]

/**
 * Generates a Lorem Ipsum paragraph with a specified number of sentences
 */
export function generateLoremIpsumParagraph(numberOfSentences: number): string {
  return Array.from({ length: numberOfSentences }, () => {
    return LOREM_IPSUMS[Math.floor(Math.random() * LOREM_IPSUMS.length)]
  }).join(' ')
}

/**
 * Generates an array of Lorem Ipsum paragraphs
 */
export function generateLoremIpsumParagraphs(numberOfParagraphs: number): string[] {
  return Array.from({ length: numberOfParagraphs }, () => generateLoremIpsumParagraph(5))
}

/**
 * Creates Lorem Ipsum rich text content with spacing between paragraphs
 */
export function createLoremIpsumContent(numberOfParagraphs: number): LexicalContent {
  const paragraphs = generateLoremIpsumParagraphs(numberOfParagraphs)
  return createRichTextFromParagraphs(paragraphs, true)
}
