// @ts-nocheck
import 'reflect-metadata';
import 'dotenv/config';

import process from 'node:process';

import { type DatabaseDriver, defineConfig, type Options } from '@mikro-orm/core';

import { mikroORMConfig } from './src/configs/database';

export default async () => {
  return defineConfig({
    ...(mikroORMConfig[process.env.NODE_ENV || 'development'] as Options<DatabaseDriver>),
    entities: ['src/entities/*.{ts,js}', 'src/plugins/*/entities/*.{ts,js}'],
  });
};
