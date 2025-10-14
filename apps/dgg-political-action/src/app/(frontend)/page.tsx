import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  
  // Fetch the header global to get the logo
  const header = await payload.findGlobal({
    slug: 'header',
  })
  
  // Fetch the 10 most recent published posts
  const posts = await payload.find({
    collection: 'posts',
    limit: 10,
    sort: '-createdAt',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return (
    <div className="pt-16 pb-24">
      {/* Hero Section with Logo and Org Name */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center space-y-4">
          {header.logo && typeof header.logo !== 'string' && (
            <div className="w-48 h-auto">
              <Media resource={header.logo} />
            </div>
          )}
          <h1 className="text-4xl font-bold">DGG Political Action</h1>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
            irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
            deserunt mollit anim id est laborum.
          </p>
        </div>
      </section>

      {/* Latest News/Events/Highlights */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Latest Highlights</h2>
          
          {posts.docs && posts.docs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.docs.map((post) => (
                <article key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">
                    <Link href={`/posts/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  
                  {post.meta?.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {post.meta.description}
                    </p>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No posts available yet.</p>
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