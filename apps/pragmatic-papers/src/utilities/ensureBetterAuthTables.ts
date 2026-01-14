import { authConfig } from '@/utilities/auth'
import { sqlitePathFromUri } from '@/utilities/sqlitePathFromUri'
import { getMigrations } from 'better-auth/db'
import Database from 'better-sqlite3'

/* eslint-disable no-console */

/**
 * Creates Better Auth core schema tables if they don't exist:
 * user, session, account, verification
 *
 * Call this AFTER Payload has initialized/created its tables.
 */
export async function ensureBetterAuthTables(): Promise<void> {
  console.log(' ○ Loading Auth database migrations...')

  let db: Database.Database | null = null

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Bootstrap auth schema is not supported in production')
    // db = new Database(POSTGRES_ADAPTER)
  } else {
    db = new Database(sqlitePathFromUri(process.env.DATABASE_URI))
  }

  if (!db) {
    throw new Error(' \x1b[31m✗\x1b[0m Database connection not found')
  }

  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(authConfig)
  if (!toBeCreated.length && !toBeAdded.length) {
    return console.log(' \x1b[32m✓\x1b[0m No Auth migrations not required')
  }

  await runMigrations()
  console.log(' \x1b[32m✓\x1b[0m Auth database migrations complete')
}
