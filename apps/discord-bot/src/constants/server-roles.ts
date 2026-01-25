export interface ServerRole {
  id: string
  name: string
}

export const ServerRoles = {
  COORDINATOR: {
    id: '1347653968641134683',
    name: 'Coordinator',
  },
  TEAM_LEAD: {
    id: '1385639570007396524',
    name: 'Team Lead',
  },
  ORGANIZER: {
    id: '1356880811156307988',
    name: 'Organizer',
  },
  DIRECTOR: {
    id: '1356880586916102197',
    name: 'Director',
  },
  ADMIN: {
    id: '1347656064900006000',
    name: 'Admin',
  },
} as const

export function getRoleById(roleId: string): ServerRole | undefined {
  return Object.values(ServerRoles).find((role) => role.id === roleId)
}

export function getRoleNameById(roleId: string): string {
  return getRoleById(roleId)?.name ?? 'Unknown Role'
}