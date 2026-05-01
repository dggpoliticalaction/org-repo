import type { Media, User } from "@/payload-types"
import type { Payload } from "payload"
import { createArticle, getWriterOrThrow, validateWriters } from "./articles"
import { createCollectionGridHomePage } from "./features/collection-grid"
import { createFootnotesArticle } from "./features/footnotes"
import { createMathBlocksArticle } from "./features/math-blocks"
import { createMediaCollageArticle } from "./features/media-collage"
import { createRichTextShowcaseArticle } from "./features/rich-text-showcase"
import { createLegacySocialEmbedArticle, createSocialEmbedArticle } from "./features/social-embeds"
import { createTimelineArticle } from "./features/timeline"
import { createMediaFromURL } from "./media"
import { createMenus } from "./menus"
import { createPages } from "./pages"
import { createLoremIpsumContent, generateLoremIspumSentence } from "./richtext"
import { createTopics } from "./topics"
import { createUsers } from "./users"
import { createVolumes } from "./volumes"

interface SeedContext {
  media: Media[]
  writer1: User
  writer2: User
  writer3: User
  writer4: User
  writer5: User
  writer6: User
  writer7: User
  writer8: User
  writer9: User
  writer10: User
  writer11: User
  writer12: User
  writer13: User
  writer14: User
  writer15: User
  writer16: User
  writer17: User
  writer18: User
  writer19: User
  writer20: User
  writer21: User
  writer22: User
  topics: number[]
  volume1Articles: number[]
  volume2Articles: number[]
  featureArticles: number[]
}

