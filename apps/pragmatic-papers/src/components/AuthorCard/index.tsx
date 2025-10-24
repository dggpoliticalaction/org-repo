import Link from 'next/link'
import { type ReactNode } from 'react'

interface AuthorCardProps {
  id: number
  name?: string | null | undefined
  role?: ('admin' | 'chief-editor' | 'editor' | 'writer' | 'user') | null | undefined
  email: string
}

export default function AuthorCard(props: AuthorCardProps): ReactNode {
  return (
    <Link
      href={`/authors/${props.id}`}
      className="rounded-lg cursor-pointer bg-card p-4 border border-border hover:bg-transparent duration-100 flex flex-col gap-2"
    >
      <h2 className="text-2xl font-bold">{props.name}</h2>
      <div>
        <p className="text-gray-600">{props.email}</p>
        {props.role && <p>{props.role}</p>}
      </div>
    </Link>
  )
}
