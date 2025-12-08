import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import Link from 'next/link'
import { colors } from '@/styles/colors'

export default async function HomePage(): Promise<React.JSX.Element> {
  const payload = await getPayload({ config: configPromise })
  
  // Fetch homepage settings
  const homepageSettings = await payload.findGlobal({
    slug: 'homepage-settings',
  })

  const numberOfPosts = homepageSettings?.numberOfPosts || 12
  const missionStatement = homepageSettings?.missionStatement || 
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at mauris non velit semper malesuada sed vel nunc. Cras vel lorem non neque dapibus porta.'

  // Fetch real posts from the Posts collection
  const postsResult = await payload.find({
    collection: 'posts',
    limit: numberOfPosts,
    sort: '-createdAt',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const posts = postsResult.docs

  // Helper function to get card background color based on index
  const getCardColor = (index: number) => {
    const colorPattern = [colors.brand.red, colors.brand.white, colors.brand.blue]
    return colorPattern[index % 3]
  }

  // Helper function to get text color based on background
  const getTextColor = (index: number) => {
    const colorIndex = index % 3
    return colorIndex === 1 ? 'text-black' : 'text-white' // White bg gets black text
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Mission Statement */}
      <section 
        className="py-24 px-4"
        style={{ backgroundColor: colors.brand.blue }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h1 
            className="text-5xl md:text-7xl font-bold mb-8 tracking-wider"
            style={{ 
              fontFamily: 'var(--font-departure-mono), monospace',
              color: colors.brand.white 
            }}
          >
            Our Mission Statement
          </h1>
          <p 
            className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap"
            style={{ 
              fontFamily: 'var(--font-apple-ny), Georgia, serif',
              color: colors.brand.white 
            }}
          >
            {missionStatement}
          </p>
        </div>
      </section>

      {/* Latest News Banner */}
      <section className="relative py-8 overflow-hidden" style={{ backgroundColor: colors.brand.red }}>              
        {/* Left chevron */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-24"
          style={{
            backgroundColor: colors.brand.red,
            clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
          }}
        />
        
        {/* Right chevron */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-24"
          style={{
            backgroundColor: colors.brand.red,
            clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
          }}
        />

        <h2 
          className="text-4xl md:text-5xl font-bold text-center tracking-wider"
          style={{ 
            fontFamily: 'var(--font-departure-mono), monospace',
            color: colors.brand.white 
          }}
        >
          Latest News and Events
        </h2>
      </section>

      {/* Posts Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {posts.map((post, index) => {
                const bgColor = getCardColor(index)
                const textColorClass = getTextColor(index)

                //hacky, relies on ordering of getCardColor, works for now
                const isWhiteCard = index % 3 === 1 
                
                // Get post excerpt from meta description or truncate content
                const excerpt = post.meta?.description || 
                  (typeof post.title === 'string' ? post.title : 'Read more...')
                
                return (
                  <article 
                    key={post.id}
                    className={`p-8 min-h-[250px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${textColorClass} ${isWhiteCard ? 'border border-black' : ''}`}
                    style={{ backgroundColor: bgColor }}
                  >
                    <Link href={`/posts/${post.slug}`} className="hover:underline">
                      <p 
                        className="text-lg font-semibold"
                        style={{ fontFamily: 'var(--font-apple-ny), Georgia, serif' }}
                      >
                        {excerpt}
                      </p>
                    </Link>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                No posts available yet. Create some posts in the admin panel!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'DGG Political Action - Home',
    description: 'Welcome to DGG Political Action',
  }
}