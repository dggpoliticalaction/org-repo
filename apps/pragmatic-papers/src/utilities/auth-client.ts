import { createAuthClient } from 'better-auth/client'
const authClient = createAuthClient()

const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: 'discord',
  })
}
