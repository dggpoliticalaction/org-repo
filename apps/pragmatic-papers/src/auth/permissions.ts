import { createAccessControl } from 'better-auth/plugins/access'

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
  adminDashboard: ['read'],
} as const

export const ac = createAccessControl(statement)

export const user = ac.newRole({
  adminDashboard: [],
})

export const writer = ac.newRole({
  adminDashboard: ['read'],
})

export const editor = ac.newRole({
  adminDashboard: ['read'],
})

export const chiefEditor = ac.newRole({
  adminDashboard: ['read'],
})

export const admin = ac.newRole({
  adminDashboard: ['read'],
})
