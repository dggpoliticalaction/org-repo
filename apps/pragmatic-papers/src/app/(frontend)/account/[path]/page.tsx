import { AccountView } from '@daveyplate/better-auth-ui'
import { accountViewPaths } from '@daveyplate/better-auth-ui/server'

export const dynamicParams = false

export function generateStaticParams(): { path: string }[] {
  return Object.values(accountViewPaths).map((path) => ({ path }))
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>
}): Promise<React.ReactNode> {
  const { path } = await params

  return <AccountView path={path} />
}
