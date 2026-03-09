import type { Media, User } from '@/payload-types'
import type { Payload } from 'payload'
import {
  createParagraph,
  createEmptyParagraph,
  createRichText,
  createTextNode,
} from '../richtext'
import { createArticle, validateWriters } from '../articles'

const createMathBlocksContent = () => {
  const children = [
    createParagraph(
      'Mathematics is the language of science and philosophy alike. This article demonstrates both inline and display math rendering using LaTeX expressions.',
    ),
    createEmptyParagraph(),

    // --- Inline math section ---
    createParagraph(
      'Inline math allows equations to flow naturally within a sentence. For example, Einstein\'s famous mass-energy equivalence',
    ),
    createEmptyParagraph(),
    createParagraph([
      createTextNode('Einstein\'s mass-energy equivalence '),
      {
        type: 'inlineBlock',
        fields: {
          blockType: 'inlineMathBlock',
          math: 'E = mc^2',
        },
        format: '',
        version: 1,
      },
      createTextNode(
        ' is one of the most recognisable equations in all of physics, relating energy, mass, and the speed of light.',
      ),
    ]),
    createEmptyParagraph(),
    createParagraph([
      createTextNode('Bayes\' theorem '),
      {
        type: 'inlineBlock',
        fields: {
          blockType: 'inlineMathBlock',
          math: 'P(A \\mid B) = \\dfrac{P(B \\mid A)\\,P(A)}{P(B)}',
        },
        format: '',
        version: 1,
      },
      createTextNode(
        ' underpins modern probabilistic reasoning and has become central to debates in epistemology about rational belief revision.',
      ),
    ]),
    createEmptyParagraph(),
    createParagraph([
      createTextNode('The sum of the first '),
      {
        type: 'inlineBlock',
        fields: {
          blockType: 'inlineMathBlock',
          math: 'n',
        },
        format: '',
        version: 1,
      },
      createTextNode(' natural numbers is given by the closed form '),
      {
        type: 'inlineBlock',
        fields: {
          blockType: 'inlineMathBlock',
          math: '\\sum_{i=1}^{n} i = \\dfrac{n(n+1)}{2}',
        },
        format: '',
        version: 1,
      },
      createTextNode(
        ', a result attributed to Gauss that elegantly illustrates the power of algebraic thinking.',
      ),
    ]),
    createEmptyParagraph(),

    // --- Display math section ---
    createParagraph(
      'Display math is used for equations that deserve their own line — derivations, definitions, and results that the reader is meant to pause and study.',
    ),
    createEmptyParagraph(),
    createParagraph(
      'The Gaussian integral is a cornerstone of probability theory and quantum mechanics:',
    ),
    {
      type: 'block',
      fields: {
        blockType: 'displayMathBlock',
        math: '\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}',
      },
      format: '',
      version: 2,
    },
    createEmptyParagraph(),
    createParagraph(
      'The Fundamental Theorem of Calculus connects differentiation and integration, forming the backbone of analysis:',
    ),
    {
      type: 'block',
      fields: {
        blockType: 'displayMathBlock',
        math: '\\frac{d}{dx}\\left[\\int_a^x f(t)\\,dt\\right] = f(x)',
      },
      format: '',
      version: 2,
    },
    createEmptyParagraph(),
    createParagraph(
      'The time-dependent Schrödinger equation describes how the quantum state of a physical system evolves:',
    ),
    {
      type: 'block',
      fields: {
        blockType: 'displayMathBlock',
        math: 'i\\hbar\\,\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\,\\Psi(\\mathbf{r},t)',
      },
      format: '',
      version: 2,
    },
    createEmptyParagraph(),
    createParagraph(
      'Gauss\'s law — one of Maxwell\'s equations — relates the electric flux through a closed surface to the enclosed charge:',
    ),
    {
      type: 'block',
      fields: {
        blockType: 'displayMathBlock',
        math: '\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}',
      },
      format: '',
      version: 2,
    },
    createEmptyParagraph(),

    // --- Closing ---
    createParagraph(
      'Together, inline and display math blocks make it possible to write rigorous, typeset-quality mathematics within the flow of an article — bringing the precision of LaTeX to long-form philosophical and scientific writing.',
    ),
  ]

  return createRichText(children)
}

export const createMathBlocksArticle = async (
  payload: Payload,
  writers: User[],
  mediaDocs: Media[],
): Promise<number> => {
  validateWriters(writers)

  const writer = writers[0]!
  const title = 'Equations in Context: Demonstrating Inline and Display Math'

  const article = await createArticle(payload, {
    title,
    content: createMathBlocksContent(),
    authors: [writer.id],
    slug: 'equations-in-context-demonstrating-inline-and-display-math',
    meta: {
      title,
      description:
        'A guide to inline and display math rendering, demonstrating LaTeX equations from Bayes\' theorem to the Schrödinger equation.',
      image: mediaDocs[0]?.id,
    },
  })

  return article.id
}
