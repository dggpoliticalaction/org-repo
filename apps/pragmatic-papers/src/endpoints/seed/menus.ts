import type { Payload } from 'payload'
import type { Page } from '@/payload-types'

interface CreateMenusParams {
  aboutPage: Page
  contactPage: Page
  privacyPolicyPage: Page
  termsOfUsePage: Page
}

export const createMenus = async (
  payload: Payload,
  { aboutPage, contactPage, privacyPolicyPage, termsOfUsePage }: CreateMenusParams,
): Promise<void> => {
  await payload.updateGlobal({
    slug: 'header',
    data: {
      primaryMenu: [
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
      secondaryMenu: [
        {
          link: {
            type: 'custom',
            label: 'Discord',
            url: 'https://discord.gg',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Log In',
            url: '/login',
          },
        },
      ],
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
