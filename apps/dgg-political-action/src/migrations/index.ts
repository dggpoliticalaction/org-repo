import * as migration_20251019_230422 from './20251019_230422';
import * as migration_20251020_001030 from './20251020_001030';

export const migrations = [
  {
    up: migration_20251019_230422.up,
    down: migration_20251019_230422.down,
    name: '20251019_230422',
  },
  {
    up: migration_20251020_001030.up,
    down: migration_20251020_001030.down,
    name: '20251020_001030'
  },
];
