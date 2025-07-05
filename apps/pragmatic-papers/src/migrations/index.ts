import * as migration_20250703_194534_init from './20250703_194534_init'
import * as migration_20250705_042423_volume_update from './20250705_042423_volume_update'
import * as migration_20250705_185916_add_media_access_control from './20250705_185916_add_media_access_control'
import * as migration_20250705_213213_remove_unused_volume_relation from './20250705_213213_remove_unused_volume_relation'

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
  {
    up: migration_20250705_185916_add_media_access_control.up,
    down: migration_20250705_185916_add_media_access_control.down,
    name: '20250705_185916_add_media_access_control',
  },
  {
    up: migration_20250705_213213_remove_unused_volume_relation.up,
    down: migration_20250705_213213_remove_unused_volume_relation.down,
    name: '20250705_213213_remove_unused_volume_relation',
  },
]
