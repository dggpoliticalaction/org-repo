import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const Config = require('../../config/config.json')

export interface ServerRole {
  id: string
  name: string
}

export type RoleKey =
    | "COORDINATOR"
    | "TEAM_LEAD"
    | "ORGANIZER"
    | "DIRECTOR"
    | "ADMIN"

export const ServerRoles: Record<RoleKey, ServerRole> = Config.roles

export function getRoleById(roleId: string): ServerRole | undefined {
  return Object.values(ServerRoles).find((role) => role.id === roleId)
}

export function getRoleNameById(roleId: string): string {
  return getRoleById(roleId)?.name ?? 'Unknown Role'
}