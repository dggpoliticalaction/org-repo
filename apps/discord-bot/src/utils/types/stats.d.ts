import type { Stats } from '@/services';

type StatPerInterval = {
  date: string
  count: number
}[]

type StatsResolverType = {
  name: string
  data: (statsHelper: Stats, days: number) => Promise<StatPerInterval>
}[]
