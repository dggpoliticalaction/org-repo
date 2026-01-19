import * as migration_20251019_230422 from './20251019_230422';
import * as migration_20251020_001030 from './20251020_001030';
import * as migration_20251023_222552 from './20251023_222552';
import * as migration_20260119_011924 from './20260119_011924';
import * as migration_20260119_014455 from './20260119_014455';

export const migrations = [
  {
    up: migration_20251019_230422.up,
    down: migration_20251019_230422.down,
    name: '20251019_230422',
  },
  {
    up: migration_20251020_001030.up,
    down: migration_20251020_001030.down,
    name: '20251020_001030',
  },
  {
    up: migration_20251023_222552.up,
    down: migration_20251023_222552.down,
    name: '20251023_222552',
  },
  {
    up: migration_20260119_011924.up,
    down: migration_20260119_011924.down,
    name: '20260119_011924',
  },
  {
    up: migration_20260119_014455.up,
    down: migration_20260119_014455.down,
    name: '20260119_014455'
  },
];
