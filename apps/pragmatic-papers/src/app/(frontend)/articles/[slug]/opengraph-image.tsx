import configPromise from '@payload-config'
import { ImageResponse } from 'next/og'
import { getPayload } from 'payload'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Article Open Graph Image'

const FONT_SIZE_SHORT = 64 // titles up to 50 characters
const FONT_SIZE_MEDIUM = 52 // titles 51–80 characters
const FONT_SIZE_LONG = 44 // titles over 80 characters
const TITLE_LENGTH_MEDIUM_THRESHOLD = 50
const TITLE_LENGTH_LONG_THRESHOLD = 80

// Branded background: red DGG logo on the left, white content box on the right.
// White box occupies x≈345–1145, y≈40–587 within the 1200×630 canvas.
const OG_BACKGROUND_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><g><rect width="1200" height="630" style="fill:#ff401a;"/><path d="M159.03,40.13l-104.03-.02v546.52h105.35v-213.33c79.67,0,142.87-51.35,142.87-160.66v-11.86c0-109.29-63.87-160.66-144.2-160.66Z" style="fill:#fff;"/><path d="M195.91,156.68v99.43c0,34.89-11.86,48.06-28.98,48.06h-6.58V108.62h6.58c17.12,0,28.98,13.17,28.98,48.06Z" style="fill:#ff401a;"/><rect x="345.25" y="40.13" width="799.75" height="546.48" style="fill:#fff;"/></g><g><path d="M1094.56,534.94c.66,2.82.75,5.82.75,8.72v4.13c0,2.16.84,3.47,2.44,3.47,1.69,0,2.91-1.31,2.91-4.41,0-5.25-2.72-12.39-6.94-19.61l-2.72-4.41c-4.6-7.69-9.76-14.82-9.76-24.67s6.38-16.7,16.89-16.7,16.6,6.38,16.6,17.83v7.51h-13.04c-.66-2.82-.75-5.82-.75-8.72v-3.28c0-2.06-.84-3.38-2.44-3.38-1.69,0-2.91,1.31-2.91,4.41,0,4.78,2.53,10.41,6.76,17.54l2.81,4.41c4.6,7.79,9.85,16.6,9.85,26.64s-6.29,16.79-16.89,16.79-16.61-6.38-16.61-18.01v-8.26h13.04Z"/><path d="M1079.75,504.26v-1.69c0-12.67-8.26-20.17-20.45-20.17h-14.82s0,77.87,0,77.87h14.92v-31.43c3.1,0,4.03,2.35,4.13,6.19l.38,13.32c.09,5.16.56,9.1,1.69,11.92h14.17v-.94c-1.31-2.44-1.78-5.44-1.88-12.2l-.19-7.51c-.19-8.54-1.69-12.76-7.51-15.95v-.94c6.19-3.66,9.57-9.57,9.57-18.48ZM1064.46,511.86c0,5.25-1.59,7.22-4.13,7.22h-.94v-26.92h.94c2.53,0,4.13,1.97,4.13,7.13v12.57Z"/><polygon points="1013.53 482.4 1041.49 482.4 1041.49 494.13 1028.73 494.13 1028.73 515.05 1039.71 515.05 1039.71 526.78 1028.73 526.78 1028.73 548.54 1041.49 548.54 1041.49 560.27 1013.53 560.27 1013.53 482.4"/><path d="M990.66,482.4h-14.82s0,77.87,0,77.87h15.01v-30.4c11.35,0,20.36-7.32,20.36-22.89v-1.69c0-15.57-9.1-22.89-20.55-22.89ZM995.92,513.17c0,4.97-1.69,6.85-4.13,6.85h-.94v-27.86h.94c2.44,0,4.13,1.88,4.13,6.85v14.17Z"/><path d="M966.31,482.4h-22.14l-7.04,76.93v.94h13.14l1.22-19.14h6l1.22,19.14h14.64v-.94l-7.04-76.93ZM952.24,529.31l1.78-27.68h.94l1.78,27.68h-4.5Z"/><path d="M918.8,482.4h-14.82s0,77.87,0,77.87h15.01v-30.4c11.35,0,20.36-7.32,20.36-22.89v-1.69c0-15.57-9.1-22.89-20.55-22.89ZM924.06,513.17c0,4.97-1.69,6.85-4.13,6.85h-.94v-27.86h.94c2.44,0,4.13,1.88,4.13,6.85v14.17Z"/><path d="M835.61,482.4h51.45v77.87h-51.45v-77.87Z" style="fill:#ff401a;"/><path d="M781.27,512.14c0-21.2,7.6-30.68,19.61-30.68s17.64,9.2,17.64,24.02v6.01h-14.26c-.66-2.82-.75-6.1-.75-9.39v-7.03c0-2.16-.84-3.56-2.53-3.56s-2.63,1.41-2.63,3.66v52.35c0,2.25.94,3.66,2.63,3.66s2.53-1.41,2.53-3.56v-7.51c0-3.28.09-6.57.75-9.38h14.26v6.47c0,14.83-5.91,24.02-17.64,24.02s-19.61-9.48-19.61-30.68v-18.39Z"/><rect x="762.88" y="482.4" width="15.2" height="77.87"/><polygon points="726.27 482.4 760.14 482.4 760.14 494.13 750.76 494.13 750.76 560.27 735.56 560.27 735.56 494.12 726.27 494.12 726.27 482.4"/><path d="M722.52,482.4h-22.14l-7.04,76.93v.94h13.13l1.22-19.14h6l1.22,19.14h14.64v-.94l-7.04-76.93ZM708.44,529.31l1.78-27.68h.94l1.78,27.68h-4.5Z"/><polygon points="644.56 482.4 661.54 482.4 667.27 526.78 668.21 526.78 673.93 482.4 690.91 482.4 690.91 560.28 677.87 560.28 678.43 521.53 677.49 521.53 671.86 560.28 663.61 560.28 657.98 521.53 657.04 521.53 657.6 560.28 644.56 560.28 644.56 482.4"/><path d="M603.89,510.83c0-20.08,7.32-29.37,19.42-29.37s17.64,9.2,17.64,23.36v6.66h-14.17c-.66-2.82-.75-6.1-.75-9.38v-7.03c0-2.16-.84-3.56-2.53-3.56-1.78,0-2.63,1.41-2.63,3.66v51.6c0,2.25.84,3.66,2.63,3.66,1.69,0,2.53-1.41,2.53-3.57v-23.36h14.92v36.78h-8.54l-1.97-6.85h-.94c-.94,3.94-3.28,7.6-9.66,7.6-9.29,0-15.95-9.1-15.95-28.05v-22.14Z"/><path d="M596.74,482.4h-22.14l-7.04,76.93v.94h13.13l1.22-19.14h6l1.22,19.14h14.64v-.94l-7.04-76.93ZM582.66,529.31l1.78-27.68h.94l1.78,27.68h-4.5Z"/><path d="M566.35,504.26v-1.69c0-12.67-8.26-20.17-20.45-20.17h-14.82s0,77.87,0,77.87h14.92v-31.43c3.1,0,4.03,2.35,4.13,6.19l.37,13.32c.09,5.16.56,9.1,1.69,11.92h14.17v-.94c-1.31-2.44-1.78-5.44-1.88-12.2l-.19-7.51c-.19-8.54-1.69-12.76-7.51-15.95v-.94c6.19-3.66,9.57-9.57,9.57-18.48ZM551.06,511.86c0,5.25-1.59,7.22-4.13,7.22h-.94v-26.92h.94c2.53,0,4.13,1.97,4.13,7.13v12.57Z"/><path d="M508.21,482.4h-14.82s0,77.87,0,77.87h15.01v-30.4c11.35,0,20.36-7.32,20.36-22.89v-1.69c0-15.57-9.1-22.89-20.55-22.89ZM513.46,513.17c0,4.97-1.69,6.85-4.13,6.85h-.94v-27.86h.94c2.44,0,4.13,1.88,4.13,6.85v14.17Z"/><polygon points="450.65 482.4 478.61 482.4 478.61 494.13 465.85 494.13 465.85 515.05 476.83 515.05 476.83 526.78 465.86 526.78 465.86 548.54 478.61 548.54 478.61 560.27 450.65 560.27 450.65 482.4"/><polygon points="411.85 482.4 426.86 482.4 426.86 515.05 431.93 515.05 431.93 482.4 446.94 482.4 446.94 560.27 431.93 560.27 431.93 526.87 426.86 526.87 426.86 560.27 411.85 560.27 411.85 482.4"/><polygon points="375.24 482.4 409.11 482.4 409.11 494.13 399.73 494.13 399.73 560.27 384.53 560.27 384.53 494.12 375.24 494.12 375.24 482.4"/></g></svg>'

const OG_BACKGROUND_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(OG_BACKGROUND_SVG).toString('base64')}`

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<ImageResponse> {
  const { slug } = await params

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'articles',
    draft: false,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      slug: { equals: slug },
    },
    select: {
      title: true,
      meta: true,
    },
  })

  const article = result.docs?.[0]
  const title = article?.meta?.title || article?.title || 'The Pragmatic Papers'

  const fontSize =
    title.length > TITLE_LENGTH_LONG_THRESHOLD
      ? FONT_SIZE_LONG
      : title.length > TITLE_LENGTH_MEDIUM_THRESHOLD
        ? FONT_SIZE_MEDIUM
        : FONT_SIZE_SHORT

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* SVG background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={OG_BACKGROUND_DATA_URL}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
        {/* Title text in the white box (x≈345, y≈40, w≈800, h≈547) */}
        <div
          style={{
            position: 'absolute',
            left: '345px',
            top: '40px',
            width: '800px',
            height: '547px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 56px',
          }}
        >
          <span
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              color: '#1a1a1a',
              textAlign: 'center',
              lineHeight: 1.25,
            }}
          >
            {title}
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
