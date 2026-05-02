import type { User } from "@/payload-types"
import type { Access, AccessResult } from "payload"

type Roles = readonly User["role"][]

const adminRoles: Roles = ["admin", "chief-editor"]
const editorRoles: Roles = [...adminRoles, "editor"]
const writerRoles: Roles = [...editorRoles, "writer"]

export const isAdmin = (user: User) => adminRoles.includes(user.role)
export const isEditor = (user: User) => editorRoles.includes(user.role)
export const isWriter = (user: User) => writerRoles.includes(user.role)

// This ensures the user is authenticated before checking an arbitrary access function.
// This can be used for both role and field-level
// If you don't want to require authentication, use Access directly
const accessFor = <TResult extends AccessResult>(access: (user: User) => TResult) => {
  return ({ req: { user } }: { req: { user?: User | null } }) => {
    if (!user) {
      return false
    }

    return access(user)
  }
}

export const admin = accessFor(isAdmin)
export const adminFieldLevel = admin

export const editor = accessFor(isEditor)
export const editorFieldLevel = editor

export const writer = accessFor(isWriter)
export const writerFieldLevel = writer

export const staff = accessFor((user) => Boolean(user.role && user.role !== "member"))
export const anyone: Access = () => true
export const authenticated = accessFor(() => true)

export const adminOrSelf = accessFor((user) => isAdmin(user) || { id: { equals: user.id } })
export const editorOrSelf = accessFor(
  (user) => isEditor(user) || { createdBy: { equals: user.id } },
)

export const authenticatedOrPublished: Access = ({ req: { user } }) =>
  Boolean(user) || { _status: { equals: "published" } }

export const restrictWritersToDraftOnly: Access = ({ req: { user }, data }) => {
  if (!user) {
    return false
  }

  return isEditor(user) || (data?._status !== "published" && { createdBy: { equals: user.id } })
}
