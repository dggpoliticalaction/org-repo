import * as migration_20250703_194534_init from './20250703_194534_init'
import * as migration_20250705_042423_volume_update from './20250705_042423_volume_update'
import * as migration_20250705_185916_add_media_access_control from './20250705_185916_add_media_access_control'
import * as migration_20250705_213213_remove_unused_volume_relation from './20250705_213213_remove_unused_volume_relation'
import * as migration_20250707_010714_remove_posts from './20250707_010714_remove_posts'
import * as migration_20250708_020740_update_payload from './20250708_020740_update_payload'
import * as migration_20250708_042411_update_media_image_sizes from './20250708_042411_update_media_image_sizes'

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
  {
    up: migration_20250707_010714_remove_posts.up,
    down: migration_20250707_010714_remove_posts.down,
    name: '20250707_010714_remove_posts',
  },
  {
    up: migration_20250708_020740_update_payload.up,
    down: migration_20250708_020740_update_payload.down,
    name: '20250708_020740_update_payload',
  },
  {
    up: migration_20250708_042411_update_media_image_sizes.up,
    down: migration_20250708_042411_update_media_image_sizes.down,
    name: '20250708_042411_update_media_image_sizes',
  },
]
