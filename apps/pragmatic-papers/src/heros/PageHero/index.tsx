import React from 'react'

import type { Page } from '@/payload-types'

import RichText from '@/components/RichText'

import { Open_Sans } from 'next/font/google'

const openSans = Open_Sans({
  subsets: ['latin'],
})

type PageHeroType =
  | {
      children?: React.ReactNode
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const PageHero: React.FC<PageHeroType> = ({ children, richText }) => {
  return (
    <div className="flex justify-center">
      <div className="max-w-[48rem] [&_h1]:text-transparent [&_h1]:text-stroke-2 [&_h1]:text-stroke-brandLight [&_h1]:text-8xl [&_h1]:font-bold text-center">
        {children ||
          (richText && (
            <RichText data={richText} enableGutter={false} className={openSans.className} />
          ))}
      </div>
    </div>
  )
}
