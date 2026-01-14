import { sqlitePathFromUri } from '@/utilities/sqlitePathFromUri'
import Database from 'better-sqlite3'

/**
 * Creates Better Auth core schema tables if they don't exist:
 * user, session, account, verification
 *
 * Call this AFTER Payload has initialized/created its tables.
 */
export async function ensureBetterAuthTables(): Promise<void> {
  let db: Database.Database | null = null

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Bootstrap auth schema is not supported in production')
    // db = new Database(POSTGRES_ADAPTER)
  } else if (process.env.NODE_ENV === 'development') {
    db = new Database(sqlitePathFromUri(process.env.DATABASE_URI))
  }

  if (!db) {
    throw new Error('Database connection not found')
  }

  // Ensure FK constraints are enforced in SQLite
  db.pragma('foreign_keys = ON')

  const run = db.transaction(() => {
    // --- user ---
    db.exec(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id"            TEXT      NOT NULL PRIMARY KEY,
        "name"          TEXT      NOT NULL,
        "email"         TEXT      NOT NULL UNIQUE,
        "emailVerified" INTEGER   NOT NULL, -- SQLite boolean (0/1)
        "image"         TEXT,
        "createdAt"     TIMESTAMP NOT NULL,
        "updatedAt"     TIMESTAMP NOT NULL
      );
    `)

    // --- session ---
    db.exec(`
      CREATE TABLE IF NOT EXISTS "session" (
        "id"        TEXT      NOT NULL PRIMARY KEY,
        "userId"    TEXT      NOT NULL,
        "token"     TEXT      NOT NULL UNIQUE,
        "expiresAt" TIMESTAMP NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE
      );
    `)

    // --- account ---
    db.exec(`
      CREATE TABLE IF NOT EXISTS "account" (
        "id"                    TEXT      NOT NULL PRIMARY KEY,
        "userId"                TEXT      NOT NULL,
        "accountId"             TEXT      NOT NULL,
        "providerId"            TEXT      NOT NULL,
        "accessToken"           TEXT,
        "refreshToken"          TEXT,
        "accessTokenExpiresAt"  TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        "scope"                 TEXT,
        "idToken"               TEXT,
        "password"              TEXT,
        "createdAt"             TIMESTAMP NOT NULL,
        "updatedAt"             TIMESTAMP NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE
      );
    `)

    // --- verification ---
    db.exec(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id"         TEXT      NOT NULL PRIMARY KEY,
        "identifier" TEXT      NOT NULL,
        "value"      TEXT      NOT NULL,
        "expiresAt"  TIMESTAMP NOT NULL,
        "createdAt"  TIMESTAMP,
        "updatedAt"  TIMESTAMP
      );
    `)

    db.exec(`
      CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");
      CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");
      CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");
    `)
  })

  run()
}
