import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import Author from '@/components/Author'

interface Props {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params }: Props): Promise<React.ReactNode> {
  const { slug = '' } = await params

  const payload = await getPayload({ config: configPromise })

  const author = await payload.findByID({
    collection: 'users',
    id: slug,
    select: {
      name: true,
      email: true,
      role: true,
    },
    depth: 2,
  })

  return (
    <div className="flex flex-col items-center">
      <Author id={author.id} name={author.name} role={author.role} email={author.email} />
    </div>
  )
}
