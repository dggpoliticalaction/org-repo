import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Author from '@/components/Author'

export default async function Page(): Promise<React.ReactNode> {
  const payload = await getPayload({ config: configPromise })

  const authors = await payload.find({
    collection: 'users',
    limit: 20,
    depth: 2,
    overrideAccess: true,
    select: {
      name: true,
      email: true,
      role: true,
      socialInstagram: true,
      socialReddit: true,
      socialTiktok: true,
      socialTwitter: true,
      socialYoutube: true,
    },
  })

  return (
    <div className="flex flex-col gap-8 items-center">
      <h1 className="text-4xl font-bold">Authors</h1>

      <div className="flex flex-col gap-4">
        {authors.docs.map((author) => (
          <Author
            key={author.id}
            id={author.id}
            name={author.name}
            email={author.email}
            role={author.role}
            socialTiktok={author.socialTiktok}
            socialTwitter={author.socialTwitter}
            socialYoutube={author.socialYoutube}
            socialInstagram={author.socialInstagram}
            socialReddit={author.socialReddit}
          />
        ))}
      </div>
    </div>
  )
}
