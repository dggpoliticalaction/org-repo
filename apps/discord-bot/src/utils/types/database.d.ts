import type { SqliteDriver, SqlEntityManager } from '@mikro-orm/sqlite';

interface DatabaseSize {
  db: number | null
  backups: number | null
}

type DatabaseDriver = SqliteDriver
type DatabaseEntityManager = SqlEntityManager
