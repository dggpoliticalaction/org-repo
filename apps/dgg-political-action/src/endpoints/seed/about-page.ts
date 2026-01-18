import type { RequiredDataFromCollectionSlug, Payload } from 'payload'
import { fetchFileByURL } from './fetch-file-by-url'

export const aboutPage = async (payload: Payload): Promise<RequiredDataFromCollectionSlug<'pages'>> => {
  const imageBuffer = await fetchFileByURL('https://cdn.iai.tv/assets/Uploads/_resampled/FillWzQwMCwzNjBd/Steven-Bonnell-Destiny-.webp')
  const contributorImage = await payload.create({
    collection: 'media',
    data: { alt: 'Destiny' },
    file: imageBuffer,
  })

  return {
  slug: 'about',
  _status: 'published',
  title: 'About Us',
  hero: {
    type: 'lowImpact',
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'About Our Organization',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Learn more about our mission and the amazing people who make it happen.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
  },
  layout: [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  children: [
                    {
                      type: 'text',
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'Our Mission',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  tag: 'h2',
                  version: 1,
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'Digital Ground Game Policial Action Contributors',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  textFormat: 0,
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      ],
    },
    {
      blockType: 'contributors',
      contributors: [
        {
          name: 'Steven \'Destiny\' Bonnell II',
          bio: 'Streamer',
          image: contributorImage,
          socialLinks: [
            {
              platform: 'instagram',
              url: 'https://instagram.com/destiny',
            },
            {
              platform: 'twitter',
              url: 'https://twitter.com/TheOmniLiberal',
            },
            {
              platform: 'youtube',
              url: 'https://youtube.com/Destiny',
            },
            {
              platform: 'website',
              url:'https://destiny.gg',
            }
          ],
        },
      ],
    },
  ] as any,
  }
}
