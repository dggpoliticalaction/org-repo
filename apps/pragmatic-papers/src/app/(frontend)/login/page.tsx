import { Button } from '@/components/ui/button'
import React from 'react'
import { discordLogin } from './actions'

export default async function Login(): Promise<React.ReactElement> {
  // const session = await auth.api.getSession({ headers: await headers() })

  // if (session) {
  //   redirect('/')
  // }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <form action={discordLogin}>
        <Button type="submit">Continue with Discord</Button>
      </form>
      {/* <form action={googleLogin}>
        <Button type="submit">Continue with Google</Button>
      </form> */}
    </div>
  )
}
