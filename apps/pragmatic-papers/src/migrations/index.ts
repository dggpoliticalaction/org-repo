import * as migration_20250703_194534_init from './20250703_194534_init'

export const migrations = [
  {
    up: migration_20250703_194534_init.up,
    down: migration_20250703_194534_init.down,
    name: '20250703_194534_init',
  },
]
