const PREFIX = '[TTFB-TIMING]'

export async function timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const duration = (performance.now() - start).toFixed(1)
  // eslint-disable-next-line no-console
  console.log(`${PREFIX} ${label}: ${duration}ms`)
  return result
}