export const seed = async (
  payload: Payload,
  onProgress?: (message: string, step: number, total: number) => void,
): Promise<void> => {
  const ctx = {} as SeedContext

  const titleToSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

  const steps: { name: string; fn: () => Promise<void> }[] = [
    {
      name: "Clearing existing data...",
      fn: async () => {
        await payload.delete({
          collection: "users",
          where: {
            email: {
              in: [
                "admin@example.com",
                "chiefeditor@example.com",
                "editor@example.com",
                "writer1@example.com",
                "writer2@example.com",
                "writer3@example.com",
                "writer4@example.com",
                "writer5@example.com",
                "writer6@example.com",
                "writer7@example.com",
                "writer8@example.com",
                "writer9@example.com",
                "writer10@example.com",
                "writer11@example.com",
                "writer12@example.com",
                "writer13@example.com",
                "writer14@example.com",
                "writer15@example.com",
                "writer16@example.com",
                "writer17@example.com",
                "writer18@example.com",
                "writer19@example.com",
                "writer20@example.com",
                "writer21@example.com",
                "writer22@example.com",
              ],
            },
          },
        })
        await payload.delete({ collection: "articles", where: {} })
        await payload.delete({ collection: "volumes", where: {} })
        await payload.delete({ collection: "topics", where: {} })
        await payload.delete({ collection: "media", where: {} })
        await payload.delete({ collection: "pages", where: {} })
        await payload.delete({ collection: "forms", where: {} })
        await payload.delete({ collection: "form-submissions", where: {} })
      },
    },
    {
      name: "Uploading media...",
      fn: async () => {
        const IMAGE_BASE =
          "https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed"
        const ALT = "Curving abstract shapes with an orange and blue gradient"
        ctx.media = await Promise.all([
          createMediaFromURL(payload, `${IMAGE_BASE}/image-post1.webp`, ALT),
          createMediaFromURL(payload, `${IMAGE_BASE}/image-post2.webp`, ALT),
          createMediaFromURL(payload, `${IMAGE_BASE}/image-post3.webp`, ALT),
          createMediaFromURL(payload, `${IMAGE_BASE}/image-hero1.webp`, ALT),
        ])
      },
    },
    {
      name: "Creating users...",
      fn: async () => {
        const {
          writer1,
          writer2,
          writer3,
          writer4,
          writer5,
          writer6,
          writer7,
          writer8,
          writer9,
          writer10,
          writer11,
          writer12,
          writer13,
          writer14,
          writer15,
          writer16,
          writer17,
          writer18,
          writer19,
          writer20,
          writer21,
          writer22,
        } = await createUsers(payload, ctx.media)
        ctx.writer1 = writer1
        ctx.writer2 = writer2
        ctx.writer3 = writer3
        ctx.writer4 = writer4
        ctx.writer5 = writer5
        ctx.writer6 = writer6
        ctx.writer7 = writer7
        ctx.writer8 = writer8
        ctx.writer9 = writer9
        ctx.writer10 = writer10
        ctx.writer11 = writer11
        ctx.writer12 = writer12
        ctx.writer13 = writer13
        ctx.writer14 = writer14
        ctx.writer15 = writer15
        ctx.writer16 = writer16
        ctx.writer17 = writer17
        ctx.writer18 = writer18
        ctx.writer19 = writer19
        ctx.writer20 = writer20
        ctx.writer21 = writer21
        ctx.writer22 = writer22
        validateWriters([writer1, writer2])
      },
    },
    {
      name: "Creating topics...",
      fn: async () => {
        const topics = await createTopics(payload)
        ctx.topics = topics.map((topic) => topic.id)
      },
    },
    {
      name: "Creating Volume 1 articles...",
      fn: async () => {
        const writers = [
          ctx.writer1,
          ctx.writer2,
          ctx.writer3,
          ctx.writer4,
          ctx.writer5,
          ctx.writer6,
          ctx.writer7,
          ctx.writer8,
          ctx.writer9,
          ctx.writer10,
        ]
        ctx.volume1Articles = []
        // 0 Politics, 1 Memes, 2 Cognitive Science, 3 Philosophy, 4 Ethics, 5 Epistemology,
        // 6 Neuroscience, 7 Digital Culture, 8 Social Media, 9 Identity, 10 Humor
        const volume1TopicSets: number[][] = [
          [ctx.topics[4]!, ctx.topics[3]!, ctx.topics[0]!], // Trolley Problem: Ethics, Philosophy, Politics
          [ctx.topics[6]!, ctx.topics[3]!, ctx.topics[2]!], // Free Will: Neuroscience, Philosophy, Cognitive Science
          [ctx.topics[8]!, ctx.topics[3]!, ctx.topics[7]!], // Plato's Cave: Social Media, Philosophy, Digital Culture
          [ctx.topics[3]!, ctx.topics[9]!, ctx.topics[2]!], // Ship of Theseus: Philosophy, Identity, Cognitive Science
          [ctx.topics[4]!, ctx.topics[3]!, ctx.topics[0]!], // Beauvoir: Ethics, Philosophy, Politics
          [ctx.topics[5]!, ctx.topics[3]!, ctx.topics[0]!], // Epistemic Injustice: Epistemology, Philosophy, Politics
          [ctx.topics[2]!, ctx.topics[6]!, ctx.topics[3]!], // Cognitive Bias: Cognitive Science, Neuroscience, Philosophy
          [ctx.topics[7]!, ctx.topics[8]!, ctx.topics[3]!], // Digital Identity: Digital Culture, Social Media, Philosophy
          [ctx.topics[0]!, ctx.topics[4]!, ctx.topics[5]!], // Voting Theory: Politics, Ethics, Epistemology
          [ctx.topics[2]!, ctx.topics[9]!, ctx.topics[7]!], // Learning Styles: Cognitive Science, Identity, Digital Culture
        ]
        const volume1Titles = [
          "The Trolley Problem Revisited: Moral Intuition in the Age of Autonomous Vehicles",
          "Free Will and Determinism: Can Neuroscience Settle the Debate?",
          "Plato's Cave in the Digital Age: Social Media as Manufactured Reality",
          "The Ship of Theseus and Personal Identity: Who Are You After a Decade?",
          "Simone de Beauvoir's Ethics of Ambiguity and the Modern Workplace",
          "Epistemic Injustice: Why Some Voices Are Silenced in Public Discourse",
          "Cognitive Biases in the Age of Algorithmic Decision Making",
          "Digital Identity and the Fragmentation of Self in Online Spaces",
          "Voting Theory and the Mathematics of Democratic Representation",
          "Learning Styles: Myth or Reality in Educational Psychology",
        ]
        for (let i = 0; i < volume1Titles.length; i++) {
          const title = volume1Titles[i]!
          const article = await createArticle(payload, {
            title,
            content: createLoremIpsumContent(Math.floor(Math.random() * 8) + 3),
            authors: [getWriterOrThrow(writers, i).id],
            topics: volume1TopicSets[i]!,
            slug: titleToSlug(title),
            heroImage: ctx.media[i % ctx.media.length]?.id,
            meta: {
              title,
              description: generateLoremIspumSentence(),
              image: ctx.media[i % ctx.media.length]?.id,
            },
          })
          ctx.volume1Articles.push(article.id)
        }
      },
    },
    {
      name: "Creating Volume 2 articles...",
      fn: async () => {
        const writers = [
          ctx.writer11,
          ctx.writer12,
          ctx.writer13,
          ctx.writer14,
          ctx.writer15,
          ctx.writer16,
        ]
        ctx.volume2Articles = []
        const volume2TopicSets: number[][] = [
          [ctx.topics[1]!, ctx.topics[2]!, ctx.topics[7]!], // Dawkins vs Blackmore: Memes, Cognitive Science, Digital Culture
          [ctx.topics[1]!, ctx.topics[7]!, ctx.topics[8]!, ctx.topics[10]!], // Irony as Ideology: Memes, Digital Culture, Social Media, Humor
          [ctx.topics[1]!, ctx.topics[7]!], // Half-Life of Virality: Memes, Digital Culture
          [ctx.topics[7]!, ctx.topics[8]!, ctx.topics[10]!], // Meme Culture: Digital Culture, Social Media, Humor
          [ctx.topics[1]!, ctx.topics[2]!, ctx.topics[8]!], // Memetic Engineering: Memes, Cognitive Science, Social Media
          [ctx.topics[7]!, ctx.topics[9]!, ctx.topics[8]!], // Online Persona: Digital Culture, Identity, Social Media
        ]
        const volume2Titles = [
          "Dawkins vs. Blackmore: What Counts as a Meme in the Attention Economy?",
          "Irony as Ideology: How the Internet Weaponised Humour",
          "The Half-Life of Virality: Why Memes Die and What Survives",
          "Meme Culture and the Evolution of Internet Folklore",
          "Memetic Engineering: Designing Ideas That Spread",
          "The Online Persona: Performance and Authenticity in Digital Spaces",
        ]
        for (let i = 0; i < volume2Titles.length; i++) {
          const title = volume2Titles[i]!
          const article = await createArticle(payload, {
            title,
            content: createLoremIpsumContent(Math.floor(Math.random() * 8) + 3),
            authors: [getWriterOrThrow(writers, i).id],
            topics: volume2TopicSets[i]!,
            slug: titleToSlug(title),
            heroImage: ctx.media[i % ctx.media.length]?.id,
            meta: {
              title,
              description: generateLoremIspumSentence(),
              image: ctx.media[i % ctx.media.length]?.id,
            },
          })
          ctx.volume2Articles.push(article.id)
        }
      },
    },
    {
      name: "Creating feature articles...",
      fn: async () => {
        const [
          richTextShowcase,
          footnotes,
          socialEmbed,
          legacySocialEmbed,
          mediaCollage,
          mathBlocks,
          timeline,
        ] = await Promise.all([
          createRichTextShowcaseArticle(payload, [ctx.writer1, ctx.writer2], ctx.media, [
            ctx.topics[3]!,
            ctx.topics[4]!,
            ctx.topics[7]!,
          ]),
          createFootnotesArticle(
            payload,
            [ctx.writer1, ctx.writer2],
            ctx.media,
            ctx.volume1Articles[0]!,
            [ctx.topics[0]!, ctx.topics[3]!, ctx.topics[4]!],
          ),
          createSocialEmbedArticle(payload, ctx.writer1, ctx.media, [
            ctx.topics[0]!,
            ctx.topics[1]!,
            ctx.topics[7]!,
          ]),
          createLegacySocialEmbedArticle(payload, ctx.writer1, ctx.media, [
            ctx.topics[0]!,
            ctx.topics[1]!,
            ctx.topics[10]!,
          ]),
          createMediaCollageArticle(payload, ctx.writer1, ctx.media, [
            ctx.topics[3]!,
            ctx.topics[7]!,
          ]),
          createMathBlocksArticle(payload, [ctx.writer1, ctx.writer2], ctx.media, [
            ctx.topics[2]!,
            ctx.topics[3]!,
            ctx.topics[5]!,
          ]),
          createTimelineArticle(payload, [ctx.writer1, ctx.writer2], ctx.media, [
            ctx.topics[3]!,
            ctx.topics[7]!,
          ]),
        ])
        ctx.featureArticles = [
          richTextShowcase,
          footnotes,
          socialEmbed,
          legacySocialEmbed,
          mediaCollage,
          mathBlocks,
          timeline,
        ]
      },
    },
    {
      name: "Creating volumes...",
      fn: async () => {
        await createVolumes(
          payload,
          [
            {
              volumeNumber: 1,
              title: "Volume 1: Foundations of Philosophy",
              description:
                "A comprehensive collection of foundational philosophy papers covering various topics.",
              editorsNoteContent:
                "This inaugural volume brings together six groundbreaking papers that lay the foundation for future research.",
              articleIds: ctx.volume1Articles,
            },
            {
              volumeNumber: 2,
              title: "Volume 2: Advanced Studies in Memes",
              description:
                "A focused collection of three in-depth research papers exploring advanced topics in memes.",
              editorsNoteContent:
                "This volume presents three comprehensive studies that push the boundaries of current research in memes.",
              articleIds: ctx.volume2Articles,
            },
            {
              volumeNumber: 3,
              title: "Volume 3: Feature Demonstrations",
              description:
                "A collection of articles demonstrating the platform's feature set, including footnotes, social embeds, and media collages.",
              editorsNoteContent:
                "This volume showcases the full range of content features available to authors on Pragmatic Papers.",
              articleIds: ctx.featureArticles,
            },
          ],
          ctx.media,
        )
      },
    },
    {
      name: "Creating pages & menus...",
      fn: async () => {
        await createCollectionGridHomePage(
          payload,
          ctx.volume1Articles,
          ctx.volume2Articles,
          ctx.featureArticles,
        )
        const homePage = await payload
          .find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1 })
          .then((res) => res.docs[0]!)
        const {
          aboutPage,
          articlesPage,
          contactPage,
          privacyPolicyPage,
          termsOfUsePage,
          volumesPage,
        } = await createPages(payload)
        await createMenus(payload, {
          homePage,
          aboutPage,
          articlesPage,
          contactPage,
          privacyPolicyPage,
          termsOfUsePage,
          volumesPage,
        })
      },
    },
  ]

  for (let i = 0; i < steps.length; i++) {
    const { name, fn } = steps[i]!
    onProgress?.(name, i + 1, steps.length)
    try {
      await fn()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`Seed step "${name}" failed: ${message}`, { cause: err })
    }
  }
}
