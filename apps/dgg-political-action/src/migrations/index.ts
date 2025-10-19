import * as migration_20251019_230422 from './20251019_230422';

export const migrations = [
  {
    up: migration_20251019_230422.up,
    down: migration_20251019_230422.down,
    name: '20251019_230422'
  },
];
