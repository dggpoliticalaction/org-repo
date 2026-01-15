import React from 'react'
import type { Page, Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { Github, Twitter, Linkedin, Facebook, Instagram, Youtube, Globe } from 'lucide-react'

type ContributorsBlockProps = {
  title?: string
  contributors: Array<{
    name: string
    bio?: string
    image?: MediaType
    socialLinks?: SocialLink[]
    id?: string
  }>
}

type SocialLink = {
  platform: keyof typeof platformIcons
  url: string
  id?: string
}

type Contributor = ContributorsBlockProps['contributors'][number]

const platformIcons = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  website: Globe,
}

export const ContributorsBlock: React.FC<ContributorsBlockProps> = ({ title, contributors }) => {
  return (
    <div className="container my-16">
      {title && <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contributors?.map((contributor: Contributor, index: number) => {
          const { name, bio, image, socialLinks } = contributor

          return (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 flex flex-col items-center text-center"
            >
              {image && typeof image === 'object' && 'url' in image && (
                <div className="mb-4 w-32 h-32 rounded-full overflow-hidden">
                  <Media
                    resource={image as typeof image}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h3 className="text-xl font-semibold mb-2">{name}</h3>

              {bio && <p className="text-sm text-muted-foreground mb-4">{bio}</p>}

              {socialLinks && socialLinks.length > 0 && (
                <div className="flex gap-3 mt-auto">
                  {socialLinks.map((link: SocialLink, linkIndex: number) => {
                    const { platform, url } = link
                    const Icon = platformIcons[platform as keyof typeof platformIcons]

                    return (
                      <a
                        key={linkIndex}
                        href={url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                        aria-label={`${name}'s ${platform}`}
                      >
                        {Icon && <Icon className="w-5 h-5" />}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
