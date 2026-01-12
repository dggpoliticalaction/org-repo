import { getServerSideURL } from '@/utilities/getURL'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import { LoginForm } from './LoginForm'

interface LoginProps {
  searchParams: Promise<{ error?: string }>
}

export default async function Login({ searchParams }: LoginProps): Promise<React.ReactElement> {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  // If user is already logged in, redirect to home
  if (token) {
    const meUserReq = await fetch(`${getServerSideURL()}/api/users/me`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    })

    if (meUserReq.ok) {
      redirect('/')
    }
  }

  const params = await searchParams
  const error = params.error ? decodeURIComponent(params.error) : null

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoginForm error={error} />
    </div>
  )
}
