import type { User } from "@/payload-types"
import type { Access, AccessArgs, FieldAccess, PayloadRequest } from "payload"

// Admin/Chief Editor > Editor > Writer
export const isAdmin = (user: User): boolean => {
  return user.role === "admin" || user.role === "chief-editor"
}

export const isEditor = (user: User): boolean => {
  return user.role === "editor" || isAdmin(user)
}

export const isWriter = (user: User): boolean => {
  return user.role === "writer" || isEditor(user)
}

export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  return (
    isAdmin(user) || {
      id: { equals: user.id },
    }
  )
}

export const admin: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }
  return isAdmin(user)
}

export const adminFieldLevel: FieldAccess = ({ req: { user } }) => {
  if (!user) {
    return false
  }
  return isAdmin(user)
}

export const anyone: Access = () => true

type isAuthenticated = (args: AccessArgs<User>) => boolean

export const authenticated: isAuthenticated = ({ req: { user } }) => {
  return Boolean(user)
}

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) {
    return true
  }

  return {
    _status: {
      equals: "published",
    },
  }
}

export const editor: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }
  return isEditor(user)
}

export const editorFieldLevel: FieldAccess = ({ req: { user } }) => {
  if (!user) {
    return false
  }
  return isEditor(user)
}

export const editorOrSelf: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  return (
    isEditor(user) || {
      createdBy: { equals: user.id },
    }
  )
}

export const restrictWritersToDraftOnly: Access = ({ req: { user }, data }) => {
  if (!user) {
    return false
  }

  return isEditor(user) || (data?._status !== "published" && { createdBy: { equals: user.id } })
}

// Anyone User who's role is not "member" can access this collection
export const staff = ({ req: { user } }: { req: PayloadRequest }): boolean => {
  if (!user) return false
  if (!user.role) return false
  return user.role !== "member"
}

export const writer: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }
  return isWriter(user)
}

export const writerFieldLevel: FieldAccess = ({ req: { user } }) => {
  if (!user) {
    return false
  }
  return isWriter(user)
}
