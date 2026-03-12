import type { RequiredDataFromCollectionSlug } from "payload"

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<"pages"> = {
  title: "Home",
  hero: {
    type: "pageHero",
    richText: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Volumes",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr" as const,
            format: "" as const,
            indent: 0,
            tag: "h1",
            type: "heading",
            version: 1,
          },
        ],
        direction: "ltr" as const,
        format: "" as const,
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    links: [],
    media: null,
  },
  layout: [
    {
      introContent: null,
      populateBy: "collection",
      relationTo: "volumes",
      limit: 6,
      blockName: null,
      blockType: "volumeView",
      selectedDocs: [],
    },
  ],
  meta: {
    title: null,
    image: null,
    description: null,
  },
  publishedAt: "2025-07-09T07:54:37.358Z",
  slug: "home",
  generateSlug: true,
  updatedAt: "2025-07-13T23:32:37.273Z",
  createdAt: "2025-07-09T07:54:36.604Z",
  _status: "published",
}
