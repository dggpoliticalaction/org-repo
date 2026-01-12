import { logout } from './actions'

export default async function LogoutPage(): Promise<void> {
  await logout()
}
