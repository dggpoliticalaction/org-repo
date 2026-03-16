import type { Media, User } from "@/payload-types"
import type { Payload } from "payload"
import { createRichTextFromString } from "./richtext"

export interface SeededUsers {
  admin: User
  chiefEditor: User
  editor: User
  writer1: User
  writer2: User
}

export const createUsers = async (
  payload: Payload,
  media: Media[],
  context?: Record<string, unknown>,
): Promise<SeededUsers> => {
  const devEmail = process.env.DEV_ADMIN_EMAIL
  const devName = process.env.DEV_ADMIN_NAME
  const devPassword = process.env.DEV_ADMIN_PASSWORD

  // Create an admin user — uses DEV_ADMIN_* env vars if set, otherwise falls back to defaults
  const admin = await payload.create({
    collection: "users",
    ...(context && { context }),
    data: {
      email: devEmail ?? "admin@example.com",
      password: devPassword ?? "password123",
      name: devName ?? "John Admin",
      role: "admin",
      slug: "superadmin",
      profileImage: media[0]?.id,
    },
  })

  const chiefEditor = await payload.create({
    collection: "users",
    ...(context && { context }),
    data: {
      email: "chiefeditor@example.com",
      password: "password123",
      name: "Jane Chief",
      role: "chief-editor",
      slug: "chiefjane",
      profileImage: media[1]?.id,
    },
  })

  // It's helpful to see what an editor can see with restricted access
  const editor = await payload.create({
    collection: "users",
    draft: true,
    ...(context && { context }),
    data: {
      email: "editor@example.com",
      password: "password123",
      name: "Stacy The Editor",
      role: "editor",
      slug: "stacytheeditor",
      profileImage: media[2]?.id,
    },
  })

  const writer1 = await payload.create({
    collection: "users",
    draft: false,
    ...(context && { context }),
    data: {
      email: "writer1@example.com",
      password: "password123",
      name: "Teagan Wordsmith",
      slug: "teagan-wordsmith",
      role: "writer",
      affiliation: "Senior Research Fellow, Pragmatic Papers Institute",
      biography: createRichTextFromString(
        "A prolific writer specializing in academic research and scientific papers.",
      ),
      profileImage: media[3]?.id,
      socials: [
        {
          link: {
            type: "custom",
            url: "https://twitter.com/writer_one",
            label: "Twitter",
            newTab: true,
          },
        },
        {
          link: {
            type: "custom",
            url: "https://github.com/writer-one",
            label: "GitHub",
            newTab: true,
          },
        },
        {
          link: {
            type: "custom",
            url: "https://scholar.google.com",
            label: "Google Scholar",
            newTab: true,
          },
        },
      ],
    },
  })

  const writer2 = await payload.create({
    collection: "users",
    draft: false,
    ...(context && { context }),
    data: {
      email: "writer2@example.com",
      password: "password123",
      name: "Sienna Scribe",
      slug: "sienna-scribe",
      role: "writer",
      affiliation: "Associate Editor, Department of Theoretical Studies",
      biography: createRichTextFromString(
        "An experienced researcher with focus on theoretical physics and mathematics.",
      ),
      profileImage: media[0]?.id,
      socials: [
        {
          link: {
            type: "custom",
            url: "https://twitter.com/writer_two",
            label: "Twitter",
            newTab: true,
          },
        },
        {
          link: {
            type: "custom",
            url: "https://github.com/writer-two",
            label: "GitHub",
            newTab: true,
          },
        },
        {
          link: {
            type: "custom",
            url: "https://orcid.org",
            label: "ORCID",
            newTab: true,
          },
        },
      ],
    },
  })

  return { admin, chiefEditor, editor, writer1, writer2 }
}
