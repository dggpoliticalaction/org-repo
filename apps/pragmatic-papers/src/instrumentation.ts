/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'edge') return
  // Node-only code is required lazily so Edge analysis doesn't traverse it
  require('./instrumentation.node').register()
}
