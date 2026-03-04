import type { Page } from '@/payload-types'
import type { Payload } from 'payload'

interface CreateMenusParams {
  homePage: Page
  aboutPage: Page
  contactPage: Page
  privacyPolicyPage: Page
  termsOfUsePage: Page
}

export const createMenus = async (
  payload: Payload,
  { homePage, aboutPage, contactPage, privacyPolicyPage, termsOfUsePage }: CreateMenusParams,
): Promise<void> => {
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        {
          link: {
            type: 'reference',
            label: 'Home',
            reference: {
              relationTo: 'pages',
              value: homePage.id,
            },
          },
        },
        {
          link: {
            type: 'reference',
            label: 'About',
            reference: {
              relationTo: 'pages',
              value: aboutPage.id,
            },
          },
        },
        {
          link: {
            type: 'reference',
            label: 'Contact',
            reference: {
              relationTo: 'pages',
              value: contactPage.id,
            },
          },
        },
      ],
      actionButton: {
        enabled: true,
        link: {
          type: 'custom',
          label: 'Join Discord',
          url: 'https://discord.gg/dggpol',
          newTab: true,
        },
        backgroundColor: '#5865F2',
        textColor: '#E0E3FF',
      },
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        {
          link: {
            type: 'reference',
            label: 'Privacy Policy',
            reference: {
              relationTo: 'pages',
              value: privacyPolicyPage.id,
            },
          },
        },
        {
          link: {
            type: 'reference',
            label: 'Terms of Use',
            reference: {
              relationTo: 'pages',
              value: termsOfUsePage.id,
            },
          },
        },
      ],
    },
  })
}
