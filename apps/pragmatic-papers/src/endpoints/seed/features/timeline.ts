import type { Media, User } from "@/payload-types"
import type { Payload } from "payload"

import { createArticle, validateWriters } from "../articles"
import { createEmptyParagraph, createParagraph, createRichText } from "../richtext"

interface TimelineCitationSeed {
  url: string
  label: string
}

interface TimelineEventSeed {
  date: string
  title?: string
  description: string
  avatar?: number
  citation?: TimelineCitationSeed
}

const buildCitation = (citation?: TimelineCitationSeed) =>
  citation
    ? { type: "custom" as const, url: citation.url, label: citation.label, newTab: true }
    : undefined

const createTimelineBlock = (events: TimelineEventSeed[], title?: string) => ({
  type: "block",
  fields: {
    blockType: "timeline",
    title: title ?? null,
    events: events.map((e) => ({
      date: e.date,
      title: e.title ?? null,
      description: e.description,
      avatar: e.avatar ?? null,
      enableCitation: Boolean(e.citation),
      ...(e.citation && { citation: buildCitation(e.citation) }),
    })),
  },
  format: "",
  version: 2,
})

export const createTimelineArticle = async (
  payload: Payload,
  writers: User[],
  mediaDocs: Media[],
  topics: number[] = [],
): Promise<number> => {
  validateWriters(writers)
  const writer = writers[0]!

  if (mediaDocs.length === 0) {
    throw new Error("createTimelineArticle requires at least one media document")
  }

  const avatar = (i: number) => mediaDocs[i % mediaDocs.length]!.id
  const cite = (n: number) => ({
    url: `https://example.com/source-${n}`,
    label: `Source ${n}`,
  })

  const events: TimelineEventSeed[] = [
    {
      date: "January 5",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
      avatar: avatar(0),
      citation: cite(1),
    },
    {
      date: "January 18",
      description:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      avatar: avatar(1),
      citation: cite(2),
    },
    {
      date: "February 2",
      description:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      avatar: avatar(2),
    },
    {
      date: "February 14",
      description:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      avatar: avatar(3),
      citation: cite(4),
    },
    {
      date: "February 27",
      description:
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
      avatar: avatar(0),
      citation: cite(5),
    },
    {
      date: "March 6",
      description:
        "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      citation: cite(6),
    },
    {
      date: "March 19",
      description:
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
      avatar: avatar(1),
    },
    {
      date: "April 1",
      description:
        "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
      avatar: avatar(2),
    },
    {
      date: "April 12",
      description:
        "Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam.",
    },
    {
      date: "April 25",
      description:
        "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
      avatar: avatar(3),
      citation: cite(7),
    },
  ]

  const content = createRichText([
    createParagraph(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. The timeline below presents a sequence of events with per-event context — dates, descriptions, avatars, and citations.",
    ),
    createEmptyParagraph(),
    createTimelineBlock(events, "A sample timeline"),
  ])

  const title = "Lorem Ipsum Timeline"
  const heroImage = mediaDocs[0]!.id

  const article = await createArticle(payload, {
    title,
    content,
    authors: [writer.id],
    topics,
    slug: "lorem-ipsum-timeline",
    heroImage,
    meta: {
      title,
      description: "A demonstration of the timeline block with placeholder content.",
      image: heroImage,
    },
  })

  return article.id
}
