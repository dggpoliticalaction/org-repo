import type { Page } from "@/payload-types"
import type { Payload } from "payload"

import { createRichTextContent } from "./richtext"

interface PageConfig {
  title: string
  slug: string
  content: string
  description: string
}

interface CreatePagesResult {
  aboutPage: Page
  articlesPage: Page
  contactPage: Page
  privacyPolicyPage: Page
  termsOfUsePage: Page
  volumesPage: Page
}

/** Hero richText with a heading containing the page name (for pageHero type). */
const createHeroRichTextHeading = (pageTitle: string, tag: "h1" | "h2" | "h3" | "h4" = "h1") => ({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: pageTitle,
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr" as const,
        format: "" as const,
        indent: 0,
        tag,
        type: "heading" as const,
        version: 1,
      },
    ],
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    type: "root",
    version: 1,
  },
})

export const createPages = async (payload: Payload): Promise<CreatePagesResult> => {
  const pageConfigs: Record<
    "about" | "articles" | "contact" | "privacyPolicy" | "termsOfUse" | "volumes",
    PageConfig
  > = {
    about: {
      title: "About",
      slug: "about",
      content:
        "Welcome to Pragmatic Papers. We are dedicated to publishing high-quality research and scholarly articles across various disciplines.",
      description: "Learn more about Pragmatic Papers and our mission.",
    },
    articles: {
      title: "Articles",
      slug: "articles",
      content:
        "Browse our collection of peer-reviewed articles and research papers. Each volume brings together curated works from leading scholars.",
      description: "Browse all articles published by Pragmatic Papers.",
    },
    contact: {
      title: "Contact",
      slug: "contact",
      content:
        "We would love to hear from you. Please reach out to us if you have any questions, suggestions, or inquiries.",
      description: "Get in touch with the Pragmatic Papers team.",
    },
    privacyPolicy: {
      title: "Privacy Policy",
      slug: "privacy-policy",
      content:
        "Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information when you use our website.",
      description: "Read our privacy policy to understand how we handle your data.",
    },
    termsOfUse: {
      title: "Terms of Use",
      slug: "terms-of-use",
      content:
        "By using our website, you agree to these terms of use. Please read them carefully before accessing or using our services.",
      description: "Review our terms of use before using our website.",
    },
    volumes: {
      title: "Volumes",
      slug: "volumes",
      content:
        "Explore our published volumes. Each volume is a themed collection of articles, edited and introduced by our editorial team.",
      description: "Explore all volumes published by Pragmatic Papers.",
    },
  }

  const { about, articles, contact, privacyPolicy, termsOfUse, volumes } = pageConfigs

  const aboutPage = await payload.create({
    collection: "pages",
    data: {
      title: about.title,
      slug: about.slug,
      hero: {
        type: "lowImpact",
        richText: null,
        links: [],
        media: null,
      },
      layout: [
        {
          blockType: "content",
          columns: [
            {
              size: "full",
              richText: createRichTextContent(about.content),
              enableLink: false,
            },
          ],
        },
      ],
      meta: {
        title: about.title,
        description: about.description,
        image: null,
      },
      _status: "published",
      publishedAt: new Date().toISOString(),
    },
  })

  const articlesPage = await payload.create({
    collection: "pages",
    data: {
      title: articles.title,
      slug: articles.slug,
      hero: {
        type: "pageHero",
        richText: createHeroRichTextHeading(articles.title),
        links: [],
        media: null,
      },
      layout: [
        {
          blockType: "volumeView",
          introContent: null,
          populateBy: "collection",
          relationTo: "volumes",
          limit: 6,
          selectedDocs: [],
        },
      ],
      meta: {
        title: articles.title,
        description: articles.description,
        image: null,
      },
      _status: "published",
      publishedAt: new Date().toISOString(),
    },
  })

  const contactPage = await payload.create({
    collection: "pages",
    data: {
      title: contact.title,
      slug: contact.slug,
      hero: {
        type: "lowImpact",
        richText: null,
        links: [],
        media: null,
      },
      layout: [
        {
          blockType: "content",
          columns: [
            {
              size: "full",
              richText: createRichTextContent(contact.content),
              enableLink: false,
            },
          ],
        },
      ],
      meta: {
        title: contact.title,
        description: contact.description,
        image: null,
      },
      _status: "published",
      publishedAt: new Date().toISOString(),
    },
  })

  const privacyPolicyPage = await payload.create({
    collection: "pages",
    data: {
      title: privacyPolicy.title,
      slug: privacyPolicy.slug,
      hero: {
        type: "lowImpact",
        richText: null,
        links: [],
        media: null,
      },
      layout: [
        {
          blockType: "content",
          columns: [
            {
              size: "full",
              richText: createRichTextContent(privacyPolicy.content),
              enableLink: false,
            },
          ],
        },
      ],
      meta: {
        title: privacyPolicy.title,
        description: privacyPolicy.description,
        image: null,
      },
      _status: "published",
      publishedAt: new Date().toISOString(),
    },
  })

  const termsOfUsePage = await payload.create({
    collection: "pages",
    data: {
      title: termsOfUse.title,
      slug: termsOfUse.slug,
      hero: {
        type: "lowImpact",
        richText: null,
        links: [],
        media: null,
      },
      layout: [
        {
          blockType: "content",
          columns: [
            {
              size: "full",
              richText: createRichTextContent(termsOfUse.content),
              enableLink: false,
            },
          ],
        },
      ],
      meta: {
        title: termsOfUse.title,
        description: termsOfUse.description,
        image: null,
      },
      _status: "published",
      publishedAt: new Date().toISOString(),
    },
  })

  const volumesPage = await payload.create({
    collection: "pages",
    data: {
      title: volumes.title,
      slug: volumes.slug,
      hero: {
        type: "pageHero",
        richText: createHeroRichTextHeading(volumes.title),
        links: [],
        media: null,
      },
      layout: [
        {
          blockType: "volumeView",
          introContent: null,
          populateBy: "collection",
          relationTo: "volumes",
          limit: 6,
          selectedDocs: [],
        },
      ],
      meta: {
        title: volumes.title,
        description: volumes.description,
        image: null,
      },
      _status: "published",
      publishedAt: new Date().toISOString(),
    },
  })

  return {
    aboutPage,
    articlesPage,
    contactPage,
    privacyPolicyPage,
    termsOfUsePage,
    volumesPage,
  }
}
