import * as migration_20250703_194534_init from './20250703_194534_init'
import * as migration_20250705_042423_volume_update from './20250705_042423_volume_update'

export const migrations = [
  {
    up: migration_20250703_194534_init.up,
    down: migration_20250703_194534_init.down,
    name: '20250703_194534_init',
  },
  {
    up: migration_20250705_042423_volume_update.up,
    down: migration_20250705_042423_volume_update.down,
    name: '20250705_042423_volume_update',
  },
]
