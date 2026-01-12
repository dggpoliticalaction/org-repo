import { isUser, isWriter } from '@/access/checkRole'
import type { User } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import { LoginForm } from './LoginForm'

interface LoginProps {
  searchParams: Promise<{ error?: string }>
}

interface AuthResponse {
  user: User | null
  collection: 'users'
  strategy: 'local-jwt'
  exp: number
  token: string
  message: string
}

export default async function Login({ searchParams }: LoginProps): Promise<React.ReactElement> {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  // If user is already logged in, redirect to home
  if (token) {
    const response = await fetch(`${getServerSideURL()}/api/users/me`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    })

    const { user } = (await response.json()) as AuthResponse

    if (user && isWriter(user)) {
      redirect('/admin')
    }

    if (user && isUser(user)) {
      redirect('/')
    }
  }

  const params = await searchParams
  const error = params.error ? decodeURIComponent(params.error) : null

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <LoginForm error={error} />
    </div>
  )
}
