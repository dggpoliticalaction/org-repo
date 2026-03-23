import type { Page } from "@/payload-types"
import type { Payload } from "payload"

interface CreateMenusParams {
  aboutPage: Page
  articlesPage: Page
  contactPage: Page
  homePage: Page
  privacyPolicyPage: Page
  termsOfUsePage: Page
  volumesPage: Page
}

export const createMenus = async (
  payload: Payload,
  {
    aboutPage,
    articlesPage,
    contactPage,
    homePage,
    privacyPolicyPage,
    termsOfUsePage,
    volumesPage,
  }: CreateMenusParams,
): Promise<void> => {
  await payload.updateGlobal({
    slug: "header",
    data: {
      navItems: [
        {
          link: {
            type: "reference",
            label: "Home",
            reference: {
              relationTo: "pages",
              value: homePage.id,
            },
          },
        },
        {
          link: {
            type: "reference",
            label: "Volumes",
            reference: {
              relationTo: "pages",
              value: volumesPage.id,
            },
          },
        },
        {
          link: {
            type: "reference",
            label: "Articles",
            reference: {
              relationTo: "pages",
              value: articlesPage.id,
            },
          },
        },
      ],
      actionButton: {
        enabled: true,
        link: {
          type: "custom",
          label: "Join Us",
          url: "https://discord.gg/dggpol",
          newTab: true,
        },
        backgroundColor: "#ff401a",
        textColor: "#ffffff",
      },
    },
  })

  await payload.updateGlobal({
    slug: "footer",
    data: {
      copyright: {
        type: "custom",
        label: "Digital Ground Game",
        url: "https://digitalgroundgame.org",
        newTab: true,
      },
      navItems: [
        {
          link: {
            type: "reference",
            label: "Contact",
            reference: {
              relationTo: "pages",
              value: contactPage.id,
            },
          },
        },
        {
          link: {
            type: "reference",
            label: "About",
            reference: {
              relationTo: "pages",
              value: aboutPage.id,
            },
          },
        },
        {
          link: {
            type: "reference",
            label: "Privacy Policy",
            reference: {
              relationTo: "pages",
              value: privacyPolicyPage.id,
            },
          },
        },
        {
          link: {
            type: "reference",
            label: "Terms of Use",
            reference: {
              relationTo: "pages",
              value: termsOfUsePage.id,
            },
          },
        },
        {
          link: {
            type: "custom",
            label: "Log In",
            url: "/admin/login",
          },
        },
      ],
    },
  })
}
